import {createNamedEntryStore} from "./named-entry.store";
import {ProjectTypeRestService} from "../rest/project-type-rest.service";
import {ContractorCategoryRestService} from "../rest/contractor-category-rest.service";
import {SupplierCategoryRestService} from "../rest/supplier-category-rest.service";
import {CostCategoryRestService} from "../rest/cost-category-rest.service";
import {CompanyCostCategoryRestService} from "../rest/company-cost-category-rest.service";
import {StageTypeRestService} from "../rest/stage-type-rest.service";
import {TaskTypeRestService} from "../rest/task-type-rest.service";

export const ProjectTypeStore = createNamedEntryStore(ProjectTypeRestService, type => type.numberOfProjects);
export const ContractorCategoryStore = createNamedEntryStore(ContractorCategoryRestService,
    category => category.numberOfContractors);
export const SupplierCategoryStore = createNamedEntryStore(SupplierCategoryRestService,
    category => category.numberOfSuppliers);
export const CostCategoryStore = createNamedEntryStore(CostCategoryRestService, category => category.numberOfCosts);
export const CompanyCostCategoryStore = createNamedEntryStore(CompanyCostCategoryRestService,
    category => category.numberOfCompanyCosts);
export const StageTypeStore = createNamedEntryStore(StageTypeRestService, type => type.numberOfStages);
export const TaskTypeStore = createNamedEntryStore(TaskTypeRestService, type => type.numberOfTasks);
