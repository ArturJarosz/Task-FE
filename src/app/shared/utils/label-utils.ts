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

// "contractor" -> "Contractor", for nouns used both inside sentences and as titles
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
