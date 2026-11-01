import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideTestDependencies} from '../../../testing/test-providers';

import {Partner, PartnerDetailComponent} from './partner-detail.component';

describe('PartnerDetailComponent', () => {
    let fixture: ComponentFixture<PartnerDetailComponent>;
    let component: PartnerDetailComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PartnerDetailComponent],
            providers: provideTestDependencies()
        }).compileComponents();

        fixture = TestBed.createComponent(PartnerDetailComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('entityLabel', 'contractor');
        // Configuration entries hold category ids as strings; contractors hold them as numbers
        fixture.componentRef.setInput('categories', [{id: '100', label: 'General'}, {id: '101', label: 'Plumber'}]);
        fixture.componentRef.setInput('partner', {id: 1, name: 'NORSON', categoryId: 101});
        fixture.detectChanges();
    });

    it('should show the category label and select the category in the edit form', () => {
        expect(component.categoryLabel).toBe('Plumber');
        expect(component.form.getRawValue().category).toBe('101');
    });

    it('should send the chosen category as a numeric categoryId', () => {
        let updated: Partner | undefined;
        component.updateEvent.subscribe(partner => updated = partner);

        component.form.patchValue({category: '100'});
        component.onSave();

        expect(updated?.categoryId).toBe(100);
    });
});
