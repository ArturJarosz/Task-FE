export interface ConfigurationEntry {
    id: string,
    label: string
}

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
    clientTypes: ConfigurationEntry[]
}
