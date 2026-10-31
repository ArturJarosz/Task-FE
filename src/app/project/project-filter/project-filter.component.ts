import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {PopoverModule} from "primeng/popover";
import {InputTextModule} from "primeng/inputtext";
import {IconFieldModule} from "primeng/iconfield";
import {InputIconModule} from "primeng/inputicon";
import {SelectModule} from "primeng/select";
import {MultiSelectModule} from "primeng/multiselect";
import {DatePickerModule} from "primeng/datepicker";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {ConfigurationEntry} from "../../generated/models";
import {activeFilters, EMPTY_FILTER, FilterOption, ProjectFilter} from "./project-filter";

// The "Filter" button of the Projects card and its popover form; filters apply as they change
@Component({
    selector: 'project-filter',
    templateUrl: './project-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FormsModule, ButtonModule, PopoverModule, InputTextModule, IconFieldModule, InputIconModule, SelectModule,
        MultiSelectModule, DatePickerModule, ToggleSwitchModule]
})
export class ProjectFilterComponent {
    @Input()
    filter: ProjectFilter = EMPTY_FILTER;
    @Input()
    clients: FilterOption[] = [];
    @Input()
    architects: FilterOption[] = [];
    @Input()
    projectTypes: ConfigurationEntry[] | null = [];
    @Input()
    contractStatuses: ConfigurationEntry[] | null = [];
    @Output()
    filterChange: EventEmitter<ProjectFilter> = new EventEmitter<ProjectFilter>();

    get activeCount(): number {
        return activeFilters(this.filter).length;
    }

    get buttonLabel(): string {
        return this.activeCount ? `Filter · ${this.activeCount}` : 'Filter';
    }

    set<K extends keyof ProjectFilter>(key: K, value: ProjectFilter[K]): void {
        this.filterChange.emit({...this.filter, [key]: value});
    }

    clear(): void {
        this.filterChange.emit(EMPTY_FILTER);
    }
}
