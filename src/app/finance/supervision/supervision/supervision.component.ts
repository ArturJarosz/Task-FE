import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Supervision} from '../../../generated/models/supervision';
import {SupervisionVisit} from '../../../generated/models/supervision-visit';
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {ButtonModule} from "primeng/button";
import {NgFor, NgIf, DatePipe, CurrencyPipe} from "@angular/common";
import {EmptyStateComponent} from "../../../shared";
import {FinanceStat} from "../../../shared/finance-component-summary/finance-component-summary.component";

@Component({
    selector: 'supervision',
    templateUrl: './supervision.component.html',
    styleUrl: './supervision.component.less',
    standalone: true,
    imports: [TableModule, RouterLink, NgFor, NgIf, ButtonModule, DatePipe, CurrencyPipe, EmptyStateComponent]
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

    stats: FinanceStat[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['supervision'] && this.supervision) {
            // Gross value, tax and VAT are not calculated for supervision yet, so only the net value is shown
            this.stats = [
                {label: 'Base rate', value: this.supervision.baseNetRate, money: true},
                {label: 'Hourly rate', value: this.supervision.hourlyNetRate, money: true},
                {label: 'Hours', value: this.supervision.hoursCount, money: false},
                {label: 'Visit rate', value: this.supervision.visitNetRate, money: true},
                {label: 'Visits', value: this.supervision.visitCount, money: false},
                {label: 'Net value', value: this.supervision.value, money: true},
            ];
        }
    }

    onAddSupervisionClick(): void {
        this.notify.emit(true);
    }

    onAddVisitClick(): void {
        this.notifyAddVisit.emit();
    }
}
