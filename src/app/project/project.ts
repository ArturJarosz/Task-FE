import {Client} from "../client/client";
import {Architect} from "../architect/model/architect";

export enum ProjectStatus {
    TO_DO = "TO_DO",
    IN_PROGRESS = "IN_PROGRESS",
    REJECTED = "REJECTED",
    DONE = "DONE",
    COMPLETED = "COMPLETED"
}

export enum ProjectType {
    ARCHITECTURE_HOUSE = "ARCHITECTURE_HOUSE",
    CONCEPT = "CONCEPT",
    INTERIOR_APARTMENT = "INTERIOR_APARTMENT",
    INTERIOR_HOUSE = "INTERIOR_HOUSE",
    INTERIOR_OFFICE = "INTERIOR_OFFICE"
}

export interface Project {
    id: number,
    client: Client,
    architect: Architect,
    name: string,
    type: ProjectType,
    signingDate: Date,
    startDate: Date,
    endDate: Date,
    deadLine: Date,
    note: string | null,
    status: ProjectStatus,
    contract: ProjectContract,
    nextStatuses: ProjectStatus[]
}

export enum ContractStatus {
    OFFER = "OFFER",
    REJECTED = "REJECTED",
    ACCEPTED = "ACCEPTED",
    SIGNED = "SIGNED",
    TERMINATED = "TERMINATED",
    COMPLETED = "COMPLETED"
}

export interface ProjectContract {
    id?: number,
    offerValue: number,
    status: ContractStatus,
    signingDate?: Date | null,
    startDate?: Date | null,
    endDate?: Date | null,
    deadline?: Date | null,
    nextStatuses?: ContractStatus[]
}

export interface ProjectCreate {
    id?: number;
    name: string;
    architectId: number;
    clientId: number;
    type: string;
    offerValue: number;
}
