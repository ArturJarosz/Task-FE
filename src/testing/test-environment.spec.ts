import {NgZone} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('Test environment', () => {
    it('should run change detection on zone.js like the app', () => {
        // With zoneless change detection NgZone is a no-op and run() stays outside the Angular zone
        const ranInAngularZone = TestBed.inject(NgZone).run(() => NgZone.isInAngularZone());

        expect(ranInAngularZone).toBeTrue();
    });
});
