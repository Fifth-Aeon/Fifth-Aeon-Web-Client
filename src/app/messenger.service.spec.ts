import { TestBed, inject } from '@angular/core/testing';

import { MessengerService } from './messenger.service';

describe('MessengerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessengerService]
    });
  });

  it('should be created', inject([MessengerService], (service: MessengerService) => {
    expect(service).toBeTruthy();
  }));
});
