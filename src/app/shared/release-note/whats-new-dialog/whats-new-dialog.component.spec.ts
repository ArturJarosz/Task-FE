import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WhatsNewDialogComponent} from './whats-new-dialog.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('WhatsNewDialogComponent', () => {
    let fixture: ComponentFixture<WhatsNewDialogComponent>;

    const releaseNotes = [
        {id: 3, title: 'First change', description: 'First description', applicationVersion: '0.7.0', createdDateTime: '2026-11-03T10:00:00'},
        {id: 2, title: 'Second change', description: 'Second description', applicationVersion: '0.7.0', createdDateTime: '2026-11-03T10:00:00'},
        {id: 1, title: 'Third change', description: 'Third description', applicationVersion: '0.6.2', createdDateTime: '2026-09-15T10:00:00'},
    ];

    function titleButton(index: number): HTMLButtonElement {
        return document.body.querySelectorAll<HTMLButtonElement>('li button[aria-expanded]')[index];
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [WhatsNewDialogComponent],
            providers: provideTestDependencies()
        });
        fixture = TestBed.createComponent(WhatsNewDialogComponent);
        fixture.componentRef.setInput('releaseNotes', releaseNotes);
        fixture.componentRef.setInput('mode', 'history');
        fixture.detectChanges();
    });

    it('groups the changes under their versions, newest first', () => {
        let sections = document.body.querySelectorAll('section');

        expect(sections.length).toBe(2);
        expect(sections[0].querySelector('h3')?.textContent).toContain('Version 0.7.0');
        expect(sections[0].querySelectorAll('li').length).toBe(2);
        expect(sections[1].querySelector('h3')?.textContent).toContain('Version 0.6.2');
        expect(sections[1].textContent).toContain('Third change');
    });

    it('shows the date next to the version and not on each change', () => {
        let sections = document.body.querySelectorAll('section');

        expect(sections[0].querySelector('h3')?.parentElement?.textContent).toContain('03.11.2026');
        expect(sections[1].querySelector('h3')?.parentElement?.textContent).toContain('15.09.2026');
        document.body.querySelectorAll('li').forEach(row => expect(row.textContent).not.toMatch(/\d{2}\.\d{2}\.\d{4}/));
    });

    it('lists the titles with descriptions hidden', () => {
        expect(document.body.textContent).toContain('First change');
        expect(document.body.textContent).toContain('Second change');
        expect(document.body.textContent).not.toContain('First description');
        expect(titleButton(0).getAttribute('aria-expanded')).toBe('false');
    });

    it('shows and hides only the description of the clicked change', () => {
        titleButton(1).click();
        fixture.detectChanges();

        expect(document.body.textContent).toContain('Second description');
        expect(document.body.textContent).not.toContain('First description');
        expect(titleButton(1).getAttribute('aria-expanded')).toBe('true');

        titleButton(1).click();
        fixture.detectChanges();

        expect(document.body.textContent).not.toContain('Second description');
    });

    it('starts with titles only each time it opens', () => {
        titleButton(0).click();
        fixture.detectChanges();

        fixture.componentRef.setInput('mode', null);
        fixture.detectChanges();
        fixture.componentRef.setInput('mode', 'history');
        fixture.detectChanges();

        expect(document.body.textContent).not.toContain('First description');
    });
});
