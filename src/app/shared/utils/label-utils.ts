import {ConfigurationEntry} from "../configuration/model/configuration";

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
