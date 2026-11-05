import {HttpErrorResponse} from "@angular/common/http";
import {MessageService} from "primeng/api";
import {AbstractRestService, toastDetail, toastTitle} from "./abstract-rest.service";

describe('toastTitle', () => {
    it('says what failed in plain words, without ids', () => {
        expect(toastTitle('Error loading stage with id: 103')).toBe("Couldn't load stage");
        expect(toastTitle('Error updating a client with id 7')).toBe("Couldn't save client");
        expect(toastTitle('Error creating a new project')).toBe("Couldn't create project");
        expect(toastTitle('Error removing task with id 4')).toBe("Couldn't delete task");
        expect(toastTitle('Error updating cost : 12')).toBe("Couldn't save cost");
    });

    it('leaves out the entity the item belongs to', () => {
        expect(toastTitle('Error loading time summary of project with id: 103')).toBe("Couldn't load time summary");
        expect(toastTitle('Error loading contractor_jobs data for contractor with id:101')).toBe("Couldn't load contractor jobs data");
    });

    it('keeps a title it does not recognise', () => {
        expect(toastTitle('Something else')).toBe('Something else');
    });
});

describe('toastDetail', () => {
    const error = (status: number, body: unknown = null) => new HttpErrorResponse({status, error: body});

    it('turns the response code into words', () => {
        expect(toastDetail(error(0))).toBe('Check your connection and try again.');
        expect(toastDetail(error(403))).toBe("You don't have access to this.");
        expect(toastDetail(error(404))).toBe('It may have been deleted.');
        expect(toastDetail(error(500))).toBe('Something went wrong on the server. Try again in a moment.');
    });

    it("uses the backend's own message for a request it rejected", () => {
        expect(toastDetail(error(400, {message: 'The end date must be after the start date.'})))
            .toBe('The end date must be after the start date.');
        expect(toastDetail(error(422))).toBe('Check the values and try again.');
    });
});

describe('AbstractRestService', () => {
    it('shows one toast for a lost connection, however many requests failed', () => {
        const messages = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
        const service = new AbstractRestService();
        const offline = new HttpErrorResponse({status: 0});

        service.handleError(offline, messages, 'Error loading project with id: 1').subscribe({error: () => undefined});
        service.handleError(offline, messages, 'Error loading stages for project with id: 1').subscribe({error: () => undefined});

        expect(messages.add).toHaveBeenCalledTimes(1);
        expect(messages.add.calls.first().args[0].summary).toBe("Couldn't reach the server");
    });
});
