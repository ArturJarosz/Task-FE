import {ConfigurationEntry} from "../../../generated/models/configuration-entry";
import {ProjectStatus} from "../../../generated/models/project-status";

export interface ApplicationConfiguration {
    supplierTypes: ConfigurationEntry[],
    contractorTypes: ConfigurationEntry[],
    contractStatuses: ConfigurationEntry[],
    projectTypes: ConfigurationEntry[],
    projectStatuses: ConfigurationEntry[],
    activeProjectStatuses: ProjectStatus[],
    stageTypes: ConfigurationEntry[],
    stageStatuses: ConfigurationEntry[],
    taskTypes: ConfigurationEntry[],
    taskStatuses: ConfigurationEntry[],
    clientTypes: ConfigurationEntry[],
    costCategories: ConfigurationEntry[]
}
