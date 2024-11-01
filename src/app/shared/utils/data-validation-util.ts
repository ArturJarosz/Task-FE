export function isUndefinedOrEmpty(object: any): boolean {
    return !object || JSON.stringify(object) === '{}';
}
