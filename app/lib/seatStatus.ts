import type { Player } from '../interfaces';

export type SeatStatusKind =
    | 'offline'
    | 'leaving'
    | 'sittingOut'
    | 'joining'
    | 'away'
    | 'none';

export type SeatStatus = { kind: SeatStatusKind };

export function getSeatStatus(player: Player): SeatStatus {
    if (player.isOnline === false) return { kind: 'offline' };
    if (player.leaveAfterHand) return { kind: 'leaving' };
    if (player.sitOutNextHand && player.ready) return { kind: 'sittingOut' };
    if (player.stack > 0 && !player.ready) {
        return player.readyNextHand ? { kind: 'joining' } : { kind: 'away' };
    }
    return { kind: 'none' };
}
