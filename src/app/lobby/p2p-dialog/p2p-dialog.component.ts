import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClipboardService } from 'ngx-clipboard';
import { ManualSignalingService } from '../../p2p/signaling/manual-signaling';
import { FirebaseSignalingService } from '../../p2p/signaling/firebase-signaling';
import { ISignalingService } from '../../p2p/signaling/signaling-service';
import { WebClient } from '../../client';

@Component({
    selector: 'ccg-p2p-dialog',
    templateUrl: './p2p-dialog.component.html',
    styleUrls: ['./p2p-dialog.component.scss']
})
export class P2PDialogComponent {
    public signalingMethod: 'manual' | 'firebase' = 'firebase';
    public role: 'host' | 'join' = 'host';

    public manualOffer = '';
    public manualAnswer = ''; // User input for answer (host) or offer (join)
    public manualLog = '';

    public firebaseSessionId = '';
    public firebaseInputId = '';
    public firebaseStatus = '';

    public signaling: ISignalingService | null = null;
    private manualSignaling: ManualSignalingService | null = null;

    public checkingAvailability = true;

    constructor(
        public dialogRef: MatDialogRef<P2PDialogComponent>,
        private client: WebClient,
        private clipboard: ClipboardService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    async ngOnInit() {
        this.checkingAvailability = true;
        const available = await FirebaseSignalingService.isAvailable();
        this.signalingMethod = available ? 'firebase' : 'manual';
        this.checkingAvailability = false;

        if (this.data && this.data.autoJoinRoom) {
            this.role = 'join';
            this.firebaseInputId = this.data.autoJoinRoom;
            // Optionally auto-start if connected
            if (this.signalingMethod === 'firebase') {
                setTimeout(() => this.start(), 500);
            }
        }
    }

    public selectMethod(method: 'manual' | 'firebase') {
        this.signalingMethod = method;
        this.reset();
    }

    public selectRole(role: 'host' | 'join') {
        this.role = role;
        this.reset();
    }

    public reset() {
        this.manualOffer = '';
        this.manualAnswer = '';
        this.firebaseSessionId = '';
        this.firebaseStatus = '';
        if (this.signaling) {
            this.signaling.disconnect();
            this.signaling = null;
        }
    }

    public async start() {
        if (this.signaling) return;

        if (this.signalingMethod === 'manual') {
            this.manualSignaling = new ManualSignalingService();
            this.signaling = this.manualSignaling;

            this.manualSignaling.outgoingSignals$.subscribe(signal => {
                this.manualOffer = signal;
            });

            // Start Client immediately to generate offer if host
            this.client.startP2PGame(this.signaling, this.role === 'host');
            this.manualLog = this.role === 'host' ? 'Generating offer...' : 'Waiting for offer...';

        } else {
            this.signaling = new FirebaseSignalingService();
            this.firebaseStatus = 'Connecting...';

            try {
                const sessionId = this.role === 'host' ? undefined : this.firebaseInputId;
                this.firebaseSessionId = await this.signaling!.connect(sessionId);
                this.firebaseStatus = this.role === 'host' ? 'Waiting for opponent...' : 'Connected!';

                this.client.startP2PGame(this.signaling!, this.role === 'host');
            } catch (e) {
                this.firebaseStatus = 'Error: ' + e;
            }
        }
    }

    public processManualInput() {
        if (this.manualSignaling && this.manualAnswer) {
            this.manualSignaling.receiveManualSignal(this.manualAnswer);
            this.manualAnswer = ''; // Clear after processing? Or keep?
            this.manualLog = 'Signal processed.';
        }
    }

    public getShareLink() {
        const url = window.location.protocol + '//' + window.location.host + '/?room=' + this.firebaseSessionId;
        return url;
    }

    public copy(text: string) {
        this.clipboard.copyFromContent(text);
    }
}
