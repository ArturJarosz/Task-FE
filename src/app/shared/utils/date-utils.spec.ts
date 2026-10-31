import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {updateAtMidnight} from './date-utils';

@Component({selector: 'app-midnight-host', template: '', standalone: true})
class MidnightHostComponent {
    updates = 0;

    constructor() {
        updateAtMidnight(() => this.updates++);
    }
}

describe('updateAtMidnight', () => {
    const HOUR = 60 * 60 * 1000;

    beforeEach(() => {
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(2026, 9, 31, 22, 0));
    });
    afterEach(() => jasmine.clock().uninstall());

    it('updates just after midnight, then every following midnight', () => {
        const host = TestBed.createComponent(MidnightHostComponent).componentInstance;
        jasmine.clock().tick(2 * HOUR - 1);
        expect(host.updates).toBe(0);
        jasmine.clock().tick(1001);
        expect(host.updates).toBe(1);
        jasmine.clock().tick(24 * HOUR);
        expect(host.updates).toBe(2);
    });

    it('catches up when the tab is shown again after the computer slept past midnight', () => {
        const host = TestBed.createComponent(MidnightHostComponent).componentInstance;
        // Asleep: the date moves on, but no timer runs
        jasmine.clock().mockDate(new Date(2026, 10, 1, 8, 0));
        document.dispatchEvent(new Event('visibilitychange'));
        expect(host.updates).toBe(1);
        // The same day shown again changes nothing
        document.dispatchEvent(new Event('visibilitychange'));
        expect(host.updates).toBe(1);
    });

    it('stops when the component is destroyed', () => {
        const fixture = TestBed.createComponent(MidnightHostComponent);
        fixture.destroy();
        jasmine.clock().tick(3 * HOUR);
        document.dispatchEvent(new Event('visibilitychange'));
        expect(fixture.componentInstance.updates).toBe(0);
    });
});
