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
} from '../../hooks/server_actions';
import type { Tournament } from '../../hooks/server_actions';
import { useRegisterForTournament } from '../../hooks/useRegisterForTournament';
import useToastHelper from '../../hooks/useToastHelper';
import { useClaimHostRake } from '../../hooks/useClaimHostRake';
import { useClaimRefund } from '../../hooks/useClaimRefund';
import { useOpenEmergencyRefund } from '../../hooks/useOpenEmergencyRefund';
import { useFundTournamentGuarantee } from '../../hooks/useFundTournamentGuarantee';
import { CHAIN_CONFIG } from '../../thirdwebclient';
import TournamentDetail, {
    type LeaderboardPlayer,
} from '../../components/Tournament/TournamentDetail';

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
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [goToTableLoading, setGoToTableLoading] = useState(false);
    const [blindLevel, setBlindLevel] = useState<number | null>(null);
    const [pendingPasscode, setPendingPasscode] = useState<{
        isReentry: boolean;
    } | null>(null);
    const [passcode, setPasscode] = useState('');
    const [passcodeLoading, setPasscodeLoading] = useState(false);
    const passcodeInputRef = useRef<HTMLInputElement>(null);

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
            if (lbData?.live === false && Array.isArray(lbData.results)) {
                // Completed tournament: map DB results to the unified player shape.
                // TODO(backend): add x_username + x_profile_image_url to leaderboard to light up avatars/handles.
                setPlayers(
                    lbData.results.map(
                        (
                            r: {
                                wallet_address: string;
                                finish_position: number;
                                prize_usdc: number;
                            },
                            i: number
                        ) => ({
                            uuid: r.wallet_address + i,
                            wallet: r.wallet_address,
                            stack: 0,
                            finish_pos: r.finish_position,
                            table_index: -1,
                            prize_usdc: r.prize_usdc,
                        })
                    )
                );
            } else {
                setPlayers(lbData?.players ?? []);
            }
            setIsRegistered(new Set(regsData.tournament_ids).has(id));
            if (tData.tournament.status === 'running') {
                const clock = await getTournamentClock(id);
                setBlindLevel(clock?.level_number ?? null);
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
        const interval = setInterval(() => { load(); }, 60_000);
        return () => clearInterval(interval);
    }, [id, myWallet]); // eslint-disable-line react-hooks/exhaustive-deps

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
                toast.error(
                    result.error ??
                        (isReentry ? 'Re-entry failed' : 'Registration failed')
                );
            } else {
                toast.success(isReentry ? 'Re-entered!' : 'Registered!');
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
                }
                load();
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
                toast.error(result.error ?? 'Unregister failed');
            } else {
                toast.success('Unregistered');
                setIsRegistered(false); // optimistic
                load(); // background sync
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleGoToTable = async () => {
        if (!myWallet) return;
        setGoToTableLoading(true);
        try {
            const data = await getTournamentLeaderboard(id);
            const entry = (data?.players ?? []).find(
                (p: LeaderboardPlayer) =>
                    p.wallet.toLowerCase() === myWallet.toLowerCase()
            );
            if (!entry) {
                toast.error("You're not seated in this tournament");
                return;
            }
            router.push(
                `/table/tournament-${id}-table-${entry.table_index + 1}`
            );
        } catch {
            toast.error('Could not find your table');
        } finally {
            setGoToTableLoading(false);
        }
    };

    const handleClaimRake = async () => {
        const ok = await claimRake();
        if (ok) toast.success('Rake claimed!');
        else toast.error('Claim failed');
    };

    const handleClaimRefund = async () => {
        const ok = await refund.claim();
        if (ok) toast.success('Refund claimed!');
        else toast.error(refund.error ?? 'Claim failed');
    };

    const handleEnableEmergencyRefund = async () => {
        const ok = await emergencyRefund.open();
        if (ok)
            toast.success('Emergency refunds enabled — players can now claim.');
        else toast.error(emergencyRefund.error ?? 'Transaction failed');
    };

    const handleFundAndOpen = async () => {
        const ok = await fundAndOpen();
        if (ok) {
            toast.success('Guarantee funded — registration is open!');
            load();
        } else {
            toast.error('Funding failed');
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
                myWallet={myWallet}
                isRegistered={isRegistered}
                blindLevel={blindLevel}
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
        </>
    );
}
