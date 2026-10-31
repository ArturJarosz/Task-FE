import { ComponentFixture, TestBed } from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {Router} from '@angular/router';

import { ProjectListShellComponent } from './project-list-shell.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {EMPTY_FILTER} from '../project-filter/project-filter';
import {Project} from '../../generated/models/project';

describe('ProjectShellComponent', () => {
  let component: ProjectListShellComponent;
  let fixture: ComponentFixture<ProjectListShellComponent>;
  let httpTesting: HttpTestingController;

  const projects: Project[] = [
    {id: 1, name: 'Lublin 01', startDate: '2026-03-01', client: {id: 7, firstName: 'Jan', lastName: 'Kowalski'}},
    {id: 2, name: 'Gdańsk house', startDate: '2026-01-01'},
    {id: 3, name: 'No dates'}
  ];

  function flushProjects(): void {
    httpTesting.match(request => request.url.endsWith('/projects')).forEach(request => request.flush(projects));
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectListShellComponent],
      providers: provideTestDependencies()
    });
    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProjectListShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows skeletons until the projects load, never an empty list', () => {
    expect(component.$loading()).toBeTrue();
    expect(fixture.nativeElement.textContent).not.toContain('No projects yet');
    flushProjects();
    expect(component.$loading()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Lublin 01');
  });

  it('keeps the loaded projects on screen when a reload fails', () => {
    flushProjects();
    // As after adding or deleting a project: the shell's effect reloads them
    component.projectStore.setProjectsNeedRefresh();
    fixture.detectChanges();
    httpTesting.match(request => request.url.endsWith('/projects'))
      .forEach(request => request.flush('', {status: 500, statusText: 'Server error'}));
    fixture.detectChanges();
    expect(component.$projectsLoadFailed()).toBeTrue();
    expect(component.$loadFailed()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Lublin 01');
    expect(fixture.nativeElement.textContent).not.toContain("Couldn't load projects");
  });

  it('switches to the timeline through the view query parameter, sorted by first date', async () => {
    flushProjects();
    component.onSelectView('timeline');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/?view=timeline');
    expect(component.$view()).toBe('timeline');
    expect(component.$pagedTimelineProjects().map(project => project.name)).toEqual(['Gdańsk house', 'Lublin 01', 'No dates']);
    expect(fixture.nativeElement.textContent).toContain('Projects timeline');
  });

  it('applies the filters to both views and lists them as chips', () => {
    flushProjects();
    component.onFilterChange({...EMPTY_FILTER, clientId: 7});
    fixture.detectChanges();
    expect(component.$filteredProjects().map(project => project.id)).toEqual([1]);
    expect(component.$segmentCounts()['all']).toBe(1);
    // The KPIs count every project
    expect(component.$kpis().total).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('Client: Jan Kowalski');
    component.onClearFilters();
    expect(component.$filteredProjects().length).toBe(3);
  });
});
