import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {SkeletonModule} from "primeng/skeleton";
import {TooltipModule} from "primeng/tooltip";
import {EmptyStateComponent} from "../../shared";
import {ProjectType} from "../../generated/models/project-type";

// Compact table of project types: one short row each, renamed through a pencil button and deleted through a trash
// button, which is disabled while any project has the type
@Component({
    selector: 'project-type-list',
    templateUrl: './project-type-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, SkeletonModule, TooltipModule, EmptyStateComponent]
})
export class ProjectTypeListComponent {
    @Input()
    projectTypes: ProjectType[] = [];
    @Input()
    loading = false;
    @Input()
    loadFailed = false;
    // Id of the project type being deleted
    @Input()
    deleting: number | null = null;

    @Output()
    add = new EventEmitter<void>();
    @Output()
    rename = new EventEmitter<ProjectType>();
    @Output()
    delete = new EventEmitter<ProjectType>();
    @Output()
    retry = new EventEmitter<void>();

    readonly skeletonRows = [1, 2, 3];

    isUsed(projectType: ProjectType): boolean {
        return (projectType.numberOfProjects ?? 0) > 0;
    }

    projectsText(projectType: ProjectType): string {
        let count = projectType.numberOfProjects ?? 0;
        return count === 1 ? '1 project' : `${count} projects`;
    }

    deleteTooltip(projectType: ProjectType): string {
        return this.isUsed(projectType)
            ? `Used by ${this.projectsText(projectType)}, so it can't be deleted`
            : `Delete ${projectType.name}`;
    }
}
