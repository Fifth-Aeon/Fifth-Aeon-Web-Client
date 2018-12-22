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

    // In Game
    GameEvent,
    GameAction
}

export interface Message {
    source: string;
    type: string;
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
    private handlers: Map<string, (msg: Message) => void>;
    private ws: WebSocket | undefined;
    private messageQueue: Queue<string> = new Queue<string>();
    private lastConnectAttempt = 0;
    private id: string | undefined;

    private loggedIn = false;

    public connectChange: (status: boolean) => void = () => null;

    constructor() {
        this.handlers = new Map();
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

    private connect() {
        if (Date.now() - this.lastConnectAttempt < minConnectTime) {
            return;
        }
        this.lastConnectAttempt = Date.now();
        const url = getWsUrl();
        this.ws = new WebSocket(url);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onopen = () => this.onConnect();
        this.ws.onclose = () => this.connectChange(false);
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
        this.connectChange(true);
        this.sendMessageToServer(MessageType.Connect, {});
        console.log('Connected, requesting queued messages.');
        if (this.loggedIn) {
            this.emptyMessageQueue();
        }
    }

    private handleMessage(ev: MessageEvent) {
        const message = this.readMessage(ev.data);
        if (!message) {
            return;
        }
        const cb = this.handlers.get(message.type);
        if (!(message.data && message.source && message.type)) {
            console.error('Invalid message', message);
            return;
        }
        if (cb) {
            cb(message);
        } else {
            console.error('No handler for message type', message.type);
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
            source: this.id
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
        this.handlers.set(MessageType[messageType], callback);
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
