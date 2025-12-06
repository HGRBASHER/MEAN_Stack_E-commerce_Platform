import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Regest } from './regest';

describe('Regest', () => {
  let component: Regest;
  let fixture: ComponentFixture<Regest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Regest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Regest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
