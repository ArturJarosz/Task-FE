// Configurable lists that are only a name each (project, stage and task types, contractor, supplier, cost and company
// cost categories). They share the settings list and the create/rename dialog, which take their words from NamedEntryTexts.

// Same limit as the NAME column of their tables
export const NAMED_ENTRY_NAME_MAX_LENGTH = 100;

export interface NamedEntry {
    // No id: a new entry
    id?: number;
    name?: string;
    // Number of items (projects, contractors...) using the entry; a used entry can't be deleted
    usageCount?: number;
}

export interface NamedEntryTexts {
    // Section title
    title: string;
    // Lower case, as used inside sentences: "New project type", "No project types yet"
    singular: string;
    plural: string;
    // What uses an entry: "1 project", "3 projects"
    usageSingular: string;
    usagePlural: string;
    placeholder: string;
    emptyIcon: string;
    emptyText: string;
}

export const PROJECT_TYPE_TEXTS: NamedEntryTexts = {
    title: 'Project types',
    singular: 'project type',
    plural: 'project types',
    usageSingular: 'project',
    usagePlural: 'projects',
    placeholder: 'e.g. Interior office',
    emptyIcon: 'pi pi-tags',
    emptyText: 'Add the kinds of work you take on, such as interior design or architecture.',
};

export const STAGE_TYPE_TEXTS: NamedEntryTexts = {
    title: 'Stage types',
    singular: 'stage type',
    plural: 'stage types',
    usageSingular: 'stage',
    usagePlural: 'stages',
    placeholder: 'e.g. Functional layout',
    emptyIcon: 'pi pi-list',
    emptyText: 'Add the kinds of stages your projects go through, such as a functional layout or visualisations.',
};

export const TASK_TYPE_TEXTS: NamedEntryTexts = {
    title: 'Task types',
    singular: 'task type',
    plural: 'task types',
    usageSingular: 'task',
    usagePlural: 'tasks',
    placeholder: 'e.g. Render',
    emptyIcon: 'pi pi-check-square',
    emptyText: 'Add the kinds of work done in a stage, such as renders or shopping.',
};

export const CONTRACTOR_CATEGORY_TEXTS: NamedEntryTexts = {
    title: 'Contractor categories',
    singular: 'contractor category',
    plural: 'contractor categories',
    usageSingular: 'contractor',
    usagePlural: 'contractors',
    placeholder: 'e.g. Plumber',
    emptyIcon: 'pi pi-wrench',
    emptyText: 'Add the trades you work with, such as plumbers or electricians.',
};

export const SUPPLIER_CATEGORY_TEXTS: NamedEntryTexts = {
    title: 'Supplier categories',
    singular: 'supplier category',
    plural: 'supplier categories',
    usageSingular: 'supplier',
    usagePlural: 'suppliers',
    placeholder: 'e.g. Paint shop',
    emptyIcon: 'pi pi-truck',
    emptyText: 'Add the kinds of shops you buy from, such as tile or paint shops.',
};

export const COST_CATEGORY_TEXTS: NamedEntryTexts = {
    title: 'Cost categories',
    singular: 'cost category',
    plural: 'cost categories',
    usageSingular: 'cost',
    usagePlural: 'costs',
    placeholder: 'e.g. Parking',
    emptyIcon: 'pi pi-wallet',
    emptyText: 'Add the kinds of costs your projects have, such as fuel or parking.',
};

export const COMPANY_COST_CATEGORY_TEXTS: NamedEntryTexts = {
    title: 'Company cost categories',
    singular: 'company cost category',
    plural: 'company cost categories',
    usageSingular: 'company cost',
    usagePlural: 'company costs',
    placeholder: 'e.g. Software',
    emptyIcon: 'pi pi-briefcase',
    emptyText: 'Add the kinds of costs the company has outside projects, such as salaries or software.',
};

export function usageText(entry: NamedEntry, texts: NamedEntryTexts): string {
    let count = entry.usageCount ?? 0;
    return count === 1 ? `1 ${texts.usageSingular}` : `${count} ${texts.usagePlural}`;
}
