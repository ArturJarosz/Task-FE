import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ClientFormProvider, ClientProjectsSummaryForm} from "../form/client-form-provider";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {resolveLabel} from "../../shared/utils/label-utils";
import {Accordion, AccordionPanel, AccordionHeader, AccordionContent} from "primeng/accordion";
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {CurrencyPipe} from "@angular/common";

@Component({
    selector: 'client-projects-summary',
    templateUrl: './client-projects-summary.component.html',
    styleUrl: './client-projects-summary.component.less',
    standalone: true,
    imports: [Accordion, AccordionPanel, AccordionHeader, AccordionContent, TableModule, RouterLink, ReactiveFormsModule, CurrencyPipe]
})
export class ClientProjectsSummaryComponent implements OnInit, OnChanges {
    @Input()
    clientProjectsSummary!: EntityProjectsSummary | null;
    @Input()
    projectTypes: ConfigurationEntry[] | null = [];
    @Input()
    projectStatuses: ConfigurationEntry[] | null = [];

    clientProjectsSummaryForm!: FormGroup<ClientProjectsSummaryForm>;

    constructor(private formProvider: ClientFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.clientProjectsSummaryForm = this.formProvider.getClientProjectsSummary();
        this.fillClientProjectsSummaryFormData();
    }

    ngOnInit(): void {
        if (this.clientProjectsSummary) {
            this.fillClientProjectsSummaryFormData();
        }
    }

    private fillClientProjectsSummaryFormData(): void {
        if (!this.clientProjectsSummary || !this.clientProjectsSummaryForm) {
            return;
        }

        this.clientProjectsSummaryForm.patchValue({
            totalValue: this.clientProjectsSummary.totalValue,
            count: this.clientProjectsSummary.numberOfProjects
        })
    }

    getProjectTypeLabel(type: string): string {
        return resolveLabel(type, this.projectTypes);
    }

    getProjectStatusLabel(type: string): string {
        return resolveLabel(type, this.projectStatuses);
    }

}
