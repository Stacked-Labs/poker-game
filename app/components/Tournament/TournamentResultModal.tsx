'use client';

import { useContext } from 'react';
import { Modal, ModalContent, ModalOverlay } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { payoutForPosition, placesPaid } from '../PublicGames/payouts';
import { explorerBase } from '../PublicGames/tournamentFormat';
import TournamentResultCard from './TournamentResultCard';

/**
 * Renders the local player's bust/win result card when the WS feed flags a
 * result (myResult). Reads everything from the live slice; computes the prize
 * from the settled leaderboard row when present, else the projected ladder.
 */
export default function TournamentResultModal({
    tournamentId,
}: {
    tournamentId: number;
}) {
    const { appState, dispatch } = useContext(AppContext);
    const router = useRouter();
    const live = appState.tournamentLive;
    const myResult = live?.myResult ?? null;
    const meta = live?.meta ?? null;

    if (!myResult || !meta) return null;

    const isWin = myResult.kind === 'win';
    const position = isWin ? 1 : myResult.position;
    // Finish position + payout tier are per unique player (one leaderboard row
    // each); registered_count counts bullet entries. Prefer the unique count.
    const fieldSize = live!.leaderboard.length || meta.registeredCount;

    const myRow = live!.leaderboard.find(
        (p) =>
            (appState.address &&
                p.wallet?.toLowerCase() === appState.address.toLowerCase()) ||
            p.uuid === appState.clientID
    );
    const settledPrize = myRow?.prize_usdc ?? 0;
    const prizeUsdc = meta.isFreePlay
        ? 0
        : settledPrize > 0
          ? settledPrize
          : payoutForPosition(position, fieldSize, meta.prizePoolUsdc);

    const lateRegOpen = new Date(meta.lateRegCloseAt).getTime() > Date.now();
    const bulletNumber = myRow?.bullet_number ?? 1;
    const canReenter =
        !isWin &&
        meta.reentryAllowed &&
        lateRegOpen &&
        bulletNumber <= meta.reentryMax;
    const bulletsLeft = Math.max(0, meta.reentryMax - bulletNumber + 1);

    const close = () => dispatch({ type: 'clearTournamentMyResult' });
    // Hand off to the detail page, which owns the (on-chain) re-entry flow.
    const reenter = () => {
        close();
        router.push(`/tournament/${tournamentId}`);
    };

    const settlementTxUrl =
        meta.settlementTxHash && !meta.isFreePlay
            ? `${explorerBase(meta.chain)}/tx/${meta.settlementTxHash}`
            : null;

    return (
        <Modal isOpen onClose={close} isCentered>
            <ModalOverlay
                bg="rgba(11, 20, 48, 0.6)"
                backdropFilter="blur(6px)"
            />
            <ModalContent bg="transparent" boxShadow="none" m={4} maxW="380px">
                <TournamentResultCard
                    kind={myResult.kind}
                    position={position}
                    fieldSize={fieldSize}
                    prizeUsdc={prizeUsdc}
                    placesPaid={placesPaid(fieldSize)}
                    isFreePlay={meta.isFreePlay}
                    tournamentName={meta.name}
                    settlementTxUrl={settlementTxUrl}
                    reentry={
                        canReenter
                            ? {
                                  buyInUsdc: meta.buyInUsdc,
                                  closesAtIso: meta.lateRegCloseAt,
                                  bulletsLeft,
                              }
                            : undefined
                    }
                    onReenter={reenter}
                    onClose={close}
                />
            </ModalContent>
        </Modal>
    );
}
