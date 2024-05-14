import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocTemplateComponent } from './doc-template.component';

describe('DocTemplateComponent', () => {
  let component: DocTemplateComponent;
  let fixture: ComponentFixture<DocTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocTemplateComponent]
    });
    fixture = TestBed.createComponent(DocTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
