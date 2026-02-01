import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AddSupervisionComponent} from './add-supervision.component';

describe('AddSupervisionComponent', () => {
    let component: AddSupervisionComponent;
    let fixture: ComponentFixture<AddSupervisionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AddSupervisionComponent]
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
