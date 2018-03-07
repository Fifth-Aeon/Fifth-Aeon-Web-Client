import { TestBed, inject } from '@angular/core/testing';

import { DraftService } from './draft.service';

describe('DraftService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DraftService]
    });
  });

  it('should be created', inject([DraftService], (service: DraftService) => {
    expect(service).toBeTruthy();
  }));
});
