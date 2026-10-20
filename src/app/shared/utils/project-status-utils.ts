import {Project} from "../../generated/models/project";
import {ProjectStatus} from "../../generated/models/project-status";

// Active statuses come from the configuration endpoint (backend property task.project.active-statuses)
export function isActiveProject(project: Project, activeStatuses: ProjectStatus[] | null): boolean {
    return !!project.status && (activeStatuses ?? []).includes(project.status);
}
