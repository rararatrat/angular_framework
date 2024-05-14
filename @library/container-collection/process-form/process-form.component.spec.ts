import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessFormComponent } from './process-form.component';

describe('ProcessFormComponent', () => {
  let component: ProcessFormComponent;
  let fixture: ComponentFixture<ProcessFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessFormComponent]
    });
    fixture = TestBed.createComponent(ProcessFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
