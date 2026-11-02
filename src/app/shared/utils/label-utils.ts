import {ConfigurationEntry} from "../../generated/models/configuration-entry";

// Entry ids are strings; numeric ids (such as project type ids) are matched by their string form
export function resolveLabel(id: string | number | null | undefined, entries: ConfigurationEntry[] | null): string {
    if (id == null || id === '') {
        return '';
    }
    let key = String(id);
    if (!entries) {
        return key;
    }

    let maybeLabel = entries.find(element => element.id === key)?.label;
    return maybeLabel ? maybeLabel : key;
}

// For entries configured by users (types, categories): until the entry is in the list (configuration still loading or
// stale), shows nothing instead of the bare id
export function resolveKnownLabel(id: string | number | null | undefined, entries: ConfigurationEntry[] | null): string {
    let known = id != null && (entries ?? []).some(entry => entry.id === String(id));
    return known ? resolveLabel(id, entries) : '';
}

// "contractor" -> "Contractor", for nouns used both inside sentences and as titles
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
