import { TestBed, inject } from '@angular/core/testing';

import { SpeedService } from './speed.service';

describe('SpeedService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SpeedService]
        });
    });

    it('should be created', inject([SpeedService], (service: SpeedService) => {
        expect(service).toBeTruthy();
    }));
});
