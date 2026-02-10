import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { ISignalingService, SignalMessage } from './signaling-service';

export class ManualSignalingService implements ISignalingService {
    private incomingSignalSubject = new Subject<SignalMessage>();
    private outgoingSignalSubject = new BehaviorSubject<string>('');

    // For UI binding
    public outgoingSignals$ = this.outgoingSignalSubject.asObservable();

    constructor() { }

    connect(sessionId?: string): Promise<string> {
        // Manual signaling doesn't really "connect" to a server.
        // It just prepares to receive/send signals.
        // If sessionId is provided (Answer mode), we might do something different
        // but typically for manual, we wait for the user to provide the string.
        return Promise.resolve('');
    }

    sendSignal(signal: SignalMessage): void {
        const json = JSON.stringify(signal);
        const encoded = btoa(json); // Simple base64 encoding to make it copy-paste friendly
        this.outgoingSignalSubject.next(encoded);
    }

    onSignal(): Observable<SignalMessage> {
        return this.incomingSignalSubject.asObservable();
    }

    // Called by the UI when the user pastes a string
    public receiveManualSignal(encodedSignal: string) {
        try {
            const json = atob(encodedSignal);
            const signal = JSON.parse(json) as SignalMessage;
            this.incomingSignalSubject.next(signal);
        } catch (e) {
            console.error('Invalid signal string', e);
        }
    }

    disconnect(): void {
        this.incomingSignalSubject.complete();
        this.outgoingSignalSubject.complete();
    }
}


