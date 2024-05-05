import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YogaPoseComponent } from './yoga.pose.component';

describe('YogaPoseComponent', () => {
  let component: YogaPoseComponent;
  let fixture: ComponentFixture<YogaPoseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YogaPoseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(YogaPoseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
