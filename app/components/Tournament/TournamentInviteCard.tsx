'use client';

import React, { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { getReferralInfo } from '@/app/hooks/server_actions';
import TournamentInviteCardView from './TournamentInviteCardView';

// Tournament invite & share surface (Viral §4 / #355). Container: resolves the signed-in player's
// permanent referral code, then hands off to the presentational card. When the invited friend takes
// their first real-money action, the sharer earns referral credit — status only, never cash.
// Referrer-only: nothing to stamp without a connected wallet.

interface TournamentInviteCardProps {
    tournamentId: number;
    // Optional Section 3 bring-a-friend free-seat codes the player still has to give (#336). Each
    // renders a referral-stamped free-seat link; absent, only the plain paid-entry invite shows.
    freeSeatCodes?: string[];
}

const TournamentInviteCard: React.FC<TournamentInviteCardProps> = ({ tournamentId, freeSeatCodes }) => {
    const account = useActiveAccount();
    const [loading, setLoading] = useState(false);
    const [myCode, setMyCode] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!account?.address) {
            setMyCode(null);
            return;
        }
        setLoading(true);
        getReferralInfo(account.address)
            .then((info) => {
                if (!cancelled) setMyCode(info.myCode ?? null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [account?.address]);

    if (!account?.address) return null;

    return (
        <TournamentInviteCardView
            tournamentId={tournamentId}
            myCode={myCode}
            loading={loading}
            freeSeats={freeSeatCodes}
        />
    );
};

export default TournamentInviteCard;
