import { Queue } from 'typescript-collections';

export enum MessageType {
    // General
    Info, ClientError,

    // Accounts
    AnonymousLogin, LoginResponce,

    // Queuing
    JoinQueue, ExitQueue, StartGame,

    // In Game
    Concede, GameEvent, GameAction
}

export interface Message {
    source: string;
    type: string;
    data: any;
}


/**
 * Used to communicate via websockets. 
 * 
 * @class Messenger
 */
export class Messenger {
    private handlers: Map<string, (msg: Message) => void>;
    private connections: Map<string, any>;
    private username: string;
    private id: string;
    private ws: WebSocket;
    private messageQueue: Queue<string> = new Queue<string>();
    public onlogin: (username: string) => void = () => null;
    private loggedIn: boolean = false;

    constructor() {
        this.connections = new Map<string, any>();
        this.handlers = new Map();
        this.id = Math.random().toString(16);
        this.addHandeler(MessageType.LoginResponce, (msg) => this.login(msg));
        this.connect();
    }

    private connect() {
        let urn = 'localhost'; //location.host;
        let protocal = 'ws'; // location.protocol.includes('https') ? 'wss' : 'ws';
        let url = protocal + '://' + urn;
        this.ws = new WebSocket(url);
        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onopen = () => this.onConnect();
    }

    private emptyMessageQueue() {
        
        while (!this.messageQueue.isEmpty()) {
            console.log(this.messageQueue.peek());
            this.ws.send(this.messageQueue.dequeue());
        }
    }

    private login(msg: Message) {
        this.username = msg.data.username;
        this.id = msg.data.token;
        this.loggedIn = true;
        this.onlogin(this.username);
        this.emptyMessageQueue();
    }


    private onConnect() {
        if (this.loggedIn) {
            this.emptyMessageQueue();
        } else {
            this.annonLogin();
        }
    }

    private annonLogin() {
        console.log('annon login');
        this.sendMessageToServer(MessageType.AnonymousLogin, {});
    }


    private handleMessage(ev: MessageEvent) {
        let message = JSON.parse(ev.data) as Message;
        let cb = this.handlers.get(message.type);
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

    private makeMessage(messageType: MessageType, data: string | object): string {
        return JSON.stringify({
            type: messageType,
            data: data,
            source: this.id
        });
    }

    public addHandeler(messageType, callback: (message: Message) => void, context?: any) {
        if (context) {
            callback = callback.bind(context);
        }
        this.handlers.set(messageType, callback);
    }

    public sendMessageToServer(messageType: MessageType, data: string | object) {
        let message = this.makeMessage(messageType, data);
        if (this.ws.readyState === this.ws.OPEN) {
            console.log('ws is open', message);
            this.ws.send(message);
        } else {
            console.log('add to queue');
            this.messageQueue.add(message);
            this.connect();
        }
    }
}

