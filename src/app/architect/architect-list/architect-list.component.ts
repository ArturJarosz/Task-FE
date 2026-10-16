import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Architect} from "../../generated/models/architect";
import {TableModule} from "primeng/table";
import {RouterLink} from "@angular/router";
import {DatePipe, NgIf} from "@angular/common";
import {EmptyStateComponent} from "../../shared";

export interface ArchitectRow {
    architect: Architect;
    projects: number;
    activeProjects: number;
}

@Component({
    selector: 'architect-list',
    templateUrl: './architect-list.component.html',
    styleUrls: ['./architect-list.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TableModule, RouterLink, NgIf, DatePipe, EmptyStateComponent]
})
export class ArchitectListComponent {
    @Input()
    rows: ArchitectRow[] = [];

    getName(architect: Architect): string {
        return `${architect.firstName ?? ''} ${architect.lastName ?? ''}`.trim();
    }

    getInitials(architect: Architect): string {
        if (architect.firstName && architect.lastName) {
            return `${architect.firstName.charAt(0)}${architect.lastName.charAt(0)}`.toUpperCase();
        }
        return '?';
    }
}
