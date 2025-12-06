import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { regDeactivatGuard } from './reg-deactivat-guard';

describe('regDeactivatGuard', () => {
  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) => 
      TestBed.runInInjectionContext(() => regDeactivatGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
