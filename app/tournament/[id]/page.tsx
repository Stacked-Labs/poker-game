'use client';

import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
} from '@chakra-ui/react';
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
import useToastHelper from '../../hooks/useToastHelper';
import { friendlyError } from '../../utils/toastErrors';
import { useClaimHostRake } from '../../hooks/useClaimHostRake';
import { useClaimRefund } from '../../hooks/useClaimRefund';
import { useOpenEmergencyRefund } from '../../hooks/useOpenEmergencyRefund';
import { useFundTournamentGuarantee } from '../../hooks/useFundTournamentGuarantee';
import { CHAIN_CONFIG } from '../../thirdwebclient';
import TournamentDetail, {
    type LeaderboardPlayer,
    type CommunityLinkValues,
} from '../../components/Tournament/TournamentDetail';
import RegistrationConfirmationModal from '../../components/Tournament/RegistrationConfirmationModal';

async function hashPasswordCode(code: string): Promise<string> {
    const enc = new TextEncoder().encode(code);
    const digest = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

export default function TournamentPage() {
    const params = useParams();
    const id = parseInt(params?.id as string, 10);
    const router = useRouter();
    const account = useActiveAccount();
    const myWallet = account?.address;
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
    const [pendingPasscode, setPendingPasscode] = useState<{
        isReentry: boolean;
    } | null>(null);
    // Drives the "You're in." confirmation after a successful register/re-entry.
    const [confirm, setConfirm] = useState<{ isReentry: boolean } | null>(null);
    const [passcode, setPasscode] = useState('');
    const [passcodeLoading, setPasscodeLoading] = useState(false);
    const passcodeInputRef = useRef<HTMLInputElement>(null);
    // After an on-chain register/unregister the DB lags by the indexer sync, so the
    // server's "am I registered" answer is briefly stale. This holds the optimistic
    // value (true after register, false after unregister) and stops load() from
    // flipping the button back until the server agrees. null = no pending action.
    const optimisticRegRef = useRef<boolean | null>(null);

    const {
        register: registerOnChain,
        reenter: reenterOnChain,
        unregister: unregisterOnChain,
        status: registerStatus,
    } = useRegisterForTournament(tournament ?? undefined);
    const isActionLoading =
        actionLoading ||
        registerStatus === 'approving' ||
        registerStatus === 'registering';

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

    const handleRegister = async (isReentry = false) => {
        if (!myWallet) {
            toast.warning('Connect wallet to register');
            return;
        }
        if (tournament?.is_private && !tournament?.contract_address) {
            setPendingPasscode({ isReentry });
            setPasscode('');
            return;
        }
        await doRegister(isReentry);
    };

    const doRegister = async (isReentry = false, passwordCode?: string) => {
        setActionLoading(true);
        try {
            const result = isReentry
                ? await reenterOnChain(passwordCode)
                : await registerOnChain(passwordCode);
            if (!result.ok) {
                const { title, description } = friendlyError(result.error, {
                    title: isReentry
                        ? 'Could not re-enter'
                        : 'Could not register',
                    description: 'Please try again.',
                });
                toast.error(title, description);
            } else {
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
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handlePasscodeSubmit = async () => {
        if (!pendingPasscode) return;
        if (!passcode.trim()) {
            toast.warning('Enter the tournament password');
            return;
        }
        setPasscodeLoading(true);
        try {
            const hash = await hashPasswordCode(passcode.trim());
            await doRegister(pendingPasscode.isReentry, hash);
            setPendingPasscode(null);
            setPasscode('');
        } finally {
            setPasscodeLoading(false);
        }
    };

    const handleUnregister = async () => {
        setActionLoading(true);
        try {
            const result = await unregisterOnChain();
            if (!result.ok) {
                const { title, description } = friendlyError(result.error, {
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
            const { title, description } = friendlyError(error, {
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
            const { title, description } = friendlyError(error, {
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
        const ok = await refund.claim();
        if (ok) toast.success('Refund claimed!');
        else {
            const { title, description } = friendlyError(refund.error, {
                title: 'Could not claim refund',
                description: 'Please try again.',
            });
            toast.error(title, description);
        }
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
        const ok = await fundAndOpen();
        if (ok) {
            toast.success('Guarantee funded — registration is open!');
            resyncAfterOnchainAction();
        } else {
            toast.error('Could not fund guarantee', 'Please try again.');
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
                isRegistered={isRegistered}
                blindLevel={blindLevel}
                onBreak={onBreak}
                actionLoading={isActionLoading}
                actionLabel={
                    registerStatus === 'approving'
                        ? 'Approving…'
                        : 'Registering…'
                }
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
                onRegister={handleRegister}
                onUnregister={handleUnregister}
                onGoToTable={handleGoToTable}
                onFundAndOpen={handleFundAndOpen}
                onClaimRake={handleClaimRake}
                onClaimRefund={handleClaimRefund}
                onEnableEmergencyRefund={handleEnableEmergencyRefund}
                onBack={() => router.push('/public-games?format=tournaments')}
                onUpdateDescription={handleUpdateDescription}
                onUpdateBranding={handleUpdateBranding}
                onUpdateLinks={handleUpdateLinks}
                onUploadImage={handleUploadImage}
            />

            <Modal
                isOpen={pendingPasscode !== null}
                onClose={() => setPendingPasscode(null)}
                isCentered
                initialFocusRef={passcodeInputRef}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Tournament Password</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel fontSize="sm">
                                Enter the access code to register
                            </FormLabel>
                            <Input
                                ref={passcodeInputRef}
                                size="sm"
                                type="password"
                                placeholder="Access code"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter')
                                        handlePasscodeSubmit();
                                }}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="ghost"
                            mr={3}
                            size="sm"
                            onClick={() => setPendingPasscode(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="green"
                            size="sm"
                            isLoading={passcodeLoading}
                            onClick={handlePasscodeSubmit}
                        >
                            Register
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

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
