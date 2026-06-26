'use client';

import { Box, Container, Flex, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useActiveAccount } from 'thirdweb/react';
import {
    getTournament,
    getTournamentClock,
    getTournamentLeaderboard,
    getMyTournamentRegistrations,
    updateTournament,
    uploadTournamentBranding,
} from '../../hooks/server_actions';
import type { Tournament } from '../../hooks/server_actions';
import { useRegisterForTournament } from '../../hooks/useRegisterForTournament';
import { useSignInPrompt } from '../../hooks/useSignInPrompt';
import useToastHelper from '../../hooks/useToastHelper';
import { friendlyError, friendlyMessage } from '../../utils/toastErrors';
import { useClaimHostRake } from '../../hooks/useClaimHostRake';
import { useClaimRefund } from '../../hooks/useClaimRefund';
import { useClaimUnclaimedPrize } from '../../hooks/useClaimUnclaimedPrize';
import { useClaimHostEmergencyRefund } from '../../hooks/useClaimHostEmergencyRefund';
import { useOpenEmergencyRefund } from '../../hooks/useOpenEmergencyRefund';
import { useFundTournamentGuarantee } from '../../hooks/useFundTournamentGuarantee';
import { CHAIN_CONFIG } from '../../thirdwebclient';
import TournamentDetail, {
    type LeaderboardPlayer,
    type CommunityLinkValues,
} from '../../components/Tournament/TournamentDetail';
import RegistrationConfirmationModal from '../../components/Tournament/RegistrationConfirmationModal';
import TournamentRegisterModal from '../../components/Tournament/TournamentRegisterModal';
import FriendInviteSection from '../../components/Tournament/FriendInviteSection';
import TournamentInviteCard from '../../components/Tournament/TournamentInviteCard';

