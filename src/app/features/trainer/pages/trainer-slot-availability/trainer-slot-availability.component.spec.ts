import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerSlotAvailabilityComponent } from './trainer-slot-availability.component';

describe('TrainerSlotAvailabilityComponent', () => {
  let component: TrainerSlotAvailabilityComponent;
  let fixture: ComponentFixture<TrainerSlotAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerSlotAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerSlotAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
