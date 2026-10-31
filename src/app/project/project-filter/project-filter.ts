import {endOfMonth, format, startOfMonth} from "date-fns";
import {Architect, Client, ClientType, ConfigurationEntry, Contract, ContractStatus, Project, ProjectType} from "../../generated/models";
import {resolveLabel} from "../../shared/utils/label-utils";
import {earliest, isDate, latest, spanOf, TimelineScale, toDay} from "../timeline/timeline-scale";

// The filters of the Projects page, shared by its table and timeline views (DESIGN_GUIDELINES.md, "Projects page views")
export interface ProjectFilter {
    search: string;
    clientId: number | null;
    architectId: number | null;
    types: ProjectType[];
    contractStatuses: ContractStatus[];
    // Months picked in the period range: [first, last]; the last is null while only one month is picked
    period: (Date | null)[] | null;
    pastDeadlineOnly: boolean;
}

export const EMPTY_FILTER: ProjectFilter = {
    search: '',
    clientId: null,
    architectId: null,
    types: [],
    contractStatuses: [],
    period: null,
    pastDeadlineOnly: false,
};

export interface FilterOption {
    id: number | string;
    label: string;
}

// One removable chip per filter that is on
export interface FilterChip {
    key: keyof ProjectFilter;
    label: string;
}

export interface FilterLabels {
    clients: FilterOption[];
    architects: FilterOption[];
    projectTypes: ConfigurationEntry[];
    contractStatuses: ConfigurationEntry[];
}

export function clientName(client?: Client): string {
    if (!client) {
        return '';
    }
    if (client.clientType === ClientType.CORPORATE) {
        return client.companyName ?? '';
    }
    return [client.firstName, client.lastName].filter(part => !!part).join(' ');
}

export function architectName(architect?: Architect): string {
    if (architect?.firstName && architect?.lastName) {
        return `${architect.firstName} ${architect.lastName}`;
    }
    return '';
}

// The clients or architects of the projects, once each, by id, sorted by name
export function filterOptions<T extends { id?: number }>(people: (T | undefined)[], name: (person?: T) => string): FilterOption[] {
    let options = new Map<number, string>();
    people.forEach(person => {
        if (person?.id != null && name(person)) {
            options.set(person.id, name(person));
        }
    });
    return [...options.entries()]
        .map(([id, label]) => ({id, label}))
        .sort((a, b) => a.label.localeCompare(b.label, 'pl'));
}

export function activeFilters(filter: ProjectFilter): (keyof ProjectFilter)[] {
    let on: (keyof ProjectFilter)[] = [];
    if (filter.search.trim()) on.push('search');
    if (filter.clientId != null) on.push('clientId');
    if (filter.architectId != null) on.push('architectId');
    if (filter.types.length) on.push('types');
    if (filter.contractStatuses.length) on.push('contractStatuses');
    if (periodRange(filter)) on.push('period');
    if (filter.pastDeadlineOnly) on.push('pastDeadlineOnly');
    return on;
}

// The first day of the first month to the last day of the last month, or null with no period
export function periodRange(filter: ProjectFilter): { from: Date, to: Date } | null {
    let first = filter.period?.[0];
    if (!first) {
        return null;
    }
    return {from: startOfMonth(first), to: endOfMonth(filter.period?.[1] ?? first)};
}

// A contract whose bar is past its deadline, by the timeline's own rule: it ended after the deadline, or is still open
// with the deadline passed. Dates that can't be drawn (an end before the start) have no bar, so they never are
export function contractPastDeadline(contract: Contract | undefined, today: Date): boolean {
    let span = spanOf(toDay(contract?.startDate), toDay(contract?.endDate));
    if (span.dateError) {
        return false;
    }
    let scale = new TimelineScale(today);
    return !!scale.pastDeadline(span.start, scale.barEnd(span), toDay(contract?.deadline));
}

// From the first to the last date of the contract and the project; an open bar runs to today
export function projectInterval(project: Project, today: Date): { from: Date, to: Date } | null {
    let contract = project.contract;
    let dates = [toDay(contract?.startDate), toDay(contract?.endDate), toDay(contract?.deadline),
        toDay(project.startDate), toDay(project.endDate)].filter(isDate);
    if (dates.length === 0) {
        return null;
    }
    let open = (!!contract?.startDate && !contract?.endDate) || (!!project.startDate && !project.endDate);
    return {from: earliest(dates)!, to: latest(open ? [...dates, today] : dates)!};
}

export function matchesFilter(project: Project, filter: ProjectFilter, today: Date): boolean {
    let search = filter.search.trim().toLocaleLowerCase('pl');
    if (search && !(project.name ?? '').toLocaleLowerCase('pl').includes(search)) {
        return false;
    }
    if (filter.clientId != null && project.client?.id !== filter.clientId) {
        return false;
    }
    if (filter.architectId != null && project.architect?.id !== filter.architectId) {
        return false;
    }
    if (filter.types.length && (!project.type || !filter.types.includes(project.type))) {
        return false;
    }
    let contractStatus = project.contract?.status;
    if (filter.contractStatuses.length && (!contractStatus || !filter.contractStatuses.includes(contractStatus))) {
        return false;
    }
    let period = periodRange(filter);
    if (period) {
        let interval = projectInterval(project, today);
        if (!interval || interval.to < period.from || interval.from > period.to) {
            return false;
        }
    }
    return !filter.pastDeadlineOnly || contractPastDeadline(project.contract, today);
}

export function filterChips(filter: ProjectFilter, labels: FilterLabels): FilterChip[] {
    let label = (key: keyof ProjectFilter): string => {
        switch (key) {
            case 'search':
                return `Name: ${filter.search.trim()}`;
            case 'clientId':
                return `Client: ${labels.clients.find(option => option.id === filter.clientId)?.label ?? ''}`;
            case 'architectId':
                return `Architect: ${labels.architects.find(option => option.id === filter.architectId)?.label ?? ''}`;
            case 'types':
                return `Type: ${filter.types.map(type => resolveLabel(type, labels.projectTypes)).join(', ')}`;
            case 'contractStatuses':
                return `Contract status: ${filter.contractStatuses.map(status => resolveLabel(status, labels.contractStatuses)).join(', ')}`;
            case 'period': {
                let period = periodRange(filter)!;
                return `Period: ${format(period.from, 'MM.yyyy')} – ${format(period.to, 'MM.yyyy')}`;
            }
            case 'pastDeadlineOnly':
                return 'Past deadline only';
        }
    };
    return activeFilters(filter).map(key => ({key, label: label(key)}));
}

// The filter with one of its filters off
export function withoutFilter(filter: ProjectFilter, key: keyof ProjectFilter): ProjectFilter {
    return {...filter, [key]: EMPTY_FILTER[key]};
}
