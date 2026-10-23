// What the settings page can tell about a pasted Google service account JSON key before it is sent
export interface ServiceAccountKey {
    clientEmail: string;
}

// Returns null when the text is not a service account key (for example an OAuth client file or a P12 key)
export function parseServiceAccountKey(text: string): ServiceAccountKey | null {
    try {
        let key = JSON.parse(text);
        if (key?.type !== 'service_account' || typeof key.client_email !== 'string' || typeof key.private_key !== 'string') {
            return null;
        }
        return {clientEmail: key.client_email};
    } catch {
        return null;
    }
}
