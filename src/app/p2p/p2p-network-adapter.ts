import { P2PClient } from './p2p-client';
import { NetworkInterface } from '../network-interface';
import { Message, MessageType } from '../messenger';

export class P2PNetworkAdapter implements NetworkInterface {
    private handlers = new Map<MessageType, (msg: Message) => void>();
    public connectChange: (status: boolean) => void = () => null;
    private connected = false;

    constructor(private client: P2PClient) {
        this.client.connected$.subscribe(status => {
            this.connected = status;
            this.connectChange(status);
        });

        this.client.data$.subscribe(data => {
            this.handleMessage(data);
        });
    }

    public isConnected(): boolean {
        return this.connected;
    }

    public sendMessageToServer(type: MessageType, data: any): void {
        const message: Message = {
            type: type,
            data: data,
            source: 'p2p' // Source ID might need to be dynamic if P2P logic requires it
        };
        this.client.send(message);
    }

    public addHandler(type: MessageType, callback: (msg: Message) => void, context?: any): void {
        if (context) {
            callback = callback.bind(context);
        }
        this.handlers.set(type, callback);
    }

    private handleMessage(data: any) {
        // P2P messages should already be in the Message format or close to it.
        // If P2PClient.send wraps it, we need to unwrap or ensure format consistency.
        // In this implementation, sendMessageToServer wraps it as a Message.

        const message = data as Message;
        if (!message || message.type === undefined) {
            console.warn('Received invalid P2P message', data);
            return;
        }

        const handler = this.handlers.get(message.type);
        if (handler) {
            handler(message);
        } else {
            console.warn('No handler for P2P message type', message.type);
        }
    }
}
