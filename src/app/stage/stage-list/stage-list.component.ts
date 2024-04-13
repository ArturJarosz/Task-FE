import {Stage} from "../stage";
import {Component, Input} from "@angular/core";
import {ConfigurationEntry} from "../../shared/configuration/model/configuration";

@Component({
    selector: 'stage-list',
    templateUrl: 'stage-list.component.html',
    styleUrls: ['stage-list.component.less']
})
export class StageListComponent {
    @Input()
    stages: Stage[] | null = [];
    @Input()
    stageTypes: ConfigurationEntry[] | null = [];
    @Input()
    stageStatuses: ConfigurationEntry[] | null = [];
    @Input()
    projectId: number = 0;

    getStageLabelType(type: string): string {
        let maybeLabel = this.stageTypes?.find(element => element.id === type)?.label;
        return maybeLabel ? maybeLabel : type;
    }

    getStageStatusLabel(type: string): string {
        let maybeLabel = this.stageStatuses?.find(element => element.id === type)?.label;
        return maybeLabel ? maybeLabel : type;
    }
}
