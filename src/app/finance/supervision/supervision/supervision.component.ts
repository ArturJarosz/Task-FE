import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Supervision} from '../../../generated/models/supervision';
import {SupervisionVisit} from '../../../generated/models/supervision-visit';
import {Accordion, AccordionPanel, AccordionHeader, AccordionContent} from "primeng/accordion";
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {NgIf, DatePipe, CurrencyPipe} from "@angular/common";

@Component({
    selector: 'supervision',
    templateUrl: './supervision.component.html',
    styleUrl: './supervision.component.less',
    standalone: true,
    imports: [Accordion, AccordionPanel, AccordionHeader, AccordionContent, TableModule, RouterLink, ReactiveFormsModule, NgIf, ButtonModule, DatePipe, CurrencyPipe]
})
export class SupervisionComponent implements OnChanges {
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    notifyAddVisit: EventEmitter<void> = new EventEmitter<void>();

    @Input()
    supervision: Supervision | null = null;

    @Input()
    supervisionVisits: SupervisionVisit[] = [];

    @Input()
    projectId: number = 0;

    @Input()
    supervisionId: number = 0;

    supervisionSummaryForm = new FormGroup({
        baseRate: new FormControl<number>(0),
        hourlyRate: new FormControl<number>(0),
        hoursCount: new FormControl<number>(0),
        visitRate: new FormControl<number>(0),
        visitsCount: new FormControl<number>(0),
        grossValue: new FormControl<number>(0),
        netValue: new FormControl<number>(0),
        tax: new FormControl<number>(0),
        vat: new FormControl<number>(0)
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['supervision'] && this.supervision) {
            this.supervisionSummaryForm.patchValue({
                baseRate: this.supervision.baseNetRate ?? 0,
                hourlyRate: this.supervision.hourlyNetRate ?? 0,
                hoursCount: this.supervision.hoursCount ?? 0,
                visitRate: this.supervision.visitNetRate ?? 0,
                visitsCount: this.supervision.visitCount ?? 0,
                grossValue: 0,
                netValue: this.supervision.value ?? 0,
                tax: 0,
                vat: 0
            });
        }
    }

    onAddSupervisionClick(): void {
        this.notify.emit(true);
    }

    onAddVisitClick(): void {
        this.notifyAddVisit.emit();
    }
}
