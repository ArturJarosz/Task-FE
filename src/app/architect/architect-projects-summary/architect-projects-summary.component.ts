import {Component, Input, SimpleChanges} from '@angular/core';
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {resolveLabel} from "../../shared/utils/label-utils";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup} from "@angular/forms";
import {ArchitectFormProvider, ArchitectProjectsSummaryForm} from "../form/architect-form-provider";
import {isUndefinedOrEmpty} from "../../shared/utils/data-validation-util";

@Component({
    selector: 'architect-projects-summary',
    templateUrl: './architect-projects-summary.component.html',
    styleUrl: './architect-projects-summary.component.less'
})
export class ArchitectProjectsSummaryComponent {
    @Input()
    architectProjectsSummary!: EntityProjectsSummary;
    @Input()
    projectTypes: ConfigurationEntry[] | null = [];
    @Input()
    projectStatuses: ConfigurationEntry[] | null = [];
    @Input()
    architectProjectsSummaryForm!: FormGroup<ArchitectProjectsSummaryForm>;

    formInitialized: boolean = false;

    constructor(private formProvider: ArchitectFormProvider) {
    }

    getProjectTypeLabel(type: string): string {
        return resolveLabel(type, this.projectTypes);
    }

    getProjectStatusLabel(type: string): string {
        return resolveLabel(type, this.projectStatuses);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.formInitialized) {
            this.architectProjectsSummaryForm = this.formProvider.getArchitectProjectsSummaryForm();
            this.formInitialized = true;
        }
        if (this.architectProjectsSummary && changes['architectProjectsSummary']) {
            this.fillFormData();
        }
    }

    fillFormData(): void {
        if (isUndefinedOrEmpty(this.architectProjectsSummary) || !this.architectProjectsSummaryForm) {
            return;
        }
        this.architectProjectsSummaryForm.patchValue({
            count: this.architectProjectsSummary.numberOfProjects,
            totalValue: this.architectProjectsSummary.totalValue,
        })
    }
}
