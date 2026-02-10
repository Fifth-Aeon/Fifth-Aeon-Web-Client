import { Message, MessageType } from './messenger';

export interface NetworkInterface {
    sendMessageToServer(type: MessageType, data: any): void;
    addHandler(type: MessageType, callback: (msg: Message) => void, context?: any): void;
    connectChange: (status: boolean) => void;
    isConnected(): boolean;
}
