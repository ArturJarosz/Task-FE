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
];

export const SETTINGS_SECTIONS: SettingsSection[] = SETTINGS_SECTION_GROUPS.flatMap(group => group.sections);
