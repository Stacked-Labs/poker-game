export type SeatReactionPayload = {
    targetUuid: string;
    emoteId: string;
    emoteName: string;
    senderUuid?: string | null;
    nonce: string;
    ts: number;
};

const SEAT_REACTION_PREFIX = '[[seat-reaction]]';

export function buildSeatReactionMessage(payload: SeatReactionPayload): string {
    return `${SEAT_REACTION_PREFIX}${JSON.stringify(payload)}`;
}

export function parseSeatReactionMessage(
    message: string
): SeatReactionPayload | null {
    if (!message.startsWith(SEAT_REACTION_PREFIX)) {
        return null;
    }

    const raw = message.slice(SEAT_REACTION_PREFIX.length);
    try {
        const parsed = JSON.parse(raw) as Partial<SeatReactionPayload>;
        if (
            typeof parsed.targetUuid !== 'string' ||
            typeof parsed.emoteId !== 'string' ||
            typeof parsed.emoteName !== 'string' ||
            typeof parsed.nonce !== 'string' ||
            typeof parsed.ts !== 'number'
        ) {
            return null;
        }

        return {
            targetUuid: parsed.targetUuid,
            emoteId: parsed.emoteId,
            emoteName: parsed.emoteName,
            senderUuid: parsed.senderUuid ?? null,
            nonce: parsed.nonce,
            ts: parsed.ts,
        };
    } catch (error) {
        return null;
    }
}

export function getSeatReactionEmoteUrl(emoteId: string): string {
    return `https://cdn.7tv.app/emote/${emoteId}/1x.webp`;
}
