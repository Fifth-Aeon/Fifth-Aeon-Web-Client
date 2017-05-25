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

    constructor() {
        
        this.connections = new Map<string, any>();
        this.handlers = new Map();
        let url = 'ws-battleship.herokuapp.com' //location.host;
        let protocal = 'wss'; // location.protocol.includes('https') ? 'wss' : 'ws';
        this.ws = new WebSocket(protocal + '://' + url);
        console.log('attempting to connect to', protocal + '://' + url)
        this.ws.onmessage = this.handleMessage.bind(this);
        this.id = Math.random().toString(16);
        this.addHandeler(MessageType.LoginResponce, (msg) => this.login(msg));
        this.ws.onopen = () => this.annonLogin();
    }

    private login(msg: Message) {
        this.username = msg.data.username;
        this.id = msg.data.token;
        this.onlogin(this.username);
    }

    public onlogin: (username: string) => void = () => null;

    private annonLogin() {
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
        this.ws.send(this.makeMessage(messageType, data));
    }
}

