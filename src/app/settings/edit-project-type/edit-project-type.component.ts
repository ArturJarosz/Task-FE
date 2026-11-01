import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {ProjectType} from "../../generated/models/project-type";

// Same limit as the PROJECT_TYPE.NAME column
export const PROJECT_TYPE_NAME_MAX_LENGTH = 100;

// Creates a project type (no id) or renames one
@Component({
    selector: 'edit-project-type',
    templateUrl: './edit-project-type.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, ButtonModule, InputTextModule, ReactiveFormsModule]
})
export class EditProjectTypeComponent implements OnChanges {
    // The dialog is open while a project type is set
    @Input()
    projectType: ProjectType | null = null;
    // All project types, to tell about a name that is already used before saving
    @Input()
    projectTypes: ProjectType[] = [];
    @Input()
    saving = false;

    @Output()
    save = new EventEmitter<ProjectType>();
    @Output()
    closed = new EventEmitter<void>();

    readonly maxLength = PROJECT_TYPE_NAME_MAX_LENGTH;
    readonly name = new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(PROJECT_TYPE_NAME_MAX_LENGTH)]
    });

    get visible(): boolean {
        return this.projectType !== null;
    }

    get isNew(): boolean {
        return this.projectType?.id == null;
    }

    // Names are unique regardless of letter case, as on the backend
    get nameTaken(): boolean {
        let name = this.name.value.trim().toLocaleLowerCase('pl');
        return !!name && this.projectTypes.some(type => type.id !== this.projectType?.id
            && type.name?.trim().toLocaleLowerCase('pl') === name);
    }

    get canSave(): boolean {
        return this.name.valid && !this.nameTaken && !this.saving;
    }

    // Only a newly opened project type resets the field: saving and list reloads keep what was typed
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['projectType']) {
            this.name.reset(this.projectType?.name ?? '');
        }
    }

    onSave(): void {
        if (!this.canSave) {
            this.name.markAsDirty();
            return;
        }
        this.save.emit({...this.projectType!, name: this.name.value.trim()});
    }

    onHide(): void {
        this.closed.emit();
    }
}
