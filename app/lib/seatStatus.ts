import type { Player } from '../interfaces';

export type SeatStatusKind =
    | 'offline'
    | 'leaving'
    | 'sittingOut'
    | 'joining'
    | 'away'
    | 'none';

export type SeatStatus = { kind: SeatStatusKind };

export function getSeatStatus(player: Player, isSelf: boolean): SeatStatus {
    if (player.isOnline === false) return { kind: 'offline' };

    const intentVisible = !isSelf || !player.in;
    if (!intentVisible) return { kind: 'none' };

    if (player.leaveAfterHand) return { kind: 'leaving' };
    if (player.sitOutNextHand && player.ready) return { kind: 'sittingOut' };
    if (player.stack > 0 && !player.ready) {
        return player.readyNextHand ? { kind: 'joining' } : { kind: 'away' };
    }
    return { kind: 'none' };
}
