// Configurable lists that are only a name each (project types, contractor and supplier categories). They share the
// settings list and the create/rename dialog, which take their words from NamedEntryTexts.

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
    // Section title and its line below
    title: string;
    description: string;
    // Lower case, as used inside sentences: "New project type", "No project types yet"
    singular: string;
    plural: string;
    // What uses an entry: "1 project", "3 projects"
    usageSingular: string;
    usagePlural: string;
    // Dialog lines under the title, for a new entry and for a renamed one
    newHint: string;
    renameHint: string;
    placeholder: string;
    emptyIcon: string;
    emptyText: string;
}

export const PROJECT_TYPE_TEXTS: NamedEntryTexts = {
    title: 'Project types',
    description: "Kinds of projects to choose from; a type used by a project can't be deleted",
    singular: 'project type',
    plural: 'project types',
    usageSingular: 'project',
    usagePlural: 'projects',
    newHint: 'It can be chosen for new and existing projects.',
    renameHint: 'Projects of this type show the new name.',
    placeholder: 'e.g. Interior office',
    emptyIcon: 'pi pi-tags',
    emptyText: 'Add the kinds of work you take on, such as interior design or architecture.',
};

export const CONTRACTOR_CATEGORY_TEXTS: NamedEntryTexts = {
    title: 'Contractor categories',
    description: "Trades of your contractors; a category used by a contractor can't be deleted",
    singular: 'contractor category',
    plural: 'contractor categories',
    usageSingular: 'contractor',
    usagePlural: 'contractors',
    newHint: 'It can be chosen for new and existing contractors.',
    renameHint: 'Contractors in this category show the new name.',
    placeholder: 'e.g. Plumber',
    emptyIcon: 'pi pi-wrench',
    emptyText: 'Add the trades you work with, such as plumbers or electricians.',
};

export const SUPPLIER_CATEGORY_TEXTS: NamedEntryTexts = {
    title: 'Supplier categories',
    description: "Kinds of shops you buy from; a category used by a supplier can't be deleted",
    singular: 'supplier category',
    plural: 'supplier categories',
    usageSingular: 'supplier',
    usagePlural: 'suppliers',
    newHint: 'It can be chosen for new and existing suppliers.',
    renameHint: 'Suppliers in this category show the new name.',
    placeholder: 'e.g. Paint shop',
    emptyIcon: 'pi pi-truck',
    emptyText: 'Add the kinds of shops you buy from, such as tile or paint shops.',
};

export function usageText(entry: NamedEntry, texts: NamedEntryTexts): string {
    let count = entry.usageCount ?? 0;
    return count === 1 ? `1 ${texts.usageSingular}` : `${count} ${texts.usagePlural}`;
}
