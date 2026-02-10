import { Observable } from 'rxjs';

export interface SignalMessage {
    type: 'offer' | 'answer' | 'candidate';
    data: any;
}

export interface ISignalingService {
    // Generates a session ID (or connection string) to share with the other player
    connect(sessionId?: string): Promise<string>;

    // Sends a signal to the connected peer
    sendSignal(signal: SignalMessage): void;

    // Stream of incoming signals
    onSignal(): Observable<SignalMessage>;

    disconnect(): void;
}
