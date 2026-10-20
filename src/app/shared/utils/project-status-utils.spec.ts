import {isActiveProject} from './project-status-utils';
import {ProjectStatus} from '../../generated/models/project-status';

describe('isActiveProject', () => {
    const activeStatuses = [ProjectStatus.TO_DO, ProjectStatus.IN_PROGRESS];

    it('is true for a project in a configured active status', () => {
        expect(isActiveProject({status: ProjectStatus.IN_PROGRESS}, activeStatuses)).toBeTrue();
    });

    it('is false for a project outside the configured active statuses', () => {
        expect(isActiveProject({status: ProjectStatus.DONE}, activeStatuses)).toBeFalse();
    });

    it('is false for a project without a status or before the configuration loads', () => {
        expect(isActiveProject({}, activeStatuses)).toBeFalse();
        expect(isActiveProject({status: ProjectStatus.TO_DO}, null)).toBeFalse();
    });
});
