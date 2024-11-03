import {HttpErrorResponse} from "@angular/common/http";
import {MessageSeverity} from "../message";
import {throwError} from "rxjs";
import {MessageService} from "primeng/api";

export class AbstractRestService {

    handleError(error: HttpErrorResponse, messageService: MessageService, title: string) {
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
