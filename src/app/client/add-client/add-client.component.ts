import {Component, EventEmitter, Injectable, Input, OnInit, Output} from '@angular/core';
import {ClientType, CreateClient} from "../client";
import {ClientService} from "../service/client.service";
import {HttpStatusCode} from "@angular/common/http";

@Injectable({
    providedIn: 'root',
})
@Component({
    selector: 'app-add-client',
    templateUrl: './add-client.component.html',
    styleUrls: ['./add-client.component.less'],
})
export class AddClientComponent implements OnInit {
    @Input()
    visible = false;
    @Output()
    notify: EventEmitter<boolean> = new EventEmitter<boolean>();
    clientTypes!: String[];
    clientType!: ClientType;
    firstName!: string;
    lastName!: string;
    companyName!: string;

    protected readonly ClientType = ClientType;

    constructor(private _clientService: ClientService) {
    }

    ngOnInit(): void {
        this.initClientTypes();
    }

    onClose(): void {
        this.notify.emit(false);
    }

    initClientTypes() {
        this.clientTypes = Object.values(ClientType).filter(value => typeof value === 'string') as string[];
    }

    onCancel() {
        this.visible = false;
        this.resetFields();
    }

    onSave() {
        this.visible = false;
        let client: CreateClient;
        client = this.createClient();
        this._clientService.createClient(client).subscribe({
                next: response => {
                    if (response.status === HttpStatusCode.Created) {
                    }
                },
                error: error => console.log(error),
            }
        );
    }

    private createClient() {
        let client: CreateClient;
        switch (this.clientType) {
            case ClientType.CORPORATE: {
                client = {
                    clientType: ClientType.CORPORATE,
                    companyName: this.companyName.trim()
                }
                break;
            }
            case ClientType.PRIVATE: {
                client = {
                    clientType: ClientType.PRIVATE,
                    firstName: this.firstName.trim(),
                    lastName: this.lastName.trim()
                }
                break;
            }
        }
        console.log(`client: ${JSON.stringify(client)}`)
        return client;
    }

    isSaveEnabled(): boolean {
        if (!this.clientType) {
            return false;
        }
        if (this.clientType === ClientType.PRIVATE && this.firstName && this.lastName && this.firstName.trim() && this.lastName.trim()) {
            return true;
        }
        if (this.clientType === ClientType.CORPORATE && this.companyName && this.companyName.trim()) {
            return true;
        }
        return false;
    }

    resetFields() {
        this.companyName = "";
        this.firstName = "";
        this.lastName = "";
    }

}
