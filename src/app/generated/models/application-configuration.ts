/* tslint:disable */
/* eslint-disable */
import { ConfigurationEntry } from './configuration-entry';
export interface ApplicationConfiguration {
  clientTypes?: Array<ConfigurationEntry>;
  contractStatuses?: Array<ConfigurationEntry>;
  contractorTypes?: Array<ConfigurationEntry>;
  costCategories?: Array<ConfigurationEntry>;
  projectStatuses?: Array<ConfigurationEntry>;
  projectTypes?: Array<ConfigurationEntry>;
  stageStatuses?: Array<ConfigurationEntry>;
  stageTypes?: Array<ConfigurationEntry>;
  supplierTypes?: Array<ConfigurationEntry>;
  taskStatuses?: Array<ConfigurationEntry>;
  taskTypes?: Array<ConfigurationEntry>;
}
