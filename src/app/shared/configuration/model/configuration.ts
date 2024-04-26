import {ConfigurationEntry} from "../../../generated/models/configuration-entry";

export interface ApplicationConfiguration {
    supplierTypes: ConfigurationEntry[],
    contractorTypes: ConfigurationEntry[],
    contractStatuses: ConfigurationEntry[],
    projectTypes: ConfigurationEntry[],
    projectStatuses: ConfigurationEntry[],
    stageTypes: ConfigurationEntry[],
    stageStatuses: ConfigurationEntry[],
    taskTypes: ConfigurationEntry[],
    taskStatuses: ConfigurationEntry[],
    clientTypes: ConfigurationEntry[],
    costCategories: ConfigurationEntry[]
}
