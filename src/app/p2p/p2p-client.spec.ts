import { P2PClient } from './p2p-client';
import { ISignalingService, SignalMessage } from './signaling/signaling-service';
import { Subject, Observable } from 'rxjs';

class MockSignaling implements ISignalingService {
    public signalSubject = new Subject<SignalMessage>();
    public sentSignals: SignalMessage[] = [];
    public otherSide: MockSignaling | null = null;

    connect(sessionId?: string): Promise<string> {
        return Promise.resolve('');
    }

    sendSignal(signal: SignalMessage): void {
        this.sentSignals.push(signal);
        if (this.otherSide) {
            // Simulate network delay?
            setTimeout(() => this.otherSide!.signalSubject.next(signal), 10);
        }
    }

    onSignal(): Observable<SignalMessage> {
        return this.signalSubject.asObservable();
    }

    disconnect(): void {
    }
}

describe('P2PClient', () => {
    let clientA: P2PClient;
    let clientB: P2PClient;
    let signalingA: MockSignaling;
    let signalingB: MockSignaling;

    beforeEach(() => {
        signalingA = new MockSignaling();
        signalingB = new MockSignaling();

        // Wire them together
        signalingA.otherSide = signalingB;
        signalingB.otherSide = signalingA;

        clientA = new P2PClient(signalingA);
        clientB = new P2PClient(signalingB);
    });

    afterEach(() => {
        clientA.destroy();
        clientB.destroy();
    });

    it('should establish a connection', (done) => {
        let connectedCount = 0;
        const checkDone = () => {
            connectedCount++;
            if (connectedCount === 2) {
                done();
            }
        };

        clientA.connected$.subscribe(connected => {
            if (connected) checkDone();
        });

        clientB.connected$.subscribe(connected => {
            if (connected) checkDone();
        });

        clientA.initiate(true); // Initiator
        clientB.initiate(false);
    }, 10000);

    it('should send and receive data', (done) => {
        clientA.connected$.subscribe(connected => {
            if (connected) {
                clientA.send({ message: 'Hello B' });
            }
        });

        clientB.data$.subscribe(data => {
            expect(data).toEqual({ message: 'Hello B' });
            done();
        });

        clientA.initiate(true);
        clientB.initiate(false);
    }, 10000);
});
