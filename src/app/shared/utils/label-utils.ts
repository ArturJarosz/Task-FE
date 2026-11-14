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

// Avatar initials: the first letters of the first two words that start with a letter or digit, so signs such as "&"
// or "-" are skipped: "Teodor Czerwiński" -> "TC", "Ciuba & Partnerzy" -> "CP", "IISKELO" -> "I"
export function initials(...names: (string | null | undefined)[]): string {
    let words = names.join(' ').split(/\s+/).filter(word => /^[\p{L}\p{N}]/u.test(word));
    let letters = words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
    return letters || '?';
}

// Avatar tints: four depths of one orange for clients and of one blue for architects, so the colour still tells them
// apart. The record's id picks the shade, so a person has the same one on every page and keeps it after a rename;
// without an id (a deleted architect) the avatar is grey. The classes are written out in full so Tailwind finds them
const AVATAR_COLORS = {
    client: [
        'bg-avatar-client-1 text-avatar-client-1-ink',
        'bg-avatar-client-2 text-avatar-client-2-ink',
        'bg-avatar-client-3 text-avatar-client-3-ink',
        'bg-avatar-client-4 text-avatar-client-4-ink'
    ],
    architect: [
        'bg-avatar-architect-1 text-avatar-architect-1-ink',
        'bg-avatar-architect-2 text-avatar-architect-2-ink',
        'bg-avatar-architect-3 text-avatar-architect-3-ink',
        'bg-avatar-architect-4 text-avatar-architect-4-ink'
    ]
};

export function avatarColor(kind: 'client' | 'architect', id: number | null | undefined): string {
    if (id == null) {
        return 'bg-gray-100 text-gray-700';
    }
    let colors = AVATAR_COLORS[kind];
    return colors[Math.abs(id) % colors.length];
}
