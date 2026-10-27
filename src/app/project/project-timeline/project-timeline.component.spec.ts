import {ComponentFixture, TestBed} from '@angular/core/testing';
import {addDays, format, startOfDay} from "date-fns";

import {ProjectTimelineComponent} from './project-timeline.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {Project} from "../../generated/models/project";
import {StageStatus} from "../../generated/models";

function day(offset: number): string {
    return format(addDays(startOfDay(new Date()), offset), 'yyyy-MM-dd');
}

describe('ProjectTimelineComponent', () => {
    let component: ProjectTimelineComponent;
    let fixture: ComponentFixture<ProjectTimelineComponent>;

    const project: Project = {
        id: 1,
        name: 'Lublin 01',
        startDate: day(-10),
        endDate: day(89),
        contract: {signingDate: day(-20), startDate: day(-15), endDate: day(104), deadline: day(119)},
        stages: [
            {id: 1, name: 'Concept', startDate: day(-10), endDate: day(20), deadline: day(20), status: StageStatus.DONE},
            {id: 2, name: 'Executive design', startDate: day(21), endDate: day(89), status: StageStatus.IN_PROGRESS}
        ]
    };

    function render(input: Project): void {
        fixture.componentRef.setInput('project', input);
        fixture.componentRef.setInput('installments', []);
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProjectTimelineComponent],
            providers: provideTestDependencies()
        });
        fixture = TestBed.createComponent(ProjectTimelineComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('project', project);
        fixture.componentRef.setInput('installments', [
            {id: 1, stageId: 1, stageName: 'Concept', paymentDate: day(-5), paid: true, value: 1000},
            {id: 2, stageId: 2, stageName: 'Executive design', paymentDate: day(30), paid: false, value: 2000},
            {id: 3, stageId: 2, stageName: 'Executive design', value: 500}
        ]);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('puts no start or end markers on the contract and project bars, and no dates as text', () => {
        let tips = [...fixture.nativeElement.querySelectorAll('[role=img]')].map((marker: HTMLElement) => marker.getAttribute('aria-label')!);
        expect(tips.some(tip => /^(Contract|Project) (start|end)/.test(tip))).toBeFalse();
        expect(component.contract.label).toBe('120 days');
        expect(component.work.label).toBe('100 days');
        expect(fixture.nativeElement.textContent).not.toContain('Start ·');
    });

    it('keeps the contract apart from the work on the project', () => {
        expect(component.contract.days).toBe(120);
        expect(component.contract.open).toBeFalse();
        expect(component.contractDeadline).toEqual(addDays(startOfDay(new Date()), 119));
        // The work runs from the project's own start to its own end, not over the contract dates
        expect(component.start).toEqual(addDays(startOfDay(new Date()), -10));
        expect(component.end).toEqual(addDays(startOfDay(new Date()), 89));
        expect(component.durationDays).toBe(100);
        expect(component.elapsedDays).toBe(11);
        expect(component.elapsedPercent).toBe(11);
        expect(component.daysToDeadline).toBe(119);
    });

    it('puts each installment payment date on the row of its stage', () => {
        let byName = (name: string) => component.stages.find(stage => stage.name === name)!;
        expect(byName('Concept').payments.map(payment => payment.paid)).toEqual([true]);
        // The installment without a payment date isn't drawn
        expect(byName('Executive design').payments.map(payment => payment.id)).toEqual([2]);
        expect(component.otherPayments).toEqual([]);
        expect(component.installmentsPaid).toBe(1);
        expect(component.installmentsCount).toBe(3);
    });

    it('marks payments by state: paid, not paid (due) and overdue', () => {
        fixture.componentRef.setInput('installments', [
            {id: 1, stageId: 1, paymentDate: day(-5), paid: true},
            {id: 2, stageId: 1, paymentDate: day(0), paid: false},
            {id: 3, stageId: 1, paymentDate: day(-1), paid: false}
        ]);
        fixture.detectChanges();
        let payments = component.stages.find(stage => stage.id === 1)!.payments;
        expect(payments.map(payment => payment.state)).toEqual(['paid', 'due', 'overdue']);
        expect(payments.map(payment => payment.stateLabel)).toEqual(['Paid', 'Not paid', 'Overdue']);
    });

    it('labels the today line with today\'s date', () => {
        expect(fixture.nativeElement.textContent).toContain(format(startOfDay(new Date()), 'dd.MM'));
    });

    it('names the project row just "Project"', () => {
        let rowNames = [...fixture.nativeElement.querySelectorAll('.sticky span.text-sm')].map((label: HTMLElement) => label.textContent!.trim());
        expect(rowNames).toContain('Project');
        expect(rowNames).not.toContain('Project duration');
    });

    it('puts no text on stage bars; their length is kept for the tooltip', () => {
        let concept = component.stages.find(stage => stage.name === 'Concept')!;
        expect(concept.label).toBe('31 days');
        expect(fixture.nativeElement.textContent).not.toContain('31 days');
        expect(fixture.nativeElement.textContent).not.toMatch(/(Done|In progress|To do) ·/);
    });

    it('puts a payment whose stage is not on the project on the project row', () => {
        fixture.componentRef.setInput('installments', [{id: 9, stageId: 99, paymentDate: day(5), paid: false, value: 100}]);
        fixture.detectChanges();
        expect(component.otherPayments.map(payment => payment.id)).toEqual([9]);
    });

    it('does not list dates under the stage names', () => {
        let names = [...fixture.nativeElement.querySelectorAll('a[href*="/stages/"]')]
            .map((link: HTMLElement) => link.parentElement!.textContent!.trim());
        expect(names).toEqual(['Concept', 'Executive design']);
    });

    it('places both bars inside the chart range, the contract starting before the work', () => {
        for (let span of [component.contract, component.work]) {
            expect(span.left).toBeGreaterThanOrEqual(0);
            expect(span.left + span.width).toBeLessThanOrEqual(100);
        }
        expect(component.contract.left).toBeLessThan(component.work.left);
        expect(component.todayLeft).not.toBeNull();
        // One column per month, labelled "May'25"
        expect(component.ticks.length).toBeGreaterThan(1);
        expect(component.ticks.every(tick => /^[A-Z][a-z]{2}'\d{2}$/.test(tick.label))).toBeTrue();
    });

    it('places a short bar\'s label next to it, clear of the payment markers on its row', () => {
        // chartMinWidth is at least 720px, so a 5% bar can't hold a 14-character label
        expect(component.placeLabel(10, 5, 'Done · 33 days', 0).at).toBe('after');
        let pastMarker = component.placeLabel(10, 5, 'Done · 33 days', 0, [16]);
        expect(pastMarker.at).toBe('after');
        expect(pastMarker.left).toContain('16%');
        expect(component.placeLabel(10, 40, 'Done · 33 days', 0).at).toBe('inside');
    });

    it('shifts a label inside its bar past a marker on it, or moves it out when the bar is too short', () => {
        // A 60% bar holds the label; a marker at its start pushes the label right but keeps it inside
        let shifted = component.placeLabel(10, 60, 'In progress · 41 days', 0, [12]);
        expect(shifted.at).toBe('inside');
        // In percent of the chart width, so it still clears the marker when the chart is wider than its minimum
        expect(shifted.pad).toBeGreaterThan(2);
        expect(shifted.pad).toBeLessThan(10);
        expect(component.placeLabel(10, 60, 'In progress · 41 days', 0, [65]).pad).toBe(0);
        // Markers all along a bar that only just holds the label send it out of the bar
        expect(component.placeLabel(10, 30, 'In progress · 41 days', 0, [12, 20, 28, 36]).at).not.toBe('inside');
    });

    describe('for a project in progress', () => {
        it('runs the work bar from the project start to today when nothing says when it ends', () => {
            render({id: 2, contract: {signingDate: day(-40)}, startDate: day(-30), stages: []});
            expect(component.openEnded).toBeTrue();
            expect(component.work.open).toBeTrue();
            expect(component.work.days).toBe(31);
            expect(component.elapsedDays).toBe(31);
            expect(component.work.left + component.work.width).toBeCloseTo(component.todayLeft! + component.span(component.today, component.today), 5);
            expect(component.work.label).toBe('31 days so far');
        });

        it('says "1 day" for a project that started today', () => {
            render({id: 9, contract: {}, startDate: day(0), stages: [{id: 1, name: 'Concept', startDate: day(0), status: StageStatus.IN_PROGRESS}]});
            expect(component.work.label).toContain('1 day so far');
            expect(component.stages[0].label).toContain('1 day so far');
            expect(fixture.nativeElement.textContent).not.toContain('1 days');
        });

        it('never takes the work dates from the contract', () => {
            render({id: 7, contract: {startDate: day(-5), endDate: day(60), deadline: day(25)}, stages: []});
            expect(component.contract.days).toBe(66);
            expect(component.work.start).toBeUndefined();
            expect(component.rangeStart).toBeDefined();
            expect(fixture.nativeElement.textContent).toContain('No start date yet');
        });

        it('draws a contract without an end up to today', () => {
            render({id: 8, contract: {startDate: day(-20), deadline: day(40)}, stages: []});
            expect(component.contract.open).toBeTrue();
            expect(component.contract.days).toBe(21);
        });

        it('never takes the project dates from the stages', () => {
            render({
                id: 3, contract: {}, stages: [
                    {id: 1, name: 'Concept', startDate: day(-15), endDate: day(15)},
                    {id: 2, name: 'Executive design', startDate: day(16), endDate: day(60)}
                ]
            });
            expect(component.start).toBeUndefined();
            expect(component.end).toBeUndefined();
            expect(component.durationDays).toBe(0);
            // The stages are still drawn on their own rows
            expect(component.stages.every(stage => stage.width > 0)).toBeTrue();
            expect(fixture.nativeElement.textContent).toContain('No start date yet');
        });

        it('counts the days to the contract deadline only, never to the contract end', () => {
            render({id: 10, contract: {startDate: day(-5), endDate: day(60)}, stages: []});
            expect(component.daysToDeadline).toBeNull();
            render({id: 11, contract: {startDate: day(-5), endDate: day(60), deadline: day(30)}, stages: []});
            expect(component.daysToDeadline).toBe(30);
        });

        it('stays open without a project end date, and draws a started stage without an end up to today', () => {
            render({
                id: 6, startDate: day(-30), contract: {}, stages: [
                    {id: 1, name: 'Concept', startDate: day(-30), endDate: day(-10), status: StageStatus.DONE},
                    {id: 2, name: 'Visualisations', startDate: day(-9), status: StageStatus.IN_PROGRESS}
                ]
            });
            expect(component.openEnded).toBeTrue();
            expect(component.end).toBeUndefined();
            let open = component.stages.find(stage => stage.name === 'Visualisations')!;
            expect(open.open).toBeTrue();
            expect(open.days).toBe(10);
            expect(component.rangeEnd!.getTime()).toBeGreaterThan(addDays(startOfDay(new Date()), 13).getTime());
        });

        it('ends a stage bar only at its end date, never at its deadline', () => {
            render({
                id: 12, startDate: day(-30), contract: {}, stages: [
                    {id: 1, name: 'Visualisations', startDate: day(-20), deadline: day(10), status: StageStatus.IN_PROGRESS}
                ]
            });
            let stage = component.stages[0];
            expect(stage.open).toBeTrue();
            expect(stage.end).toEqual(component.today);
            expect(stage.deadline).toEqual(addDays(startOfDay(new Date()), 10));
            // No deadline marker: the deadline is where the dashed stretch after the bar ends
            let tips = [...fixture.nativeElement.querySelectorAll('[role=img]')].map((marker: HTMLElement) => marker.getAttribute('aria-label'));
            expect(tips.some(tip => /deadline/i.test(tip!))).toBeFalse();
        });

        it('dashes an open bar on from today to its deadline while that is still ahead', () => {
            render({
                id: 15, startDate: day(-30), contract: {startDate: day(-30), deadline: day(20)}, stages: [
                    {id: 1, name: 'Visualisations', startDate: day(-20), deadline: day(10), status: StageStatus.IN_PROGRESS},
                    {id: 2, name: 'Supervision', startDate: day(-20), deadline: day(-5), status: StageStatus.IN_PROGRESS},
                    {id: 3, name: 'Concept', startDate: day(-25), endDate: day(-21), deadline: day(10), status: StageStatus.DONE}
                ]
            });
            let tomorrow = addDays(component.today, 1);
            expect(component.contract.toDeadline!.left).toBeCloseTo(component.position(tomorrow), 5);
            expect(component.contract.toDeadline!.width).toBeCloseTo(component.span(tomorrow, addDays(component.today, 20)), 5);
            expect(component.stages.map(stage => !!stage.toDeadline)).toEqual([false, true, false]);
            // The project has no deadline, so it is never dashed on
            expect(component.work.toDeadline).toBeUndefined();
        });

        it('stripes the stretch of a bar past its deadline, from the day after the deadline to the bar end', () => {
            render({
                id: 14, startDate: day(-30), contract: {startDate: day(-30), deadline: day(-1)}, stages: [
                    {id: 1, name: 'Concept', startDate: day(-20), endDate: day(-2), deadline: day(-5), status: StageStatus.DONE},
                    {id: 2, name: 'Visualisations', startDate: day(-1), endDate: day(20), deadline: day(20), status: StageStatus.IN_PROGRESS},
                    {id: 3, name: 'Supervision', startDate: day(-10), deadline: day(-12), status: StageStatus.IN_PROGRESS}
                ]
            });
            // The open contract runs to today, one day past its deadline
            expect(component.contract.pastDeadline!.left).toBeCloseTo(component.position(component.today), 5);
            expect(component.contract.pastDeadline!.whole).toBeFalse();
            let byName = (name: string) => component.stages.find(stage => stage.name === name)!;
            let concept = byName('Concept').pastDeadline!;
            expect(concept.left).toBeCloseTo(component.position(addDays(component.today, -4)), 5);
            expect(concept.width).toBeCloseTo(component.span(addDays(component.today, -4), addDays(component.today, -2)), 5);
            // Ending on its deadline is not late
            expect(byName('Visualisations').pastDeadline).toBeUndefined();
            // Late from its first day: the whole bar is striped
            expect(byName('Supervision').pastDeadline!.whole).toBeTrue();
            expect(fixture.nativeElement.querySelectorAll('.app-past-deadline').length).toBeGreaterThanOrEqual(3);
        });

        it('flags a done stage without an end date as a data error, with no bar', () => {
            render({
                id: 13, startDate: day(-30), contract: {}, stages: [
                    {id: 1, name: 'Concept', startDate: day(-20), deadline: day(-5), status: StageStatus.DONE}
                ]
            });
            let stage = component.stages[0];
            expect(stage.missingEnd).toBeTrue();
            expect(stage.dateError).toBe('Done, but the stage has no end date');
            expect(stage.width).toBe(0);
            expect(component.anyDateError).toBeTrue();
            expect(fixture.nativeElement.textContent).toContain('Date error');
        });

        it('flags an end before the start as a data error instead of drawing an open bar', () => {
            render({
                id: 16, startDate: day(-30), endDate: day(-40), contract: {startDate: day(-30), endDate: day(-35)}, stages: [
                    {id: 1, name: 'Concept', startDate: day(-20), endDate: day(-25), status: StageStatus.IN_PROGRESS}
                ]
            });
            expect(component.endBeforeStart).toBeTrue();
            expect(component.openEnded).toBeFalse();
            expect(component.durationDays).toBe(0);
            expect(component.work.dateError).toBe('The end date is before the start date');
            expect(component.work.width).toBe(0);
            expect(component.contract.open).toBeFalse();
            expect(component.contract.dateError).toBeDefined();
            let stage = component.stages[0];
            expect(stage.dateError).toBe('The end date is before the start date');
            expect(stage.width).toBe(0);
            expect(stage.label).not.toContain('-');
            let text = fixture.nativeElement.textContent;
            expect(text).toContain('Before start');
            expect(text).not.toContain('Ongoing');
            expect(text).not.toContain('so far');
        });

        it('says when a stage with a start but no bar begins', () => {
            render({
                id: 17, startDate: day(-30), contract: {}, stages: [
                    {id: 1, name: 'Supervision', startDate: day(40), deadline: day(80), status: StageStatus.TO_DO},
                    {id: 2, name: 'Visualisations', startDate: day(-10), status: StageStatus.REJECTED}
                ]
            });
            expect(component.stages.map(stage => stage.note)).toEqual([
                `From ${format(addDays(component.today, -10), 'dd.MM.yyyy')}, no end date`,
                `Starts ${format(addDays(component.today, 40), 'dd.MM.yyyy')}`
            ]);
            expect(fixture.nativeElement.textContent).toContain('Starts ');
        });

        it('dashes an open contract that starts later from the day after its start, not from tomorrow', () => {
            render({id: 18, contract: {startDate: day(30), deadline: day(90)}, stages: []});
            let start = addDays(component.today, 30);
            expect(component.contract.open).toBeTrue();
            expect(component.contract.days).toBe(0);
            expect(component.contract.label).toBe('Starts in 30 days');
            expect(component.contract.toDeadline!.left).toBeCloseTo(component.position(addDays(start, 1)), 5);
        });

        it('reads backend dates as local days', () => {
            render({id: 19, startDate: '2026-05-01', contract: {}, stages: []});
            expect(component.start).toEqual(new Date(2026, 4, 1));
        });

        it('shows when the installments could not be loaded and asks to try again', () => {
            let reloads = 0;
            component.reloadInstallments.subscribe(() => reloads++);
            fixture.componentRef.setInput('installmentsLoadFailed', true);
            fixture.detectChanges();
            let text = fixture.nativeElement.textContent;
            expect(text).toContain("Installment payment dates couldn't be loaded.");
            expect(text).toContain("Couldn't load");
            let retry = [...fixture.nativeElement.querySelectorAll('button')].find((button: HTMLElement) => button.textContent!.includes('Try again')) as HTMLElement;
            retry.click();
            expect(reloads).toBe(1);
        });

        it('shows the empty state only when the project has no dates at all', () => {
            render({id: 5, contract: {}, stages: [{id: 1, name: 'Concept'}]});
            expect(component.rangeStart).toBeUndefined();
            expect(fixture.nativeElement.textContent).toContain('No dates yet');
        });
    });
});
