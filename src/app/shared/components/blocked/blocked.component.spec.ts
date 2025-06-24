import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockedComponent } from './blocked.component';

describe('BlockedComponent', () => {
  let component: BlockedComponent;
  let fixture: ComponentFixture<BlockedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
