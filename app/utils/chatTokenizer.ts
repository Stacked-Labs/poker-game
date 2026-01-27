import type { Emote } from '@/app/stores/emotes';

export type ChatToken =
    | { type: 'text'; content: string }
    | { type: 'emote'; id: string; url: string; name: string }
    | { type: 'mention'; userId?: string; username: string };

export function tokenizeMessage(
    message: string,
    emotesByName: Record<string, Emote>,
    emotesByNameLower: Record<string, Emote>
): ChatToken[] {
    if (!message) return [];

    const parts = message.split(/(\s+)/);
    const tokens: ChatToken[] = [];

    for (const part of parts) {
        if (!part) continue;

        if (/^\s+$/.test(part)) {
            tokens.push({ type: 'text', content: part });
            continue;
        }

        let candidate = part;
        if (candidate.startsWith(':') && candidate.endsWith(':')) {
            const inner = candidate.slice(1, -1);
            if (inner.length > 0) {
                candidate = inner;
            }
        }

        const emote =
            emotesByName[candidate] ??
            emotesByNameLower[candidate.toLowerCase()];
        if (emote) {
            tokens.push({
                type: 'emote',
                id: emote.id,
                url: emote.url,
                name: emote.name,
            });
            continue;
        }

        if (part.startsWith('@') && part.length > 1) {
            tokens.push({ type: 'mention', username: part.slice(1) });
            continue;
        }

        tokens.push({ type: 'text', content: part });
    }

    return tokens;
}
