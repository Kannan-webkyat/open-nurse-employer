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
    const d = value instanceof Date ? value : parseUtcInstantFromApi(String(value));
    if (Number.isNaN(d.getTime())) {
        return typeof value === 'string' ? value : '';
    }

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: APP_TIMEZONE,
        ...options,
    }).format(d);
}

/** Parse API datetime strings as UTC when no offset is present. */
export function parseUtcInstantFromApi(value: string): Date {
    const trimmed = value.trim();
    if (!trimmed) {
        return new Date(NaN);
    }

    if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed)) {
        return new Date(trimmed);
    }

    const isoLike = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(isoLike)) {
        return new Date(`${isoLike}Z`);
    }

    return new Date(trimmed);
}

type AppWallParts = { y: number; mo: number; d: number; h: number; min: number };

function getAppWallParts(utcInstant: Date): AppWallParts {
    const fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: APP_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });
    const parts = fmt.formatToParts(utcInstant);
    const v = (type: Intl.DateTimeFormatPart['type']): string =>
        parts.find((p) => p.type === type)?.value ?? '0';

    return {
        y: Number.parseInt(v('year'), 10),
        mo: Number.parseInt(v('month'), 10),
        d: Number.parseInt(v('day'), 10),
        h: Number.parseInt(v('hour'), 10),
        min: Number.parseInt(v('minute'), 10),
    };
}

function appWallPartsEqual(a: AppWallParts, b: AppWallParts): boolean {
    return a.y === b.y && a.mo === b.mo && a.d === b.d && a.h === b.h && a.min === b.min;
}

/** Map app wall-clock date/time inputs to a UTC instant. */
export function appWallLocalToUtcInstant(
    y: number,
    mo: number,
    d: number,
    h: number,
    min: number,
): Date {
    const target: AppWallParts = { y, mo, d, h, min };
    const anchor = Date.UTC(y, mo - 1, d, 12, 0, 0, 0);
    const start = anchor - 2 * 24 * 60 * 60 * 1000;
    const end = anchor + 2 * 24 * 60 * 60 * 1000;

    for (let ms = start; ms <= end; ms += 60_000) {
        if (appWallPartsEqual(getAppWallParts(new Date(ms)), target)) {
            return new Date(ms);
        }
    }

    return new Date(NaN);
}

const pad = (value: number): string => String(value).padStart(2, '0');

/** Date input value (YYYY-MM-DD) in `APP_TIMEZONE`. */
export function toAppDateInputValue(value: Date | string): string {
    const d = value instanceof Date ? value : parseUtcInstantFromApi(value);
    if (Number.isNaN(d.getTime())) {
        return '';
    }

    const parts = getAppWallParts(d);

    return `${parts.y}-${pad(parts.mo)}-${pad(parts.d)}`;
}

/** Time input value (HH:mm) in `APP_TIMEZONE`. */
export function toAppTimeInputValue(value: Date | string): string {
    const d = value instanceof Date ? value : parseUtcInstantFromApi(value);
    if (Number.isNaN(d.getTime())) {
        return '';
    }

    const parts = getAppWallParts(d);

    return `${pad(parts.h)}:${pad(parts.min)}`;
}

/** Today's date (YYYY-MM-DD) in `APP_TIMEZONE`. */
export function todayAppDateInputValue(): string {
    return toAppDateInputValue(new Date());
}

/** Build interview schedule payload using `APP_TIMEZONE` wall clock. */
export function buildInterviewSchedulePayload(date: string, time: string, meetingUrl: string) {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const instant = appWallLocalToUtcInstant(year, month, day, hours, minutes);

    return {
        interview_at: instant.toISOString(),
        interview_timezone: APP_TIMEZONE,
        meeting_link: meetingUrl,
    };
}
