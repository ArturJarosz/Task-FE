import {HttpErrorResponse} from "@angular/common/http";
import {MessageSeverity} from "../message";
import {throwError} from "rxjs";
import {MessageService} from "primeng/api";

// One toast for a lost connection, however many requests failed with it (a page loads several at once)
const CONNECTION_TOAST_PAUSE_MS = 5000;
let lastConnectionToast = 0;

// "Error loading" -> "Couldn't load": the verbs the services' titles use
const VERBS: Record<string, string> = {
    loading: 'load', getting: 'load', fetching: 'load', creating: 'create', adding: 'add', updating: 'save',
    saving: 'save', changing: 'change', removing: 'delete', deleting: 'delete', renaming: 'rename', paying: 'pay',
    rejecting: 'reject', reopening: 'reopen', linking: 'link', unlinking: 'unlink', sharing: 'share',
    revoking: 'revoke', logging: 'log',
};

// The services name failures for developers ("Error loading stage with id: 103"); the toast says it for people:
// "Couldn't load stage". Ids and the entity they belong to are left out, since the page already shows which one
export function toastTitle(title: string): string {
    let match = /^Error (\w+ing)\s+(.*)$/i.exec(title.trim());
    let verb = match && VERBS[match[1].toLowerCase()];
    if (!match || !verb) {
        return title;
    }
    let object = match[2]
        .replace(/\s+(for|of)\s+[\w ]+?\s+with id:?\s*\S+$/i, '')
        .replace(/\s+(with id:?|:)\s*\S+$/i, '')
        .replace(/^(a new|new|a|the)\s+/i, '')
        .replace(/_/g, ' ')
        .trim();
    return `Couldn't ${verb} ${object}`;
}

// What happened, in words people can act on, from the response code (and the backend's own message for a 4xx,
// which the backend translates for users)
export function toastDetail(error: HttpErrorResponse): string {
    if (error.status === 0) {
        return 'Check your connection and try again.';
    }
    if (error.status === 401 || error.status === 403) {
        return "You don't have access to this.";
    }
    if (error.status === 404) {
        return 'It may have been deleted.';
    }
    if (error.status >= 500) {
        return 'Something went wrong on the server. Try again in a moment.';
    }
    let backendMessage = error.error?.message;
    return typeof backendMessage === 'string' && backendMessage ? backendMessage : 'Check the values and try again.';
}

export class AbstractRestService {

    handleError(error: HttpErrorResponse, messageService: MessageService, title: string) {
        // Not an HTTP response: getting the Auth0 token failed before the request was sent. The authorization service
        // already handles those (a toast, or the not-logged-in page when the session expired), so no second toast here
        if (!(error instanceof HttpErrorResponse)) {
            return throwError(() => error);
        }
        let detail = toastDetail(error);
        if (error.status === 0) {
            let now = Date.now();
            if (now - lastConnectionToast > CONNECTION_TOAST_PAUSE_MS) {
                lastConnectionToast = now;
                messageService.add({severity: MessageSeverity.ERROR, summary: "Couldn't reach the server", detail});
            }
        } else {
            messageService.add({severity: MessageSeverity.ERROR, summary: toastTitle(title), detail});
        }
        // The stores only need to know it failed; the code stays available to them in the message
        return throwError(() => `Response code: ${error.status}, ${detail}`);
    }
}
