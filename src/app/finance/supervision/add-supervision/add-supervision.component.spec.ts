import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AddSupervisionComponent} from './add-supervision.component';
import {provideTestDependencies} from '../../../../testing/test-providers';

describe('AddSupervisionComponent', () => {
    let component: AddSupervisionComponent;
    let fixture: ComponentFixture<AddSupervisionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AddSupervisionComponent],
            providers: provideTestDependencies()
        })
            .compileComponents();

        fixture = TestBed.createComponent(AddSupervisionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component)
            .toBeTruthy();
    });
});
