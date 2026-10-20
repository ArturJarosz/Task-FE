import {TestBed} from '@angular/core/testing';

import {AuthorizationService} from './authorization.service';
import {provideTestDependencies} from '../../testing/test-providers';

describe('AuthorizationServiceService', () => {
    let service: AuthorizationService;

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        service = TestBed.inject(AuthorizationService);
    });

    it('should be created', () => {
        expect(service)
            .toBeTruthy();
    });
});
