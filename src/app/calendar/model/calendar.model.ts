export enum CalendarViewMode {
    MONTH = 'dayGridMonth',
    WEEK = 'timeGridWeek'
}

export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface EventSelection {
    date: Date;
    endDate?: Date;
    allDay: boolean;
}
