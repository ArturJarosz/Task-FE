import {ChangeDetectionStrategy, Component, computed, effect, input, output, signal} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {ChipModule} from "primeng/chip";
import {InputNumberModule} from "primeng/inputnumber";
import {SkeletonModule} from "primeng/skeleton";
import {ToggleSwitchModule} from "primeng/toggleswitch";
import {TooltipModule} from "primeng/tooltip";
import {NotificationSetting} from "../../generated/models/notification-setting";
import {NotificationType} from "../../generated/models/notification-type";
import {EmptyStateComponent} from "../../shared/empty-state/empty-state.component";
import {NOTIFICATION_TYPE_TEXTS} from "../model/notification-display";

export const MAX_DAYS_BEFORE = 30;
export const MAX_REMINDERS = 5;

interface SettingRow {
    setting: NotificationSetting;
    label: string;
    inputId: string;
    // On with no reminder, which the backend refuses
    missingReminder: boolean;
}

@Component({
    selector: 'app-notification-settings',
    templateUrl: './notification-settings.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, ButtonModule, ChipModule, InputNumberModule, SkeletonModule, ToggleSwitchModule, TooltipModule,
        EmptyStateComponent]
})
export class NotificationSettingsComponent {
    readonly settings = input.required<NotificationSetting[]>();
    readonly loading = input(false);
    readonly loadFailed = input(false);
    readonly saving = input(false);

    readonly save = output<NotificationSetting[]>();
    readonly retry = output<void>();

    readonly maxDaysBefore = MAX_DAYS_BEFORE;
    readonly maxReminders = MAX_REMINDERS;
    readonly draft = signal<NotificationSetting[]>([]);
    // The type whose new reminder is being typed, in place of its add button
    readonly addingType = signal<NotificationType | null>(null);
    // Days typed for each type, not added yet
    private readonly typedDays = signal<Partial<Record<string, number | null>>>({});

    readonly $rows = computed(() => this.draft().map((setting): SettingRow => ({
        setting,
        label: setting.type ? NOTIFICATION_TYPE_TEXTS[setting.type].label : '',
        inputId: `notification-${setting.type}`,
        missingReminder: !!setting.enabled && !setting.daysBefore?.length
    })));

    // What Save sends: the draft with the days typed but not added yet, so saving while typing keeps them
    readonly $toSave = computed(() => this.draft().map(setting => {
        const days = this.newDays(setting);
        return this.canAdd(setting) && days !== null
            ? {...setting, daysBefore: withReminder(setting.daysBefore ?? [], days)} : setting;
    }));
    readonly $changed = computed(() => JSON.stringify(this.$toSave()) !== JSON.stringify(this.settings()));
    readonly $invalid = computed(() => this.$toSave().some(setting => !!setting.enabled && !setting.daysBefore?.length));

    constructor() {
        // Saved or reloaded settings replace what was being edited
        effect(() => {
            this.draft.set(this.settings().map(setting => ({...setting})));
            this.typedDays.set({});
            this.addingType.set(null);
        });
    }

    setEnabled(type: NotificationType | undefined, enabled: boolean): void {
        this.update(type, {enabled});
    }

    newDays(setting: NotificationSetting): number | null {
        return this.typedDays()[setting.type ?? ''] ?? null;
    }

    setNewDays(setting: NotificationSetting, days: number | null): void {
        this.typedDays.update(typed => ({...typed, [setting.type ?? '']: days}));
    }

    canAdd(setting: NotificationSetting): boolean {
        const days = this.newDays(setting);
        const daysBefore = setting.daysBefore ?? [];
        return days !== null && !daysBefore.includes(days) && daysBefore.length < MAX_REMINDERS;
    }

    addReminder(setting: NotificationSetting): void {
        const days = this.newDays(setting);
        if (!this.canAdd(setting) || days === null) {
            return;
        }
        this.update(setting.type, {daysBefore: withReminder(setting.daysBefore ?? [], days)});
        this.setNewDays(setting, null);
    }

    startAdding(setting: NotificationSetting): void {
        this.setNewDays(setting, null);
        this.addingType.set(setting.type ?? null);
    }

    // Enter and leaving the field add the days; a day already there is dropped when leaving, kept on Enter to fix
    finishAdding(setting: NotificationSetting, leaving = false): void {
        if (this.addingType() !== setting.type) {
            return;
        }
        if (this.canAdd(setting) || leaving || this.newDays(setting) === null) {
            this.addReminder(setting);
            this.setNewDays(setting, null);
            this.addingType.set(null);
        }
    }

    cancelAdding(setting: NotificationSetting): void {
        this.setNewDays(setting, null);
        this.addingType.set(null);
    }

    removeReminder(setting: NotificationSetting, days: number): void {
        this.update(setting.type, {daysBefore: (setting.daysBefore ?? []).filter(value => value !== days)});
    }

    shortLabel(days: number): string {
        return reminderShortLabel(days);
    }

    saveChanges(): void {
        const settings = this.$toSave();
        this.draft.set(settings);
        this.typedDays.set({});
        this.addingType.set(null);
        this.save.emit(settings);
    }

    cancel(): void {
        this.draft.set(this.settings().map(setting => ({...setting})));
        this.typedDays.set({});
        this.addingType.set(null);
    }

    private update(type: NotificationType | undefined, change: Partial<NotificationSetting>): void {
        this.draft.update(settings => settings.map(setting => setting.type === type ? {...setting, ...change} : setting));
    }
}

// Kept once each, furthest first, as the backend returns them
function withReminder(daysBefore: number[], days: number): number[] {
    return [...daysBefore, days].sort((a, b) => b - a);
}

// The column header says "Days before", so a reminder is just the days: "On the day", "1 day", "10 days"
export function reminderShortLabel(days: number): string {
    if (days === 0) {
        return 'On the day';
    }
    return days === 1 ? '1 day' : `${days} days`;
}
