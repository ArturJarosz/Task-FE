import {addDays, format, startOfDay} from "date-fns";
import {ClientType, ContractStatus, Project} from "../../generated/models";
import {
    activeFilters,
    contractPastDeadline,
    EMPTY_FILTER,
    filterChips,
    filterOptions,
    matchesFilter,
    clientName,
    projectInterval,
    withoutFilter
} from "./project-filter";

const today = startOfDay(new Date());

function day(offset: number): string {
    return format(addDays(today, offset), 'yyyy-MM-dd');
}

describe('project filter', () => {
    const lublin: Project = {
        id: 1, name: 'Lublin 01', typeId: 4,
        client: {id: 7, clientType: ClientType.PRIVATE, firstName: 'Jan', lastName: 'Kowalski'},
        architect: {id: 3, firstName: 'Anna', lastName: 'Nowak'},
        startDate: day(-30),
        contract: {startDate: day(-40), deadline: day(-5), status: ContractStatus.SIGNED}
    };
    const gdansk: Project = {
        id: 2, name: 'Gdańsk house', typeId: 1,
        client: {id: 8, clientType: ClientType.CORPORATE, companyName: 'Firma ABC'},
        contract: {startDate: day(100), endDate: day(200), deadline: day(210), status: ContractStatus.OFFER}
    };
    const undated: Project = {id: 3, name: 'No dates'};

    it('lets every project through with no filters on', () => {
        expect([lublin, gdansk, undated].every(project => matchesFilter(project, EMPTY_FILTER, today))).toBeTrue();
        expect(activeFilters(EMPTY_FILTER)).toEqual([]);
    });

    it('searches the project name, ignoring case', () => {
        let filter = {...EMPTY_FILTER, search: '  GDAŃ '};
        expect(matchesFilter(gdansk, filter, today)).toBeTrue();
        expect(matchesFilter(lublin, filter, today)).toBeFalse();
    });

    it('filters by client, architect, type and contract status', () => {
        expect(matchesFilter(lublin, {...EMPTY_FILTER, clientId: 7}, today)).toBeTrue();
        expect(matchesFilter(gdansk, {...EMPTY_FILTER, clientId: 7}, today)).toBeFalse();
        expect(matchesFilter(gdansk, {...EMPTY_FILTER, architectId: 3}, today)).toBeFalse();
        expect(matchesFilter(gdansk, {...EMPTY_FILTER, types: ['1']}, today)).toBeTrue();
        expect(matchesFilter(undated, {...EMPTY_FILTER, types: ['2']}, today)).toBeFalse();
        expect(matchesFilter(lublin, {...EMPTY_FILTER, contractStatuses: [ContractStatus.OFFER]}, today)).toBeFalse();
    });

    it('keeps projects with any date in the period, with an open bar reaching today', () => {
        let thisMonth = {...EMPTY_FILTER, period: [today, null]};
        // Lublin has no end dates, so it runs to today
        expect(matchesFilter(lublin, thisMonth, today)).toBeTrue();
        expect(matchesFilter(gdansk, thisMonth, today)).toBeFalse();
        expect(matchesFilter(undated, thisMonth, today)).toBeFalse();
        expect(matchesFilter(gdansk, {...EMPTY_FILTER, period: [addDays(today, 150), addDays(today, 400)]}, today)).toBeTrue();
        expect(projectInterval(undated, today)).toBeNull();
    });

    it('counts a contract as past its deadline only when its bar runs past it', () => {
        expect(contractPastDeadline(lublin.contract, today)).toBeTrue();
        expect(contractPastDeadline(gdansk.contract, today)).toBeFalse();
        expect(contractPastDeadline({startDate: day(-40), endDate: day(-10), deadline: day(-10)}, today)).toBeFalse();
        expect(contractPastDeadline({startDate: day(-40), endDate: day(-9), deadline: day(-10)}, today)).toBeTrue();
        expect(contractPastDeadline({startDate: day(-40)}, today)).toBeFalse();
        expect(matchesFilter(gdansk, {...EMPTY_FILTER, pastDeadlineOnly: true}, today)).toBeFalse();
    });

    it('builds one chip per filter that is on, and removes one at a time', () => {
        let filter = {...EMPTY_FILTER, clientId: 7, period: [new Date(2026, 5, 10), new Date(2027, 2, 1)], pastDeadlineOnly: true};
        let clients = filterOptions([lublin.client, gdansk.client, lublin.client, undefined], clientName);
        expect(clients).toEqual([{id: 8, label: 'Firma ABC'}, {id: 7, label: 'Jan Kowalski'}]);
        // Two clients with one name stay two options
        expect(filterOptions([lublin.client, {...lublin.client, id: 9}], clientName).map(option => option.id)).toEqual([7, 9]);
        expect(filterOptions([lublin.architect], p => p ? `${p.firstName} ${p.lastName}` : '')).toEqual([{id: 3, label: 'Anna Nowak'}]);
        let chips = filterChips(filter, {clients, architects: [], projectTypes: [], contractStatuses: []});
        expect(chips.map(chip => chip.label)).toEqual(['Client: Jan Kowalski', 'Period: 06.2026 – 03.2027', 'Past deadline only']);
        expect(activeFilters(withoutFilter(filter, 'period'))).toEqual(['clientId', 'pastDeadlineOnly']);
    });
});
