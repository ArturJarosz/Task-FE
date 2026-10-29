import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Menu} from 'primeng/menu';

import {DashboardComponent} from './dashboard.component';
import {DashboardLayout} from '../layout/dashboard-layout';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;

    // Row 2 is one 50% stack of two widgets
    const layout: DashboardLayout = {
        rows: [
            {stacks: [{width: 50, widgets: [{type: 'upcoming-events'}]}, {width: 25, widgets: [{type: 'balance-kpi'}]}]},
            {stacks: [{width: 50, widgets: [{type: 'year-summary'}, {type: 'active-projects-kpi'}]}]},
        ]
    };
    const menuStub = {toggle: () => undefined} as unknown as Menu;

    const element = (): HTMLElement => fixture.nativeElement;
    const titles = (root: Element): (string | undefined)[] => Array.from(root.querySelectorAll('.app-card-title, .app-kpi-label'))
        .map(title => title.textContent?.trim());
    const buttons = (text: string): HTMLButtonElement[] => Array.from(element().querySelectorAll('button'))
        .filter(button => button.textContent?.trim() === text);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('layout', layout);
        fixture.detectChanges();
    });

    it('should show the stacks of the layout, row by row, at their widths', () => {
        const year = component.currentYear;
        const stacks = element().querySelectorAll('.xl\\:col-span-2');

        expect(titles(element())).toEqual(['Upcoming events', `Balance in ${year} (gross)`, `${year} summary`, 'Active projects']);
        expect(titles(stacks[0])).toEqual(['Upcoming events']);
        expect(titles(stacks[1])).toEqual([`${year} summary`, 'Active projects']);
        expect(element().querySelector('[aria-label="Customize dashboard"]')).not.toBeNull();
    });

    it('should show an empty state when every widget was removed', () => {
        fixture.componentRef.setInput('layout', {rows: []});
        fixture.detectChanges();

        expect(element().textContent).toContain('Your dashboard is empty');
    });

    describe('in edit mode', () => {
        let drafts: DashboardLayout[];

        beforeEach(() => {
            drafts = [];
            component.draftLayoutChange.subscribe(draft => drafts.push(draft));
            fixture.componentRef.setInput('draftLayout', layout);
            fixture.detectChanges();
        });

        it('should offer only stack widths that fit the row', () => {
            const widths = (label: string) => Array.from(element().querySelector(`[aria-label="${label}"]`)!
                .querySelectorAll('button')).map(button => button.disabled);

            expect(widths('Upcoming events width')).toEqual([false, false, false, true]);
            expect(widths('Year summary and Active projects count width')).toEqual([false, false, false, false]);
        });

        it('should change the width of a stack', () => {
            element().querySelector('[aria-label="Upcoming events width"]')!.querySelectorAll('button')[2].click();

            expect(drafts.pop()!.rows[0].stacks[0]).toEqual({width: 75, widgets: [{type: 'upcoming-events'}]});
        });

        it('should add rows, and widgets as new stacks', () => {
            buttons('Add row')[0].click();
            expect(drafts.pop()!.rows.length).toBe(3);

            // Both rows have free space and widgets that fit it
            expect(buttons('Add widget').length).toBe(2);
            component.addWidgetRow = 1;
            component.onAddWidget('finance-chart');

            expect(drafts.pop()!.rows[1].stacks[1]).toEqual({width: 50, widgets: [{type: 'finance-chart'}]});
            expect(component.addWidgetRow).toBeNull();
        });

        it('should take a widget out of its stack from the widget menu', () => {
            component.openWidgetMenu(new MouseEvent('click'), {row: 1, stack: 0, index: 1}, menuStub);
            const moveOut = component.widgetMenuItems.find(item => item.label === 'Move out of stack')!;
            moveOut.command!({});

            expect(drafts.pop()!.rows[1].stacks).toEqual([
                {width: 50, widgets: [{type: 'year-summary'}]},
                {width: 50, widgets: [{type: 'active-projects-kpi'}]},
            ]);
        });

        it('should hide moves within a stack for a widget that is alone in it', () => {
            component.openWidgetMenu(new MouseEvent('click'), {row: 0, stack: 0, index: 0}, menuStub);
            const visible = component.widgetMenuItems.filter(item => item.visible !== false && !item.separator)
                .map(item => item.label);

            expect(visible).toEqual(['Move into stack on the left', 'Move into stack on the right', 'Remove widget']);
        });

        it('should leave the dashboard actions to save or cancel', () => {
            expect(element().querySelector('[aria-label="Customize dashboard"]')).toBeNull();
            expect(buttons('Save layout').length).toBe(1);
            expect(buttons('Cancel').length).toBe(1);
        });
    });
});
