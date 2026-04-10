/**
 * IANA timezone for displaying dates/times (must match Laravel `APP_TIMEZONE`).
 * Set in `.env.local`: NEXT_PUBLIC_APP_TIMEZONE=Europe/London
 */
const raw = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_APP_TIMEZONE?.trim() : '';

export const APP_TIMEZONE = raw && raw.length > 0 ? raw : 'Europe/London';

export function formatInAppTimezone(
    value: Date | string | number | null | undefined,
    options?: Intl.DateTimeFormatOptions,
): string {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) {
        return typeof value === 'string' ? value : '';
    }

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: APP_TIMEZONE,
        ...options,
    }).format(d);
}
