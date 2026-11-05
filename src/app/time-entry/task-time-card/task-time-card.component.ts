import {initials} from "../../shared/utils/label-utils";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {SkeletonModule} from "primeng/skeleton";
import {TooltipModule} from "primeng/tooltip";
import {Architect} from "../../generated/models/architect";
import {TimeEntry} from "../../generated/models/time-entry";
import {DurationPipe} from "../../shared/duration/duration.pipe";
import {DURATION_PROBLEM_MESSAGES, durationProblem, parseDuration} from "../../shared/duration/duration-input";

// Someone who logged time on the task, with their total
export interface PersonTime {
    architectId: number;
    name: string;
    initials: string;
    minutes: number;
}

// Time typed in the card, logged for today by the user's own architect (defaultArchitectId). onSaved runs once it is saved, so the field is
// cleared only then and keeps what was typed after an error
export interface QuickLog {
    durationMinutes: number;
    onSaved: () => void;
}

// "Time spent" side card on the task page: the total, a field to log time for today, and the time of each person who
// worked on the task. The entries themselves open in a dialog ("Entries")
@Component({
    selector: 'task-time-card',
    templateUrl: './task-time-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ButtonModule, InputTextModule, SkeletonModule, TooltipModule, ReactiveFormsModule, DurationPipe]
})
export class TaskTimeCardComponent implements OnChanges {
    @Input()
    totalMinutes: number = 0;
    @Input()
    timeEntries: TimeEntry[] = [];
    @Input()
    loading: boolean = false;
    @Input()
    loadFailed: boolean = false;
    @Input()
    architects: Architect[] | null = [];
    @Input()
    saving: boolean = false;
    // Who time typed in the card is logged for (defaultArchitectId), named under the field
    @Input()
    logArchitectId: number | undefined;

    @Output()
    quickLog = new EventEmitter<QuickLog>();
    // "Change": opens the full "Log time" dialog, for another date or person
    @Output()
    logTime = new EventEmitter<void>();
    @Output()
    showEntries = new EventEmitter<void>();
    @Output()
    reload = new EventEmitter<void>();

    readonly form = new FormGroup({duration: new FormControl<string>('', {nonNullable: true})});
    readonly duration = this.form.controls.duration;
    people: PersonTime[] = [];
    // Set by "+", so an empty field is flagged only when the user tried to log it
    submitted = false;
    logArchitectName = '';

    private readonly changeDetector = inject(ChangeDetectorRef);

    // The minutes the typed time stands for, shown under the field so the user sees how it was read
    get durationMinutes(): number | null {
        return this.durationError(true) === null ? parseDuration(this.duration.value) : null;
    }

    // Shown once the user left the field or pressed "+", so a half-typed time ("2.") is not flagged while typing
    get error(): string | null {
        return this.submitted || this.duration.touched ? this.durationError(this.submitted) : null;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['timeEntries'] || changes['architects']) {
            this.people = toPeople(this.timeEntries, this.architects ?? []);
        }
        if (changes['logArchitectId'] || changes['architects']) {
            const architect = this.architects?.find(architect => architect.id === this.logArchitectId);
            this.logArchitectName = architect ? `${architect.firstName} ${architect.lastName}` : '';
        }
    }

    onQuickLog(): void {
        this.submitted = true;
        this.duration.markAsTouched();
        const minutes = this.durationMinutes;
        if (minutes === null || this.saving) {
            return;
        }
        this.quickLog.emit({
            durationMinutes: minutes,
            onSaved: () => {
                this.duration.reset();
                this.submitted = false;
                this.changeDetector.markForCheck();
            }
        });
    }

    private durationError(emptyIsError: boolean): string | null {
        if (!emptyIsError && !this.duration.value.trim()) {
            return null;
        }
        const problem = durationProblem(this.duration.value);
        return problem ? DURATION_PROBLEM_MESSAGES[problem] : null;
    }
}

// The time of each person, most first; an architect who is no longer in the list keeps their time under "Unknown"
function toPeople(timeEntries: TimeEntry[], architects: Architect[]): PersonTime[] {
    const minutesByArchitect = new Map<number, number>();
    for (const timeEntry of timeEntries) {
        const architectId = timeEntry.architectId ?? 0;
        minutesByArchitect.set(architectId, (minutesByArchitect.get(architectId) ?? 0) + (timeEntry.durationMinutes ?? 0));
    }
    const architectsById = new Map(architects.map(architect => [architect.id, architect]));
    return [...minutesByArchitect.entries()]
        .map(([architectId, minutes]) => {
            const architect = architectsById.get(architectId);
            const name = architect ? `${architect.firstName} ${architect.lastName}` : 'Unknown';
            return {architectId, name, initials: initials(name), minutes};
        })
        .sort((a, b) => b.minutes - a.minutes || a.name.localeCompare(b.name));
}
