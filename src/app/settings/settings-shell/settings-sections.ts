export interface SettingsSection {
    key: string;
    label: string;
    icon: string;
    // Shows system parameters, so opening the section reloads them (another user may have changed a value)
    showsSystemParameters: boolean;
}

export interface SettingsSectionGroup {
    label: string;
    sections: SettingsSection[];
}

// Each section is a sub-page at /settings/{key}; add new chapters here and a matching @case in the shell
export const SETTINGS_SECTION_GROUPS: SettingsSectionGroup[] = [
    {
        label: 'Application', sections: [
            {key: 'system-parameters', label: 'System parameters', icon: 'pi pi-sliders-h', showsSystemParameters: true},
            {key: 'appearance', label: 'Appearance', icon: 'pi pi-palette', showsSystemParameters: true},
        ]
    },
    {
        label: 'Projects', sections: [
            {key: 'project-types', label: 'Project types', icon: 'pi pi-tags', showsSystemParameters: false},
        ]
    },
    {
        label: 'Partners', sections: [
            {key: 'contractor-categories', label: 'Contractor categories', icon: 'pi pi-wrench', showsSystemParameters: false},
            {key: 'supplier-categories', label: 'Supplier categories', icon: 'pi pi-truck', showsSystemParameters: false},
        ]
    },
    {
        label: 'Finance', sections: [
            {key: 'cost-categories', label: 'Cost categories', icon: 'pi pi-wallet', showsSystemParameters: false},
        ]
    },
    {
        label: 'Integrations', sections: [
            {key: 'google-calendar', label: 'Google Calendar', icon: 'pi pi-calendar', showsSystemParameters: true},
        ]
    },
];

export const SETTINGS_SECTIONS: SettingsSection[] = SETTINGS_SECTION_GROUPS.flatMap(group => group.sections);
