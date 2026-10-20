import {TestBed} from '@angular/core/testing';

import {BreadcrumbService} from './breadcrumb.service';
import {provideTestDependencies} from '../../../testing/test-providers';

describe('BreadcrumbService', () => {
    let service: BreadcrumbService;

    beforeEach(() => {
        TestBed.configureTestingModule({providers: provideTestDependencies()});
        service = TestBed.inject(BreadcrumbService);
    });

    it('should be created', () => {
        expect(service)
            .toBeTruthy();
    });
});
