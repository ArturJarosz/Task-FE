export enum StageStatus {
    TO_DO = "TO_DO",
    IN_PROGRESS = "IN_PROGRESS",
    REJECTED = "REJECTED",
    DONE = "DONE"
}

export enum StageType {
    AUTHORS_SUPERVISION = "AUTHORS_SUPERVISION",
    EXECUTIVE_PROJECT = "EXECUTIVE_PROJECT",
    FUNCTIONAL_LAYOUT = "FUNCTIONAL_LAYOUT",
    VISUALISATIONS = "VISUALISATIONS",
    TENANT_ALTERATIONS = "TENANT_ALTERATIONS"
}

export interface Stage {
    id: number,
    name: string,
    startDate: Date,
    endDate: Date,
    deadline: Date,
    type: StageType,
    note: string | null,
    status: StageStatus,
    nextStatuses: StageStatus[]
}
