import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentFlowComponent } from './document-flow.component';

describe('DocumentFlowComponent', () => {
  let component: DocumentFlowComponent;
  let fixture: ComponentFixture<DocumentFlowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentFlowComponent]
    });
    fixture = TestBed.createComponent(DocumentFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
