import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {NAMED_ENTRY_NAME_MAX_LENGTH, NamedEntry, NamedEntryTexts} from "../named-entry";

// Creates a named entry such as a project type (no id) or renames one
@Component({
    selector: 'edit-named-entry',
    templateUrl: './edit-named-entry.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [DialogModule, ButtonModule, InputTextModule, ReactiveFormsModule]
})
export class EditNamedEntryComponent implements OnChanges {
    @Input({required: true})
    texts!: NamedEntryTexts;
    // The dialog is open while an entry is set
    @Input()
    entry: NamedEntry | null = null;
    // All entries of the same list, to tell about a name that is already used before saving
    @Input()
    entries: NamedEntry[] = [];
    @Input()
    saving = false;

    @Output()
    save = new EventEmitter<NamedEntry>();
    @Output()
    closed = new EventEmitter<void>();

    readonly maxLength = NAMED_ENTRY_NAME_MAX_LENGTH;
    readonly name = new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(NAMED_ENTRY_NAME_MAX_LENGTH)]
    });

    get visible(): boolean {
        return this.entry !== null;
    }

    get isNew(): boolean {
        return this.entry?.id == null;
    }

    // Names are unique regardless of letter case, as on the backend
    get nameTaken(): boolean {
        let name = this.name.value.trim().toLocaleLowerCase('pl');
        return !!name && this.entries.some(other => other.id !== this.entry?.id
            && other.name?.trim().toLocaleLowerCase('pl') === name);
    }

    get canSave(): boolean {
        return this.name.valid && !this.nameTaken && !this.saving;
    }

    // Only a newly opened entry resets the field: saving and list reloads keep what was typed
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['entry']) {
            this.name.reset(this.entry?.name ?? '');
        }
    }

    onSave(): void {
        if (!this.canSave) {
            this.name.markAsDirty();
            return;
        }
        this.save.emit({id: this.entry!.id, name: this.name.value.trim()});
    }

    onHide(): void {
        this.closed.emit();
    }
}
