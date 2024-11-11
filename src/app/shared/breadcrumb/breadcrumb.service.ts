import {ActivatedRoute} from "@angular/router";
import {MenuItem} from "primeng/api";
import {inject, Signal} from "@angular/core";
import {ProjectStore} from "../../project/state";
import {Project} from "../../generated/models/project";
import {ClientStore} from "../../client/state";
import {ArchitectStore} from "../../architect/state";
import {Client} from "../../generated/models/client";
import {Architect, ClientType, Contractor, Supplier} from "../../generated/models";
import {ContractorStore} from "../../contractor/state";
import {SupplierStore} from "../../supplier/state";

export abstract class BreadcrumbService {
    abstract createBreadcrumbs(route: ActivatedRoute): MenuItem[];
}

export class BreadcrumbServiceImpl implements BreadcrumbService {
    previousRoute: string = '';

    projectStore = inject(ProjectStore);
    clientStore = inject(ClientStore);
    architectStore = inject(ArchitectStore);
    contractorStore = inject(ContractorStore);
    supplierStore = inject(SupplierStore);

    $projects: Signal<Project[] | null> = this.projectStore.projects!;
    $clients: Signal<Client[] | null> = this.clientStore.clients!;
    $architects: Signal<Architect[] | null> = this.architectStore.architects!;
    $contractors: Signal<Contractor[] | null> = this.contractorStore.contractors!;
    $suppliers: Signal<Supplier[] | null> = this.supplierStore.suppliers!

    createBreadcrumbs(route: ActivatedRoute): MenuItem[] {
        let menuItems: MenuItem[] = [];

        const children: ActivatedRoute[] = route.children;

        if (children.length === 0) {
            return menuItems;
        }

        for (const child of children) {
            if (child.snapshot.url.length === 0) {
                return [];
            }

            let breadcrumbItem = '';
            this.previousRoute = '';
            child.snapshot.url.map(urlSegment => urlSegment.path)
                .forEach(route => {
                    if (breadcrumbItem.length > 0) {
                        breadcrumbItem += '/';
                    }
                    let isRouteNumber = this.isNumber(route);
                    let resolver = RouteIdResolver.DEFAULT;
                    let itemLabel = route;
                    if (isRouteNumber) {
                        resolver = this.getRouteIdResolver(this.previousRoute);
                        let objectId = Number(route);
                        itemLabel = this.replaceIdWithName(resolver, objectId);
                    }
                    breadcrumbItem += route;
                    menuItems.push(
                        {
                            label: itemLabel[0].toUpperCase() + itemLabel.slice(1),
                            breadcrumbItem,
                            route: breadcrumbItem
                        });
                    this.previousRoute = route;
                })
        }
        return menuItems;

    }

    replaceIdWithName(resolver: RouteIdResolver, objectId: number): string {
        switch (resolver) {
            case RouteIdResolver.ARCHITECTS:
                return getArchitectName(objectId, this.$architects);
            case RouteIdResolver.CLIENTS:
                return getClientName(objectId, this.$clients);
            case RouteIdResolver.CONTRACTORS:
                return getContractorName(objectId, this.$contractors);
            case RouteIdResolver.PROJECTS:
                return getProjectName(objectId, this.$projects);
            case RouteIdResolver.SUPPLIERS:
                return getSupplierName(objectId, this.$suppliers);
            default:
                return `${objectId}`;
        }
    }

    isNumber(textToCheck: string): boolean {
        return !Number.isNaN(Number(textToCheck));
    }

    getRouteIdResolver(route: string): RouteIdResolver {
        let isEnum = (Object.values(RouteIdResolver) as string[]).includes(route);
        if (isEnum) {
            return Object.entries(RouteIdResolver)
                .find(([key, val]) => val === route)?.[1] || RouteIdResolver.DEFAULT;
        }
        return RouteIdResolver.DEFAULT;
    }

}

enum RouteIdResolver {
    ARCHITECTS = 'architects',
    CLIENTS = 'clients',
    CONTRACTORS = 'contractors',
    PROJECTS = 'projects',
    SUPPLIERS = 'suppliers',
    DEFAULT = 'default'
}

function getArchitectName(architectId: number, $architects: Signal<Architect[] | null>) {
    let architect = $architects()
        ?.find(architect => architect.id === architectId);
    if (architect !== undefined) {
        return `${architect.firstName} ${architect.lastName}`;
    }
    return `${architectId}`;
}

function getClientName(clientId: number, $clients: Signal<Client[] | null>) {
    let client = $clients()!.find(client => client.id === clientId);
    if (client !== undefined) {
        if (client.clientType === ClientType.PRIVATE) {
            return `${client.firstName} ${client.lastName}`;
        }
        return `${client.companyName}`;
    }
    return `${clientId}`;
}

function getProjectName(projectId: number, $projects: Signal<Project[] | null>) {
    return $projects()
        ?.find(project => project.id === projectId)?.name || `${projectId}`;
}

function getContractorName(contractorId: number, $contractors: Signal<Contractor[] | null>) {
    return $contractors()
        ?.find(contractor => contractor.id === contractorId)?.name || `${contractorId}`;
}

function getSupplierName(supplierId: number, $suppliers: Signal<Supplier[] | null>) {
    return $suppliers()
        ?.find(supplier => supplier.id === supplierId)?.name || `${supplierId}`;
}

