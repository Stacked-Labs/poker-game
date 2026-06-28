import type { IconType } from 'react-icons';
import { FaTrophy, FaMedal, FaCoins, FaUserPlus } from 'react-icons/fa';
import { GiPokerHand } from 'react-icons/gi';

// Drawn, on-brand icon per board id — replaces the backend's emoji glyphs (🏆 ♠ 🥇 🎟 🤝) so the
// Stats Hub tabs and the Top Hosts header share the StatLedger icon vocabulary instead of
// platform-variant emoji. Unknown ids fall back to whatever glyph the backend supplies.
export const BOARD_ICON: Record<string, IconType> = {
    points: FaTrophy,
    hands: GiPokerHand,
    tournaments_won: FaMedal,
    top_hosts: FaCoins,
    referrals: FaUserPlus,
};
