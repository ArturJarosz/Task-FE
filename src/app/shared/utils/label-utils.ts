import {ConfigurationEntry} from "../configuration/model/configuration";

export function resolveLabel(id: string | undefined, entries: ConfigurationEntry[]): string {
    if (!id) {
        return '';
    }
    let maybeLabel = entries.find(element => element.id === id)?.label;
    return maybeLabel ? maybeLabel : id;
}
