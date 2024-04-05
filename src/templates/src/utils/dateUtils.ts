import { DateTime, DateTimeUnit } from 'luxon';

export const startOf = (date: string, unit: DateTimeUnit) => {
    return DateTime.fromISO(date).startOf(unit);
};

export const endOf = (date: string, unit: DateTimeUnit) => {
    return DateTime.fromISO(date).endOf(unit);
};

export const eachInterval = (startDate: string, endDate: string, interval: DateTimeUnit) => {
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);

    const intervals = [];
    let current = start;

    while (current <= end) {
        intervals.push(current.toISODate());
        current = current.plus({ [interval]: 1 });
    }

    return intervals;
}