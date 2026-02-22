import {Component, Input, OnChanges, Signal, SimpleChanges} from '@angular/core';
import {Architect} from "../../generated/models/architect";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
    ArchitectDetailsForm,
    ArchitectFormProvider,
    ArchitectProjectsSummaryForm
} from "../form/architect-form-provider";
import {isUndefinedOrEmpty} from "../../shared/utils/data-validation-util";
import {EntityProjectsSummary} from "../../generated/models/entity-projects-summary";
import {ConfigurationEntry} from "../../generated/models/configuration-entry";
import {WrapperComponent} from "../../shared/wrapper/wrapper.component";
import {ArchitectProjectsSummaryComponent} from "../architect-projects-summary/architect-projects-summary.component";
import {Accordion, AccordionPanel, AccordionHeader, AccordionContent} from "primeng/accordion";
import {InputTextModule} from "primeng/inputtext";

@Component({
    selector: 'architect-detail',
    templateUrl: './architect-detail.component.html',
    styleUrls: ['./architect-detail.component.less'],
    standalone: true,
    imports: [WrapperComponent, ArchitectProjectsSummaryComponent, Accordion, AccordionPanel, AccordionHeader, AccordionContent, InputTextModule, ReactiveFormsModule]
})
export class ArchitectDetailComponent implements OnChanges {
    pageTitle: string = "";
    // main info labels
    architectIdLabel: string = "ID:"
    firstNameLabel: string = "First name:";
    lastNameLabel: string = "Last name:";

    @Input()
    architect!: Architect | null;
    @Input()
    $architectProjectsSummary!: Signal<EntityProjectsSummary>;
    @Input()
    projectTypes!: ConfigurationEntry[];
    @Input()
    projectStatuses!: ConfigurationEntry[];

    architectId!: number;
    architectDetailForm!: FormGroup<ArchitectDetailsForm>;
    architectProjectsSummaryForm!: FormGroup<ArchitectProjectsSummaryForm>;
    formInitialized: boolean = false;

    constructor(private formProvider: ArchitectFormProvider) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.formInitialized) {
            this.architectDetailForm = this.formProvider.getArchitectDetailsForm();
            this.architectProjectsSummaryForm = this.formProvider.getArchitectProjectsSummaryForm();
            this.formInitialized = true;
        }
        if (this.architect && changes['architect']) {
            this.fillFormData();
        }
    }

    fillFormData(): void {
        if (isUndefinedOrEmpty(this.architect) || !this.architectDetailForm) {
            return;
        }
        this.pageTitle = `${this.architect?.firstName} ${this.architect?.lastName}`;
        this.architectDetailForm.patchValue({
            firstName: this.architect?.firstName,
            lastName: this.architect?.lastName
        })
    }
}
