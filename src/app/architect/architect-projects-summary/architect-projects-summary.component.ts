import {Component, Input, SimpleChanges} from '@angular/core';
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {resolveLabel} from "../../shared/utils/label-utils";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ArchitectFormProvider, ArchitectProjectsSummaryForm} from "../form/architect-form-provider";
import {isUndefinedOrEmpty} from "../../shared/utils/data-validation-util";
import {Accordion, AccordionPanel, AccordionHeader, AccordionContent} from "primeng/accordion";
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {CurrencyPipe} from "@angular/common";

@Component({
    selector: 'architect-projects-summary',
    templateUrl: './architect-projects-summary.component.html',
    styleUrl: './architect-projects-summary.component.less',
    standalone: true,
    imports: [Accordion, AccordionPanel, AccordionHeader, AccordionContent, TableModule, RouterLink, ReactiveFormsModule, CurrencyPipe]
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
