import { Injectable } from '@angular/core';
import { ISignalingService, SignalMessage } from './signaling/signaling-service';
import { P2PTransport } from '../p2p-transport';
import { Observable, Subject } from 'rxjs';

import * as SimplePeer from 'simple-peer';

@Injectable()
export class P2PClient implements P2PTransport {
    private peer: SimplePeer.Instance | null = null;
    private connectedSubject = new Subject<boolean>();
    private dataSubject = new Subject<any>();

    public connected$ = this.connectedSubject.asObservable();
    public data$ = this.dataSubject.asObservable();

    constructor(private signaling: ISignalingService) {
        this.signaling.onSignal().subscribe(signal => this.handleSignal(signal));
    }

    public initiate(initiator: boolean) {
        this.peer = new SimplePeer({
            initiator: initiator,
            trickle: true
        });

        this.peer.on('signal', (data: any) => {
            const type = data.type || 'candidate';
            console.log('Generating signal:', type, data);
            this.signaling.sendSignal({
                type: type,
                data: data
            });
        });

        this.peer.on('connect', () => {
            console.log('P2P Connected');
            this.connectedSubject.next(true);
        });

        this.peer.on('data', (data: any) => {
            try {
                const decoded = new TextDecoder().decode(data);
                const json = JSON.parse(decoded);
                this.dataSubject.next(json);
            } catch (e) {
                console.error('Failed to parse P2P data', e);
            }
        });

        this.peer.on('error', (err: any) => {
            console.error('P2P Error', err);
            this.connectedSubject.next(false);
        });

        this.peer.on('close', () => {
            console.log('P2P Closed');
            this.connectedSubject.next(false);
        });
    }

    public isConnected(): boolean {
        return this.peer !== null && this.peer.connected;
    }

    private handleSignal(msg: SignalMessage) {
        console.log('P2PClient received signal:', msg.type, msg.data);
        if (this.peer) {
            try {
                this.peer.signal(msg.data);
            } catch (e) {
                console.error('Error passing signal to peer:', e, msg.data);
            }
        }
    }

    public send(data: any) {
        if (this.peer && this.peer.connected) {
            const json = JSON.stringify(data);
            this.peer.send(json);
        } else {
            console.warn('Cannot send, P2P not connected');
        }
    }

    public destroy() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }
}
