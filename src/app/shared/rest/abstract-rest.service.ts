import {HttpErrorResponse} from "@angular/common/http";
import {MessageSeverity} from "../message";
import {throwError} from "rxjs";
import {MessageService} from "primeng/api";

export class AbstractRestService {

    handleError(error: HttpErrorResponse, messageService: MessageService, title: string) {
        // Not an HTTP response: getting the Auth0 token failed before the request was sent. The authorization service
        // already handles those (a toast, or the not-logged-in page when the session expired), so no second toast here
        if (!(error instanceof HttpErrorResponse)) {
            return throwError(() => error);
        }
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `An error occurred: ${error.error.message}`;
        } else {
            errorMessage = `Response code: ${error.status},\n Error: ${error.error.message ? error.error.message : error.message}`;
        }

        messageService.add({
            severity: MessageSeverity.ERROR,
            summary: title,
            detail: errorMessage,

        })
        return throwError(() => errorMessage);
    }
}
