import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {TooltipModule} from "primeng/tooltip";
import {EmptyStateComponent, NotSetComponent} from "../../shared";
import {SystemParameter} from "../../generated/models/system-parameter";
import {formatParameterValue, SystemParameterType} from "../system-parameter-format";

// Compact table of system parameters: one short row each, edited through a pencil button
@Component({
    selector: 'system-parameter-list',
    templateUrl: './system-parameter-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, SkeletonModule, TooltipModule, EmptyStateComponent, NotSetComponent]
})
export class SystemParameterListComponent {
    @Input()
    systemParameters: SystemParameter[] = [];
    @Input()
    loading = false;
    @Input()
    loadFailed = false;

    @Output()
    editParameter = new EventEmitter<SystemParameter>();
    @Output()
    retry = new EventEmitter<void>();

    readonly skeletonRows = [1, 2, 3];
    readonly formatValue = formatParameterValue;
    protected readonly SystemParameterType = SystemParameterType;
}
