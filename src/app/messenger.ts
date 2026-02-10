import { Queue } from 'typescript-collections';
import { getWsUrl } from './url';
import { NetworkInterface } from './network-interface';
import { P2PTransport } from './p2p-transport';
import { environment } from '../environments/environment';

export enum MessageType {
    // General
    Info,
    ClientError,
    Connect,
    Ping,

    // Accounts
    AnonymousLogin,
    LoginResponce,
    SetDeck,

    // Queuing
    JoinQueue,
    ExitQueue,
    QueueJoined,
    StartGame,
    NewPrivateGame,
    JoinPrivateGame,
    CancelPrivateGame,
    PrivateGameReady,
    TransferScenario,

    // In Game
    GameEvent,
    GameEvents,
    GameAction,
}

export interface Message {
    source: string;
    type: MessageType;
    data: any;
}

// Minimum time before attempting to reconnect again;
const minConnectTime = 1000 * 5;
const autoReconnectTime = 1000 * 10;
const pingTime = 1000 * 15;

/**
 * Used to communicate via websockets.
 *
 */
export class Messenger implements NetworkInterface {
    private handlers: Map<MessageType, (msg: Message) => void>;
    private ws: WebSocket | undefined;
    private messageQueue: Queue<string> = new Queue<string>();
    private lastConnectAttempt = 0;
    private id: string | undefined;
    private enabled = true;
    private maxConnectAttempts = Infinity;

    private loggedIn = false;
    public connectChange: (status: boolean) => void = () => null;

    constructor(
        private url = getWsUrl()
    ) {
        this.handlers = new Map();
    }

    public isConnected(): boolean {
        if (this.p2p) {
            return this.p2p.isConnected();
        }
        return this.ws !== undefined && this.ws.readyState === this.ws.OPEN;
    }

    public setP2PTransport(p2p: P2PTransport | null) {
        if (this.p2p) {
            this.p2p.destroy();
        }
        this.p2p = p2p;
        if (this.p2p) {
            // Switch to P2P mode
            // We should probably close WS if it's open, or just ignore it
            this.close();

            this.p2p.connected$.subscribe(connected => {
                this.onConnectChange(connected);
            });
            this.p2p.data$.subscribe(data => {
                this.handleMessage({ data: data } as MessageEvent); // handleMessage expects MessageEvent
            });

            // Trigger initial state
            this.onConnectChange(this.p2p.isConnected());
        } else {
            // Revert to WS mode
            // We might need to restart WS connection logic
            this.connect();
        }
    }

    private p2p: P2PTransport | null = null;

    public setID(id: string) {
        this.id = id;
        this.connect();
    }

    public close() {
        if (this.ws) {
            this.ws.close();
        }
    }

    public startConnection(maxConnectAttempts?: number) {
        this.maxConnectAttempts = maxConnectAttempts !== undefined ? maxConnectAttempts : this.maxConnectAttempts;

        // Firefox does not allow you to open a connection via the ws protocol if the page is served via https
        // So if we try to do that, abort
        if (
            location.href.startsWith('https://') &&
            this.url.startsWith('ws://') &&
            navigator.userAgent.search('Firefox') !== -1
        ) {
            console.warn(
                'Cannot connect to ws from https page on Firefox, abort connection'
            );
            this.enabled = false;
            return;
        }
        setInterval(() => {
            if (this.p2p) return; // Don't auto-reconnect WS if in P2P mode

            if (!this.id || !this.ws || this.ws.readyState === this.ws.OPEN) {
                return;
            }
            console.log('Attempting automatic reconnect');
            this.connect();
        }, autoReconnectTime);
        setInterval(
            () => this.sendMessageToServer(MessageType.Ping, {}),
            pingTime
        );
        this.connect();
    }

    private connect() {
        if (this.p2p) return; // Block WS connect if P2P
        if (environment.serverless) return; // Block WS if serverless

        if (!this.enabled) {
            return;
        }
        if (
            Date.now() - this.lastConnectAttempt < minConnectTime ||
            this.maxConnectAttempts <= 0
        ) {
            return;
        }
        this.lastConnectAttempt = Date.now();
        const url = this.url;
        this.ws = new WebSocket(url);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onopen = () => this.onConnect();
        this.ws.onclose = () => this.onConnectChange(false);
        this.maxConnectAttempts--;
    }

    private emptyMessageQueue() {
        if (!this.ws && !this.p2p) {
            return;
        }

        while (!this.messageQueue.isEmpty()) {
            const msg = this.messageQueue.dequeue();
            if (msg === undefined) break;

            if (this.p2p) {
                try {
                    const obj = JSON.parse(msg);
                    this.p2p.send(obj);
                } catch (e) {
                    this.p2p.send(msg);
                }
            } else if (this.ws) {
                this.ws.send(msg);
            }
        }
    }

    private onConnect() {
        this.onConnectChange(true);
        this.sendMessageToServer(MessageType.Connect, {});
        console.log('Connected, requesting queued messages.');
        if (this.loggedIn) {
            this.emptyMessageQueue();
        }
    }

    private onConnectChange(isConnected: boolean) {
        if (!isConnected) {
            console.warn('Multiplayer connection lost');
        } else {
            console.log('now connected');
        }
        this.connectChange(isConnected);
    }

    private handleMessage(ev: MessageEvent) {
        // P2P passes object directly usually, but handleMessage expects MessageEvent
        // We can check if ev is MessageEvent or just data
        const data = (ev.data !== undefined) ? ev.data : ev;

        const message = this.readMessage(data);
        if (!message) {
            return;
        }
        if (!(message.data && message.type !== undefined)) {
            // We relax the check for P2P messages which might lack source
            // But we really need type and data.
            console.error('Invalid message', message);
            return;
        }
        const cb = this.handlers.get(message.type);
        if (cb) {
            cb(message);
        } else {
            console.error(
                'No handler for message type',
                message.type,
                'in',
                message
            );
        }
    }

    private readMessage(data: any): Message | null {
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                if (typeof parsed.type === 'string') {
                    parsed.type = MessageType[parsed.type];
                }
                return parsed as Message;
            } catch (e) {
                console.error('Could not parse message json');
                return null;
            }
        } else {
            // Already an object (from P2P)
            if (typeof data.type === 'string') {
                // Parse string "Connect" to MessageType.Connect (3)
                data.type = MessageType[data.type];
            }
            // If data.type is number (e.g. 3), it stays 3.
            return data as Message;
        }
    }

    private makeMessage(
        messageType: MessageType,
        data: string | object
    ): string {
        return JSON.stringify({
            type: MessageType[messageType],
            data: data,
            source: this.id,
        });
    }

    public addHandler(
        messageType: MessageType,
        callback: (message: Message) => void,
        context?: any
    ) {
        if (context) {
            callback = callback.bind(context);
        }
        this.handlers.set(messageType, callback);
    }

    public sendMessageToServer(
        messageType: MessageType,
        data: string | object
    ) {
        if (this.p2p && this.p2p.isConnected()) {
            // Construct message object directly for P2P
            const msg = {
                type: MessageType[messageType],
                data: data,
                source: this.id
            };
            this.p2p.send(msg);
        } else {
            const message = this.makeMessage(messageType, data);
            if (this.ws && this.ws.readyState === this.ws.OPEN) {
                this.ws.send(message);
            } else {
                this.messageQueue.add(message);
                this.connect();
            }
        }
    }
}

