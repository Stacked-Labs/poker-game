import { GameEventRecord } from '@/app/interfaces';

/**
 * Format a card string for display (e.g., "Ah" -> "A♥")
 */
function formatCard(card: string): string {
    if (!card || card.length < 2) return card;

    const rank = card.slice(0, -1);
    const suit = card.slice(-1).toLowerCase();

    const suitSymbols: Record<string, string> = {
        h: '♥',
        d: '♦',
        c: '♣',
        s: '♠',
    };

    return `${rank}${suitSymbols[suit] || suit}`;
}

/**
 * Format an array of cards for display
 */
function formatCards(cards: string[]): string {
    return cards.map(formatCard).join(' ');
}

/**
 * Format the winner message from hand_concluded metadata
 */
function formatWinners(metadata: Record<string, unknown>): string {
    const pots = metadata.pots as Array<{
        pot_number: number;
        amount: number | string;
        winners: Array<{
            uuid: string;
            name: string;
            share: number | string;
            winning_hand?: string[];
            hole_cards?: string[];
        }>;
    }>;

    const totalPot = metadata.total_pot as number | string;

    if (!pots || pots.length === 0) {
        return `Pot: $${totalPot}`;
    }

    // Handle main pot
    const mainPot = pots[0];
    if (!mainPot.winners || mainPot.winners.length === 0) {
        return `Pot: $${totalPot}`;
    }

    const winnerNames = mainPot.winners.map((w) => w.name).join(', ');
    const amount = mainPot.amount;

    // If there are side pots, mention them
    if (pots.length > 1) {
        return `${winnerNames} wins main pot $${amount}`;
    }

    return `${winnerNames} wins $${amount}`;
}

/**
 * Format a GameEventRecord into a human-readable log message.
 * Returns null for events that shouldn't be logged.
 */
export function formatGameEvent(event: GameEventRecord): string | null {
    const { event_type, player_name, amount, metadata } = event;

    switch (event_type) {
        // Player actions
        case 'call':
            return `${player_name} calls $${amount}`;

        case 'check':
            return `${player_name} checks`;

        case 'fold':
            return `${player_name} folds`;

        case 'raise':
            return `${player_name} raises to $${amount}`;

        case 'bet':
            return `${player_name} bets $${amount}`;

        case 'all_in':
            return `${player_name} is all in for $${amount}`;

        // Game events
        case 'hand_started': {
            const handNumber = metadata.hand_number as number;
            return `Hand #${handNumber} started`;
        }

        case 'cards_dealt':
            // Don't log hole cards being dealt (private info)
            return null;

        case 'flop_dealt': {
            const cards = metadata.cards as string[];
            if (cards && cards.length >= 3) {
                return `Flop: ${formatCards(cards.slice(0, 3))}`;
            }
            return 'Flop dealt';
        }

        case 'turn_dealt': {
            const cards = metadata.cards as string[];
            if (cards && cards.length >= 4) {
                return `Turn: ${formatCard(cards[3])}`;
            }
            return 'Turn dealt';
        }

        case 'river_dealt': {
            const cards = metadata.cards as string[];
            if (cards && cards.length >= 5) {
                return `River: ${formatCard(cards[4])}`;
            }
            return 'River dealt';
        }

        case 'hand_concluded':
            return formatWinners(metadata);

        // Meta events
        case 'player_joined': {
            const joinedName =
                player_name || (metadata.player_name as string) || 'A player';
            return `${joinedName} joined the table`;
        }

        case 'player_left': {
            const leftName =
                player_name || (metadata.player_name as string) || 'A player';
            return `${leftName} left the table`;
        }

        case 'player_kicked': {
            const kickedName =
                player_name || (metadata.player_name as string) || 'A player';
            return `${kickedName} was kicked from the table`;
        }

        case 'player_accepted': {
            const acceptedName =
                player_name || (metadata.player_name as string) || 'A player';
            return `${acceptedName} was accepted to the table`;
        }

        case 'player_denied': {
            const deniedName =
                player_name || (metadata.player_name as string) || 'A player';
            return `${deniedName}'s seat request was denied`;
        }

        case 'game_paused':
            return 'Game paused';

        case 'game_resumed':
            return 'Game resumed';

        case 'player_set_ready':
            return `${player_name} is ready`;

        case 'player_set_away':
            return `${player_name} is away`;

        case 'player_eliminated':
            return `${player_name} has been eliminated`;

        case 'pot_awarded':
            // This is typically covered by hand_concluded
            return null;

        default:
            // Don't log unknown events
            return null;
    }
}
