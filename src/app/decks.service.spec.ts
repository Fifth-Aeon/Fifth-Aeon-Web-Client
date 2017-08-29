import { TestBed, inject } from '@angular/core/testing';

import { DecksService } from './decks.service';

describe('DecksService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DecksService]
    });
  });

  it('should be created', inject([DecksService], (service: DecksService) => {
    expect(service).toBeTruthy();
  }));
});
