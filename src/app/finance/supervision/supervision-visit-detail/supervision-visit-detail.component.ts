import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {SupervisionVisit} from "../../../generated/models/supervision-visit";
import {FormGroup} from '@angular/forms';
import {SupervisionVisitForm, SupervisionVisitFormProvider} from "../form/supervision-visit-form-provider";
import {cloneDeep} from "lodash";
import {toDateIfExists, toTimeZoneString} from "../../../shared/utils/date-utils";

@Component({
    selector: 'supervision-visit-detail',
    templateUrl: './supervision-visit-detail.component.html',
    styleUrl: './supervision-visit-detail.component.less'
})
export class SupervisionVisitDetailComponent implements OnInit, OnChanges {
    @Input()
    supervisionVisit!: SupervisionVisit | null;

    @Output()
    updateVisitEvent: EventEmitter<SupervisionVisit> = new EventEmitter<SupervisionVisit>();

    @Output()
    deleteVisitEvent: EventEmitter<{visitId: number, dateOfVisit: string}> = new EventEmitter<{visitId: number, dateOfVisit: string}>();

    initialVisitDetailForm!: FormGroup<SupervisionVisitForm>;
    visitDetailForm!: FormGroup<SupervisionVisitForm>;

    constructor(private supervisionVisitFormProvider: SupervisionVisitFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.supervisionVisit && this.visitDetailForm) {
            this.fillFormData();
            this.initialVisitDetailForm = cloneDeep(this.visitDetailForm);
        }
    }

    ngOnInit(): void {
        this.visitDetailForm = this.supervisionVisitFormProvider.getSupervisionVisitForm();
        this.fillFormData();
    }

    private fillFormData(): void {
        if (!this.supervisionVisit) {
            return;
        }
        this.visitDetailForm.patchValue({
            dateOfVisit: toDateIfExists(this.supervisionVisit.dateOfVisit),
            hoursCount: this.supervisionVisit.hoursCount,
            payable: this.supervisionVisit.payable
        })
    }

    isFormChanged(): boolean {
        if (this.visitDetailForm.pristine) {
            return false;
        }
        return JSON.stringify(this.initialVisitDetailForm.value) !== JSON.stringify(this.visitDetailForm.value);
    }

    onSave(): void {
        let visit: SupervisionVisit = {
            id: this.supervisionVisit?.id,
            supervisionId: this.supervisionVisit?.supervisionId,
            dateOfVisit: toTimeZoneString(this.visitDetailForm.value.dateOfVisit),
            hoursCount: this.visitDetailForm.value.hoursCount,
            payable: this.visitDetailForm.value.payable
        };
        this.updateVisitEvent.emit(visit);
    }

    onDelete(): void {
        if (this.supervisionVisit?.id && this.supervisionVisit?.dateOfVisit) {
            this.deleteVisitEvent.emit({
                visitId: this.supervisionVisit.id,
                dateOfVisit: this.supervisionVisit.dateOfVisit
            });
        }
    }
}
