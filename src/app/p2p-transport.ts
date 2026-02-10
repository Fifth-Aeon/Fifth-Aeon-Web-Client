import { Observable } from 'rxjs';

export interface P2PTransport {
    connected$: Observable<boolean>;
    data$: Observable<any>;
    send(data: any): void;
    isConnected(): boolean;
    destroy(): void;
}
