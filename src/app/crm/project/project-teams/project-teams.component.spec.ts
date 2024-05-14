import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTeamsComponent } from './project-teams.component';

describe('ProjectTeamsComponent', () => {
  let component: ProjectTeamsComponent;
  let fixture: ComponentFixture<ProjectTeamsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectTeamsComponent]
    });
    fixture = TestBed.createComponent(ProjectTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
