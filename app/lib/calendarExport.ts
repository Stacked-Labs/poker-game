import type { Tournament } from '../hooks/server_actions';

// Google Calendar deeplink for a tournament start. Pure client utility, no
// backend. We deliberately support only Google: one straightforward path beats
// a menu of formats most players never pick.

const SITE = 'https://stackedpoker.io';

// Google reads a dates range with no UTC offset as UTC, which matches the Z
// basic format below: 20260610T153000Z with separators and fractional seconds
// stripped. We require/assume a trailing Z on the ISO input. Returns null for
// an empty or malformed instant so callers can hide the action rather than crash.
function toUtcBasic(iso: string): string | null {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
}

function addHoursIso(iso: string, hours: number): string {
    return new Date(
        new Date(iso).getTime() + hours * 60 * 60 * 1000
    ).toISOString();
}

// Resolve the event end as an ISO string. advertised_end_at may be absent, an
// empty string, or a Go zero time (0001-01-01T00:00:00Z), which is truthy but
// bogus, so a bare `||` would never reach the fallback. Only trust it when it is
// a real instant after the start; otherwise use start + 4h.
function resolveEndIso(t: Tournament): string {
    const adv = t.advertised_end_at;
    if (adv) {
        const advMs = new Date(adv).getTime();
        const startMs = new Date(t.scheduled_start_at).getTime();
        if (!Number.isNaN(advMs) && advMs > startMs) return adv;
    }
    return addHoursIso(t.scheduled_start_at, 4);
}

const eventDescription = (t: Tournament) =>
    `Your seat is reserved. Take it at ${SITE}/tournament/${t.id}`;

// Null when the start instant is missing/malformed: the caller hides the
// action rather than render a button that would throw on click.
export function generateGoogleCalendarUrl(t: Tournament): string | null {
    const start = toUtcBasic(t.scheduled_start_at);
    const end = toUtcBasic(resolveEndIso(t));
    if (!start || !end) return null;

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: t.name,
        dates: `${start}/${end}`,
        details: eventDescription(t),
        location: `${SITE}/tournament/${t.id}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
