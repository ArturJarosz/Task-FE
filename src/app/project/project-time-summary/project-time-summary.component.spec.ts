import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ProjectTimeSummaryComponent} from './project-time-summary.component';
import {provideTestDependencies} from '../../../testing/test-providers';
import {ProjectTimeSummary} from '../../generated/models/project-time-summary';

describe('ProjectTimeSummaryComponent', () => {
    let fixture: ComponentFixture<ProjectTimeSummaryComponent>;
    let component: ProjectTimeSummaryComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProjectTimeSummaryComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(ProjectTimeSummaryComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('projectId', 7);
    });

    function show(timeSummary: ProjectTimeSummary): string {
        fixture.componentRef.setInput('timeSummary', timeSummary);
        fixture.detectChanges();
        return fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    }

    // "label: value" of each figure in the footer
    function footerTexts(): string[] {
        const text = (element: Element | null) => (element?.textContent ?? '').replace(/\s+/g, ' ').trim();
        return Array.from(fixture.nativeElement.querySelectorAll('dl > div') as NodeListOf<HTMLElement>)
            .map(figure => `${text(figure.querySelector('dt'))}: ${text(figure.querySelector('dd'))}`);
    }

    it('should show the time spent and the rates per hour', () => {
        const text = show({
            totalMinutes: 5190, tasksMinutes: 4830, supervisionMinutes: 360,
            netValue: 18400, contractValue: 24000, netValuePerHour: 212.72, contractValuePerHour: 277.46
        });

        expect(footerTexts()).toEqual(['Time spent: 86h 30m', 'Net value / h: 213 zł', 'Contract / h: 277 zł']);
        expect(text).not.toContain('Log time on tasks');
    });

    it('should link to the project\'s stages, where the time of each stage is', () => {
        show({totalMinutes: 60, netValuePerHour: 100, contractValuePerHour: 120});

        const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
        expect(link.textContent?.trim()).toBe('Stages');
        expect(link.getAttribute('href')).toBe('/projects/7/stages');
    });

    it('should show the rates as not available and ask for time on tasks while none is logged', () => {
        const text = show({
            totalMinutes: 0, tasksMinutes: 0, supervisionMinutes: 0, netValue: 18400, contractValue: 24000
        });

        expect(text).toContain('Log time on tasks to see the rate per hour.');
        expect(footerTexts()).toEqual(['Time spent: 0h', 'Net value / h: –', 'Contract / h: –']);
        expect(fixture.nativeElement.querySelector('[aria-label="Net value / h: not available"]')).not.toBeNull();
    });

    it('should offer to try again when the summary failed to load', () => {
        fixture.componentRef.setInput('loadFailed', true);
        fixture.detectChanges();
        const reload = jasmine.createSpy('reload');
        component.reload.subscribe(reload);

        const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
        expect(button.textContent).toContain('Try again');
        button.click();

        expect(reload).toHaveBeenCalled();
        expect(fixture.nativeElement.querySelector('dl')).toBeNull();
    });
});
