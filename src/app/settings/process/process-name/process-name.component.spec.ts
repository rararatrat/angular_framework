import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessNameComponent } from './process-name.component';

describe('ProcessNameComponent', () => {
  let component: ProcessNameComponent;
  let fixture: ComponentFixture<ProcessNameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessNameComponent]
    });
    fixture = TestBed.createComponent(ProcessNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
