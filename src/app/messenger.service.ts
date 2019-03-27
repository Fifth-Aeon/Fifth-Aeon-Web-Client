import { Injectable } from '@angular/core';
import { Messenger } from './messenger';
import { AuthenticationService } from './user/authentication.service';

@Injectable()
export class MessengerService {
    private messenger: Messenger = new Messenger();
    private localMessenger: Messenger = new Messenger('ws://localhost:4236');

    constructor(auth: AuthenticationService) {
        auth.onAuth(user => {
            if (!user) {
                return;
            }
            this.setMessengerID(user.mpToken);
        });
        this.messenger.connect();
        this.localMessenger.connect();
    }

    private setMessengerID(id: string) {
        this.messenger.setID(id);
    }

    public getMessenger() {
        return this.messenger;
    }

    public getLocalMessenger() {
        return this.localMessenger;
    }
}