export default function TournamentPage() {
    const params = useParams();
    const id = parseInt(params?.id as string, 10);
    const router = useRouter();
    const account = useActiveAccount();
    const myWallet = account?.address;
    const { isSignedIn, promptSignIn } = useSignInPrompt();
    const toast = useToastHelper();

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
    const [registrants, setRegistrants] = useState<LeaderboardPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [goToTableLoading, setGoToTableLoading] = useState(false);
    const [blindLevel, setBlindLevel] = useState<number | null>(null);
    // Rest-break state from the same /clock fetch — lets the structure sheet
    // highlight the live break row on the detail page (no live socket here).
    const [onBreak, setOnBreak] = useState(false);
    // Drives the shared registration modal (open + register vs re-enter).
    const [regModal, setRegModal] = useState<{ isReentry: boolean } | null>(
        null
    );
    // Drives the "You're in." confirmation after a successful register/re-entry.
    const [confirm, setConfirm] = useState<{ isReentry: boolean } | null>(null);
    // After an on-chain register/unregister the DB lags by the indexer sync, so the
    // server's "am I registered" answer is briefly stale. This holds the optimistic
    // value (true after register, false after unregister) and stops load() from
    // flipping the button back until the server agrees. null = no pending action.
    const optimisticRegRef = useRef<boolean | null>(null);

    // Register / re-enter now run inside the shared modal; the page keeps this
    // hook only for unregister.
    const { unregister: unregisterOnChain } = useRegisterForTournament(
        tournament ?? undefined
    );
    const isActionLoading = actionLoading;

    const {
        pendingRake,
        claiming,
        claim: claimRake,
    } = useClaimHostRake(tournament?.contract_address, tournament?.chain);

    const refund = useClaimRefund(
        tournament?.contract_address,
        tournament?.chain,
        tournament?.status
    );

    const emergencyRefund = useOpenEmergencyRefund(
        tournament?.contract_address,
        tournament?.chain,
        tournament?.advertised_end_at,
        tournament?.status
    );

    const unclaimedPrize = useClaimUnclaimedPrize(
        tournament?.contract_address,
        tournament?.chain,
        tournament?.status
    );

    const isHost =
        !!myWallet &&
        tournament?.host_wallet?.toLowerCase() === myWallet.toLowerCase();

    const hostEmergencyRefund = useClaimHostEmergencyRefund(
        tournament?.contract_address,
        tournament?.chain,
        tournament?.status,
        isHost
    );

    const fundChainConfig = tournament?.chain
        ? CHAIN_CONFIG[tournament.chain]
        : undefined;
    const { fundAndOpen } = useFundTournamentGuarantee(
        tournament?.id,
        tournament?.contract_address,
        fundChainConfig?.chain,
        fundChainConfig?.usdc,
        tournament?.guarantee_usdc ?? 0
    );

    const load = async () => {
        if (isNaN(id)) return;
        try {
            const [tData, lbData, regsData] = await Promise.all([
                getTournament(id),
                getTournamentLeaderboard(id),
                myWallet
                    ? getMyTournamentRegistrations()
                    : Promise.resolve({ tournament_ids: [], finish_pos: {} }),
            ]);
            setTournament(tData.tournament);
            if (Array.isArray(lbData?.registrants)) {
                // Registration phase: nobody is in the field yet, but we have
                // the list of who's signed up. Standings stay empty.
                setPlayers([]);
                setRegistrants(
                    lbData.registrants.map(
                        (
                            r: {
                                uuid: string;
                                wallet: string;
                                xUsername?: string | null;
                                xDisplayName?: string | null;
                                xProfileImageUrl?: string | null;
                            },
                            i: number
                        ) => ({
                            uuid: r.uuid || r.wallet + i,
                            wallet: r.wallet,
                            stack: 0,
                            finish_pos: 0,
                            table_index: -1,
                            xUsername: r.xUsername,
                            xDisplayName: r.xDisplayName,
                            xProfileImageUrl: r.xProfileImageUrl,
                        })
                    )
                );
            } else if (
                lbData?.live === false &&
                Array.isArray(lbData.results)
            ) {
                // Completed tournament: map DB results to the unified player shape.
                setRegistrants([]);
                setPlayers(
                    lbData.results.map(
                        (
                            r: {
                                wallet_address: string;
                                finish_position: number;
                                prize_usdc: number;
                                xUsername?: string | null;
                                xDisplayName?: string | null;
                                xProfileImageUrl?: string | null;
                            },
                            i: number
                        ) => ({
                            uuid: r.wallet_address + i,
                            wallet: r.wallet_address,
                            stack: 0,
                            finish_pos: r.finish_position,
                            table_index: -1,
                            prize_usdc: r.prize_usdc,
                            xUsername: r.xUsername,
                            xDisplayName: r.xDisplayName,
                            xProfileImageUrl: r.xProfileImageUrl,
                        })
                    )
                );
            } else {
                setRegistrants([]);
                setPlayers(lbData?.players ?? []);
            }
            const serverRegistered = new Set(regsData.tournament_ids).has(id);
            // Respect a pending optimistic register/unregister: only accept the
            // server value once it matches the action we just took, then clear the
            // override. Otherwise the stale (pre-indexer-sync) value would flip the
            // button back to "Register"/"Unregister" right after a successful tx.
            if (
                optimisticRegRef.current === null ||
                optimisticRegRef.current === serverRegistered
            ) {
                optimisticRegRef.current = null;
                setIsRegistered(serverRegistered);
            }
            if (tData.tournament.status === 'running') {
                const clock = await getTournamentClock(id);
                setBlindLevel(clock?.level_number ?? null);
                setOnBreak(clock?.on_break ?? false);
            }
        } catch {
            toast.error('Could not load tournament');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [id, myWallet]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const interval = setInterval(() => {
            load();
        }, 60_000);
        return () => clearInterval(interval);
    }, [id, myWallet]); // eslint-disable-line react-hooks/exhaustive-deps

    // Re-pull server state a few times over ~35s after an on-chain action so the UI
    // catches up as the indexer syncs the event into the DB — without the user
    // having to refresh. load() preserves any pending optimistic register state.
    const resyncAfterOnchainAction = () => {
        [2000, 5000, 10000, 20000, 35000].forEach((ms) =>
            setTimeout(() => {
                load();
            }, ms)
        );
    };

    const handleRegister = (isReentry = false) => {
        // Not signed in → run the sign-in flow (connect + SIWE) in one tap
        // instead of dead-ending on a "connect wallet" toast.
        if (!isSignedIn) {
            promptSignIn();
            return;
        }
        // The shared modal owns the full flow: password entry + hashing, the
        // on-chain (or Free Play server) register, and the two-step tx indicator.
        setRegModal({ isReentry });
    };

    // Reconcile local state after the shared modal reports a successful entry.
    const handleRegisterSuccess = (isReentry: boolean) => {
        if (isReentry) {
            setPlayers((prev) =>
                prev.map((p) =>
                    myWallet &&
                    p.wallet.toLowerCase() === myWallet.toLowerCase()
                        ? {
                              ...p,
                              finish_pos: 0,
                              bullet_number: (p.bullet_number ?? 1) + 1,
                          }
                        : p
                )
            );
        } else {
            setIsRegistered(true);
            optimisticRegRef.current = true;
        }
        setConfirm({ isReentry });
        resyncAfterOnchainAction();
        setRegModal(null);
    };

    const handleUnregister = async () => {
        setActionLoading(true);
        try {
            const result = await unregisterOnChain();
            if (!result.ok) {
                const { title, description } = friendlyMessage(result.error, {
                    title: 'Could not unregister',
                    description: 'Please try again.',
                });
                toast.error(title, description);
            } else {
                toast.success('Unregistered');
                setIsRegistered(false); // optimistic
                optimisticRegRef.current = false;
                resyncAfterOnchainAction(); // background sync as the indexer catches up
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleGoToTable = async () => {
        if (!myWallet) return;
        // Open the tab synchronously inside the click so Safari doesn't block it,
        // then point it at the resolved URL once the leaderboard lookup returns.
        const tab = window.open('', '_blank');
        setGoToTableLoading(true);
        try {
            const data = await getTournamentLeaderboard(id);
            const entry = (data?.players ?? []).find(
                (p: LeaderboardPlayer) =>
                    p.wallet.toLowerCase() === myWallet.toLowerCase()
            );
            if (!entry) {
                tab?.close();
                toast.error("You're not seated in this tournament");
                return;
            }
            const url = `/table/tournament-${id}-table-${entry.table_index + 1}`;
            if (tab) tab.location.href = url;
            else router.push(url);
        } catch {
            tab?.close();
            toast.error('Could not find your table');
        } finally {
            setGoToTableLoading(false);
        }
    };

    // Host-only cosmetic edits. Each persists via PATCH and folds the returned
    // tournament back into state so the change survives a reload. TournamentDetail
    // applies the value optimistically; on failure we resync from the server.
    const persistTournamentPatch = async (
        patch: Parameters<typeof updateTournament>[1],
        successMsg: string
    ) => {
        try {
            const { tournament: updated } = await updateTournament(id, patch);
            setTournament(updated);
            toast.success(successMsg);
        } catch (error) {
            const { title, description } = friendlyMessage(error, {
                title: 'Could not save changes',
                description: 'Please try again.',
            });
            toast.error(title, description);
            load(); // resync from server truth
        }
    };

    const handleUpdateDescription = (description: string) => {
        persistTournamentPatch({ description }, 'Description updated');
    };

    const handleUpdateBranding = (patch: {
        logo_url?: string | null;
        banner_url?: string | null;
    }) => {
        // The editor sends null to clear; the backend clears on empty string and
        // leaves omitted fields unchanged — so forward only the provided key(s),
        // mapping null → '' to clear.
        const body: { logo_url?: string; banner_url?: string } = {};
        if ('logo_url' in patch) body.logo_url = patch.logo_url ?? '';
        if ('banner_url' in patch) body.banner_url = patch.banner_url ?? '';
        persistTournamentPatch(body, 'Branding updated');
    };

    const handleUploadImage = async (kind: 'logo' | 'banner', file: File) => {
        try {
            const { tournament: updated } = await uploadTournamentBranding(
                id,
                kind,
                file
            );
            setTournament(updated);
            toast.success(kind === 'logo' ? 'Logo updated' : 'Banner updated');
        } catch (error) {
            const { title, description } = friendlyMessage(error, {
                title: 'Could not upload image',
                description: 'Please try again.',
            });
            toast.error(title, description);
            throw error; // let TournamentDetail revert its optimistic preview
        }
    };

    const handleUpdateLinks = (links: CommunityLinkValues) => {
        // The editor omits cleared links; send all five keys (missing → '') so a
        // removed link is actually cleared server-side rather than left untouched.
        persistTournamentPatch(
            {
                x_url: links.x_url ?? '',
                website_url: links.website_url ?? '',
                discord_url: links.discord_url ?? '',
                telegram_url: links.telegram_url ?? '',
                chart_url: links.chart_url ?? '',
            },
            'Community links updated'
        );
    };

    const handleClaimRake = async () => {
        const ok = await claimRake();
        if (ok) toast.success('Platform fee claimed!');
        else toast.error('Could not claim platform fee', 'Please try again.');
    };

    const handleClaimRefund = async () => {
        const result = await refund.claim();
        if (result === 'confirmed') {
            toast.success('Refund claimed!');
        } else if (result === 'pending') {
            toast.info(
                'Refund is processing',
                "It's confirmed on-chain and will show here shortly."
            );
        } else {
            const { title, description } = friendlyError(refund.error, {
                title: 'Could not claim refund',
                description: 'Please try again.',
            });
            toast.error(title, description);
        }
    };

    const handleClaimPrize = async () => {
        const ok = await unclaimedPrize.claim();
        if (ok) toast.success('Prize claimed!');
        else toast.error(unclaimedPrize.error ?? 'Claim failed');
    };

    const handleClaimHostEmergencyRefund = async () => {
        const ok = await hostEmergencyRefund.claim();
        if (ok) toast.success('Guarantee deposit reclaimed!');
        else toast.error(hostEmergencyRefund.error ?? 'Claim failed');
    };

    const handleEnableEmergencyRefund = async () => {
        const ok = await emergencyRefund.open();
        if (ok) {
            toast.success('Emergency refunds enabled — players can now claim.');
            resyncAfterOnchainAction(); // pick up the status → emergency_refund flip
        } else {
            const { title, description } = friendlyError(emergencyRefund.error, {
                title: 'Could not enable emergency refunds',
                description: 'Please try again.',
            });
            toast.error(title, description);
        }
    };

    const handleFundAndOpen = async () => {
        setActionLoading(true);
        try {
            const ok = await fundAndOpen();
            if (ok) {
                toast.success('Guarantee funded — registration opens shortly');
                resyncAfterOnchainAction();
            } else {
                toast.error('Could not fund guarantee', 'Please try again.');
            }
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <Flex
                minH="100vh"
                align="center"
                justify="center"
                bg="card.lightGray"
            >
                <Spinner size="xl" color="brand.green" />
            </Flex>
        );
    }

    if (!tournament) {
        return (
            <Flex
                minH="100vh"
                align="center"
                justify="center"
                bg="card.lightGray"
            >
                <Text color="text.muted">Tournament not found.</Text>
            </Flex>
        );
    }

    return (
        <>
            <TournamentDetail
                tournament={tournament}
                players={players}
                registrants={registrants}
                myWallet={myWallet}
                isSignedIn={isSignedIn}
                isRegistered={isRegistered}
                blindLevel={blindLevel}
                onBreak={onBreak}
                actionLoading={isActionLoading}
                goToTableLoading={goToTableLoading}
                hostRakeUsdc={pendingRake == null ? null : Number(pendingRake)}
                rakeClaiming={claiming}
                refund={{
                    loading: refund.loading,
                    alreadyClaimed: refund.alreadyClaimed,
                    eligible: refund.eligible,
                    estimatedUsdc:
                        refund.estimatedUsdc == null
                            ? null
                            : Number(refund.estimatedUsdc),
                    claiming: refund.claiming,
                }}
                emergency={{
                    opened: emergencyRefund.opened,
                    available: emergencyRefund.available,
                    opening: emergencyRefund.opening,
                    msUntilAvailable: emergencyRefund.msUntilAvailable,
                }}
                unclaimed={{
                    loading: unclaimedPrize.loading,
                    claimableUsdc:
                        unclaimedPrize.claimableUsdc == null
                            ? null
                            : Number(unclaimedPrize.claimableUsdc),
                    claiming: unclaimedPrize.claiming,
                    claimed: unclaimedPrize.claimed,
                }}
                hostEmergencyRefundUsdc={
                    hostEmergencyRefund.depositUsdc == null
                        ? null
                        : Number(hostEmergencyRefund.depositUsdc)
                }
                hostRefundClaiming={hostEmergencyRefund.claiming}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
                onGoToTable={handleGoToTable}
                onFundAndOpen={handleFundAndOpen}
                onClaimRake={handleClaimRake}
                onClaimRefund={handleClaimRefund}
                onClaimPrize={handleClaimPrize}
                onEnableEmergencyRefund={handleEnableEmergencyRefund}
                onClaimHostEmergencyRefund={handleClaimHostEmergencyRefund}
                onBack={() => router.push('/public-games?format=tournaments')}
                onUpdateDescription={handleUpdateDescription}
                onUpdateBranding={handleUpdateBranding}
                onUpdateLinks={handleUpdateLinks}
                onUploadImage={handleUploadImage}
            />

            {/* Bring-a-friend (§3.3): registered entrants can invite friends into a free seat.
                The section self-hides when the event has no free tickets. */}
            {isRegistered && (
                <Flex justify="center" px={{ base: 4, md: 6 }} pb={10}>
                    <Box w="full" maxW="600px">
                        <FriendInviteSection tournamentId={id} />
                    </Box>
                </Flex>
            )}

            {/* Invite to this tournament (§4 / #593): share-to-attribute card. */}
            {tournament.status !== 'completed' &&
                tournament.status !== 'cancelled' && (
                    <Container maxW="container.lg" px={{ base: 3, md: 6 }} pb={6}>
                        <TournamentInviteCard tournamentId={id} />
                    </Container>
                )}

            <TournamentRegisterModal
                tournament={regModal ? tournament : null}
                isReentry={regModal?.isReentry ?? false}
                onClose={() => setRegModal(null)}
                onSuccess={() =>
                    handleRegisterSuccess(regModal?.isReentry ?? false)
                }
            />

            {confirm && tournament && (
                <RegistrationConfirmationModal
                    tournament={tournament}
                    isReentry={confirm.isReentry}
                    isOpen
                    onClose={() => setConfirm(null)}
                    onSuccess={() => {
                        // Registered or re-entered, the player is now registered.
                        setIsRegistered(true);
                        load();
                    }}
                />
            )}
        </>
    );
}
