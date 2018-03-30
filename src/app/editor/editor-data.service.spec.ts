import { TestBed, inject } from '@angular/core/testing';

import { EditorDataService } from './editor-data.service';

describe('EditorDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditorDataService]
    });
  });

  it('should be created', inject([EditorDataService], (service: EditorDataService) => {
    expect(service).toBeTruthy();
  }));
});
