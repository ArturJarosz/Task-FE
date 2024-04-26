import {ConfigurationEntry} from "../../generated/models/configuration-entry";

export function resolveLabel(id: string | undefined, entries: ConfigurationEntry[] | null): string {
    if (!id) {
        return '';
    }
    if (!entries) {
        return id;
    }

    let maybeLabel = entries.find(element => element.id === id)?.label;
    return maybeLabel ? maybeLabel : id;
}
