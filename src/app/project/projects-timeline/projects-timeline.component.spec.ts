import {ComponentFixture, TestBed} from '@angular/core/testing';
import {addDays, format, startOfDay} from "date-fns";

import {ProjectsTimelineComponent} from './projects-timeline.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {ClientType, ContractStatus, Project, ProjectStatus, ProjectType} from "../../generated/models";

function day(offset: number): string {
    return format(addDays(startOfDay(new Date()), offset), 'yyyy-MM-dd');
}

describe('ProjectsTimelineComponent', () => {
    let component: ProjectsTimelineComponent;
    let fixture: ComponentFixture<ProjectsTimelineComponent>;

    const projects: Project[] = [
        {
            id: 1, name: 'Lublin 01', type: ProjectType.INTERIOR_HOUSE, status: ProjectStatus.IN_PROGRESS,
            client: {id: 7, clientType: ClientType.PRIVATE, firstName: 'Jan', lastName: 'Kowalski'},
            startDate: day(-30), endDate: day(69),
            contract: {startDate: day(-40), deadline: day(-5), status: ContractStatus.SIGNED}
        },
        {
            id: 2, name: 'Gdańsk house', type: ProjectType.ARCHITECTURE_HOUSE,
            contract: {startDate: day(100), endDate: day(90), status: ContractStatus.OFFER}
        },
        {id: 3, name: 'No dates'}
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProjectsTimelineComponent],
            providers: provideTestDependencies()
        });
        fixture = TestBed.createComponent(ProjectsTimelineComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('projects', projects);
        fixture.componentRef.setInput('contractStatuses', [{id: ContractStatus.SIGNED, label: 'Signed'}]);
        fixture.detectChanges();
    });

    it('draws a contract and a project row for every project, in the order given', () => {
        expect(component.groups.map(group => group.name)).toEqual(['Lublin 01', 'Gdańsk house', 'No dates']);
        let text = fixture.nativeElement.textContent;
        // Only the name: client and type are on the table view
        expect(text).not.toContain('Jan Kowalski');
        expect(fixture.nativeElement.querySelectorAll('a[href="/projects/1/timeline"]').length).toBe(1);
    });

    it('takes each row from its own dates: an open contract past its deadline, a closed project', () => {
        let lublin = component.groups[0];
        expect(lublin.contract.open).toBeTrue();
        expect(lublin.contract.label).toBe('41 days so far');
        expect(lublin.contract.pastDeadline).toBeDefined();
        expect(lublin.work.open).toBeFalse();
        expect(lublin.work.label).toBe('100 days');
        expect(lublin.work.pastDeadline).toBeUndefined();
        expect(lublin.contractStatusLabel).toBe('Signed');
    });

    it('flags an end before the start, and says when a row has nothing to draw', () => {
        expect(component.groups[1].contract.dateError).toBe('The end date is before the start date');
        expect(component.anyDateError).toBeTrue();
        expect(fixture.nativeElement.textContent).toContain('Date error');
        expect(fixture.nativeElement.textContent).toContain('No start date yet');
    });

    it('scrolls only as far as today needs, and not at all when today is in view', () => {
        let scroller = {clientWidth: 920, scrollWidth: 2320, scrollLeft: 500} as HTMLElement;
        // Track 2000px wide, 600px visible: scrolled 600px, today (at 1000px) sits 400px in, two thirds of the way
        component.scale = {todayLeft: 50} as any;
        component.scrollToToday(scroller);
        expect(scroller.scrollLeft).toBe(600);
        component.scale = {todayLeft: 10} as any;
        component.scrollToToday(scroller);
        expect(scroller.scrollLeft).toBe(0);
    });

    it('scrolls back to today for new rows only, not for new status labels', () => {
        let scroll = spyOn(component, 'scrollToToday');
        fixture.componentRef.setInput('contractStatuses', [{id: ContractStatus.SIGNED, label: 'Podpisana'}]);
        fixture.detectChanges();
        expect(scroll).not.toHaveBeenCalled();
        fixture.componentRef.setInput('projects', [...projects]);
        fixture.detectChanges();
        expect(scroll).toHaveBeenCalledTimes(1);
    });

    it('stretches the chart only for rows it draws', () => {
        // A contract deadline a year ahead, but no contract start: the row says "No start date yet" and adds no room
        fixture.componentRef.setInput('projects', [
            {id: 5, name: 'Started', startDate: day(-10), endDate: day(20)},
            {id: 6, name: 'Not started', contract: {deadline: day(365)}}
        ]);
        fixture.detectChanges();
        expect(component.scale.rangeEnd!.getTime()).toBeLessThan(addDays(startOfDay(new Date()), 80).getTime());
    });

    it('always puts today on the chart', () => {
        expect(component.scale.todayLeft).not.toBeNull();
        fixture.componentRef.setInput('projects', [{id: 4, name: 'Old', contract: {startDate: '2020-01-01', endDate: '2020-03-01'}}]);
        fixture.detectChanges();
        expect(component.scale.todayLeft).not.toBeNull();
    });
});
