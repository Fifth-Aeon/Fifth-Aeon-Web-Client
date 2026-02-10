import { Injectable } from '@angular/core';
import { ISignalingService, SignalMessage } from './signaling-service';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, onChildAdded, Database, DatabaseReference, remove, onDisconnect } from 'firebase/database';
import { Observable, Subject } from 'rxjs';

const firebaseConfig = {
    authDomain: "ccg-game.firebaseapp.com",
    databaseURL: "https://ccg-game.firebaseio.com/",
    projectId: "ccg-game",
};

@Injectable()
export class FirebaseSignalingService implements ISignalingService {
    private app = initializeApp(firebaseConfig);
    private db: Database;
    private sessionRef: DatabaseReference | null = null;
    private incomingSignalSubject = new Subject<SignalMessage>();

    private myRole: 'host' | 'client' = 'host';

    constructor() {
        this.db = getDatabase(this.app);
    }

    public static async isAvailable(): Promise<boolean> {
        if (firebaseConfig.databaseURL.includes('default-rtdb')) {
            return false; // Still using placeholder
        }
        try {
            // Ping the database to see if it's reachable
            // .json?shallow=true is a lightweight REST API check
            const res = await fetch(`${firebaseConfig.databaseURL}.json?shallow=true`);
            return res.ok || res.status === 401; // 200 or 401 (Unauthorized) means server is there
        } catch (e) {
            console.warn('Firebase not available:', e);
            return false;
        }
    }

    // Returns a Promise that resolves to the Session ID
    connect(sessionId?: string): Promise<string> {
        if (sessionId) {
            this.myRole = 'client';
            this.sessionRef = ref(this.db, 'sessions/' + sessionId);
            this.listenForSignals();
            return Promise.resolve(sessionId);
        } else {
            this.myRole = 'host';
            const newId = this.generateId();
            this.sessionRef = ref(this.db, 'sessions/' + newId);

            // Clear previous if exists (unlikely with random ID but good practice)
            return set(this.sessionRef, { created: Date.now() }).then(() => {
                if (this.sessionRef) {
                    onDisconnect(this.sessionRef).remove();
                }
                this.listenForSignals();
                return newId;
            });
        }
    }

    private generateId() {
        // Generate a random UUID-like string
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    private listening = false;

    private listenForSignals() {
        if (!this.sessionRef || this.listening) return;
        this.listening = true;

        const targetPath = this.myRole === 'host' ? 'client-signals' : 'host-signals';
        // Correct path: sessions/{UUID}/{targetPath}
        const signalsRef = ref(this.db, 'sessions/' + this.sessionRef.key + '/' + targetPath);

        console.log('Listening for signals at', targetPath);

        onChildAdded(signalsRef, (snapshot) => {
            const val = snapshot.val();
            if (val) {
                this.incomingSignalSubject.next(val);
            }
        });
    }

    sendSignal(signal: SignalMessage): void {
        if (!this.sessionRef) return;

        const targetPath = this.myRole === 'host' ? 'host-signals' : 'client-signals';
        const signalsRef = ref(this.db, 'sessions/' + this.sessionRef.key + '/' + targetPath);

        push(signalsRef, signal);
    }

    onSignal(): Observable<SignalMessage> {
        return this.incomingSignalSubject.asObservable();
    }

    disconnect(): void {
        if (this.sessionRef && this.myRole === 'host') {
            // Clean up session if host
            remove(this.sessionRef);
        }
        this.sessionRef = null;
    }
}
