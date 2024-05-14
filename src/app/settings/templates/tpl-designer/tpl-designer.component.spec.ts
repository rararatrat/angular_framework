import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TplDesignerComponent } from './tpl-designer.component';

describe('TplDesignerComponent', () => {
  let component: TplDesignerComponent;
  let fixture: ComponentFixture<TplDesignerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TplDesignerComponent]
    });
    fixture = TestBed.createComponent(TplDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
