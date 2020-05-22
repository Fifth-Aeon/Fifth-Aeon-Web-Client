import { Queue } from 'typescript-collections';
import { getWsUrl } from './url';

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
export class Messenger {
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
        if (!this.ws) {
            return;
        }
        for (const msg = this.messageQueue.dequeue(); msg !== undefined; ) {
            this.ws.send(msg);
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
        const message = this.readMessage(ev.data);
        if (!message) {
            return;
        }
        if (!(message.data && message.source && message.type)) {
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
        try {
            const parsed = JSON.parse(data);
            parsed.type = MessageType[parsed.type];
            return parsed as Message;
        } catch (e) {
            console.error('Could not parse message json');
            return null;
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
        const message = this.makeMessage(messageType, data);
        if (this.ws && this.ws.readyState === this.ws.OPEN) {
            this.ws.send(message);
        } else {
            this.messageQueue.add(message);
            this.connect();
        }
    }
}
