import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerVerificationComponent } from './trainer-verification.component';

describe('TrainerVerificationComponent', () => {
  let component: TrainerVerificationComponent;
  let fixture: ComponentFixture<TrainerVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
