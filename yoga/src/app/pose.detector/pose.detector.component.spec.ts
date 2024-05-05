import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoseDetectorComponent } from './pose.detector.component';

describe('PoseDetectorComponent', () => {
  let component: PoseDetectorComponent;
  let fixture: ComponentFixture<PoseDetectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoseDetectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PoseDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
