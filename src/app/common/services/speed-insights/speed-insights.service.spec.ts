import { TestBed } from '@angular/core/testing';

import { SpeedInsightsService } from './speed-insights.service';

describe('SpeedInsightsService', () => {
  let service: SpeedInsightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeedInsightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
