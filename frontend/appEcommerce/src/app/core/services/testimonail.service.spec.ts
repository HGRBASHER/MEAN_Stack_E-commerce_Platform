import { TestBed } from '@angular/core/testing';

import { TestimonailService } from './testimonail.service';

describe('TestimonailService', () => {
  let service: TestimonailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestimonailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
