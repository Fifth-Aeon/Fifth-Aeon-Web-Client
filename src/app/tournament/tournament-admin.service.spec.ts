import { TestBed } from '@angular/core/testing';

import { TournamentAdminService } from './tournament-admin.service';

describe('TournamentAdminService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TournamentAdminService = TestBed.get(TournamentAdminService);
    expect(service).toBeTruthy();
  });
});
