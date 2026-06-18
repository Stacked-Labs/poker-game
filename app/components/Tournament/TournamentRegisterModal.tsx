'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    Icon,
    IconButton,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import useToastHelper from '../../hooks/useToastHelper';
import { useRegisterForTournament } from '../../hooks/useRegisterForTournament';
import type { Tournament } from '../../hooks/server_actions';
import { formatUsdc } from '../PublicGames/tournamentFormat';
import { USDC_BLUE, USDC_LOGO } from '../PublicGames/types';

// SHA-256 of the access code, sent to the backend for server-side gating and,
// for crypto tournaments, to fetch the operator permit. The hook expects this
// hash, never the raw code — hashing here is what the old lobby modal missed.
async function hashPasswordCode(code: string): Promise<string> {
    const enc = new TextEncoder().encode(code);
    const digest = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

// ─── TxStep — reusable visual step indicator (crypto approve + register) ──────

type TxStepState = 'pending' | 'active' | 'done' | 'error';

function TxStep({
    stepNum,
    label,
    sublabel,
    state,
    isLast,
}: {
    stepNum: number;
    label: string;
    sublabel?: string;
    state: TxStepState;
    isLast: boolean;
}) {
    const pendingBg = useColorModeValue('gray.100', 'whiteAlpha.100');
    const pendingNumColor = useColorModeValue('gray.500', 'whiteAlpha.500');
    const lineColor = useColorModeValue('gray.200', 'whiteAlpha.200');
    const errorLabelColor = useColorModeValue('red.600', 'red.300');

    const circleBg =
        state === 'pending'
            ? pendingBg
            : state === 'error'
              ? 'red.500'
              : 'brand.green';

    const labelColor =
        state === 'pending'
            ? 'text.secondary'
            : state === 'error'
              ? errorLabelColor
              : 'text.primary';

    return (
        <HStack align="flex-start" spacing={3}>
            <VStack spacing={0} flexShrink={0} align="center" w="28px">
                <Flex
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg={circleBg}
                    align="center"
                    justify="center"
                    flexShrink={0}
                    transition="background 200ms ease"
                >
                    {state === 'active' ? (
                        <Spinner size="xs" color="white" speed="0.9s" />
                    ) : state === 'done' ? (
                        <Text fontSize="xs" color="white" fontWeight="bold" lineHeight={1}>
                            ✓
                        </Text>
                    ) : state === 'error' ? (
                        <Text fontSize="xs" color="white" fontWeight="bold" lineHeight={1}>
                            ✕
                        </Text>
                    ) : (
                        <Text fontSize="xs" color={pendingNumColor} fontWeight="semibold" lineHeight={1}>
                            {stepNum}
                        </Text>
                    )}
                </Flex>
                {!isLast && <Box w="2px" flex={1} minH="20px" bg={lineColor} mt="2px" />}
            </VStack>
            <VStack align="start" spacing={0.5} pb={isLast ? 0 : 5} pt="5px" minW={0}>
                <Text
                    fontSize="sm"
                    fontWeight={state === 'active' ? 'semibold' : 'normal'}
                    color={labelColor}
                    transition="color 200ms ease"
                >
                    {label}
                </Text>
                {sublabel && (
                    <Text fontSize="xs" color="text.secondary">
                        {sublabel}
                    </Text>
                )}
            </VStack>
        </HStack>
    );
}

// ─── USDC amount — coin logo + USDC-blue figure, used wherever we quote stakes ─

function UsdcAmount({
    usdc,
    caption,
    size = 'md',
}: {
    usdc: number;
    caption: string;
    size?: 'md' | 'lg';
}) {
    const big = size === 'lg';
    return (
        <HStack spacing={2} align="center">
            <Image
                src={USDC_LOGO}
                alt=""
                boxSize={big ? '26px' : '22px'}
                flexShrink={0}
            />
            <Text
                fontSize={big ? '2xl' : 'xl'}
                fontWeight="bold"
                color={USDC_BLUE}
                lineHeight={1}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
                ${formatUsdc(usdc, { decimals: 2 })}
            </Text>
            <Text fontSize="sm" fontWeight="semibold" color="text.muted">
                {caption}
            </Text>
        </HStack>
    );
}

// ─── Shared registration modal ───────────────────────────────────────────────
//
// One modal for every register/re-enter path: crypto (approve + on-chain
// register, with the two-step tx indicator) and Free Play (server register),
// public and password-gated. Owns the full flow via useRegisterForTournament;
// callers just provide the tournament and react to onSuccess. Replaces three
// older modals (lobby crypto, lobby free-play password, detail-page passcode).

interface TournamentRegisterModalProps {
    tournament: Tournament | null;
    isReentry?: boolean;
    onClose: () => void;
    onSuccess: (id: number, txHash?: string) => void;
}

export default function TournamentRegisterModal({
    tournament: t,
    isReentry = false,
    onClose,
    onSuccess,
}: TournamentRegisterModalProps) {
    const { register, reenter, status, error, isLoading, reset } =
        useRegisterForTournament(t ?? undefined);
    const toast = useToastHelper();
    const [passwordCode, setPasswordCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const lastProgressRef = useRef<'approving' | 'registering' | null>(null);

    const isCrypto = !!t?.contract_address;
    const isPrivate = !!t?.is_private;
    const passwordInputRef = useRef<HTMLInputElement>(null);
    // red.400 fails AA on the white card in light mode — use a mode-aware error
    // tone so a failed (real-money) registration is always legible.
    const errorFg = useColorModeValue('red.600', 'red.300');

    useEffect(() => {
        if (status === 'approving' || status === 'registering') {
            lastProgressRef.current = status;
        }
    }, [status]);

    // The caller keeps this component mounted (tournament=null when closed), so
    // reset to a clean form whenever it opens or switches tournament — otherwise
    // a prior 'success' status or typed password would leak into the next open.
    const tournamentId = t?.id ?? null;
    useEffect(() => {
        if (tournamentId == null) return;
        reset();
        setPasswordCode('');
        setShowPassword(false);
        lastProgressRef.current = null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tournamentId]);

    const handleClose = () => {
        reset();
        setPasswordCode('');
        setShowPassword(false);
        lastProgressRef.current = null;
        onClose();
    };

    const handleSubmit = async () => {
        if (!t) return;
        let hash: string | undefined;
        if (isPrivate) {
            const code = passwordCode.trim();
            if (!code) {
                toast.warning('Enter the tournament password');
                return;
            }
            // Always hash before handing to the chain/server — the bug in the
            // old lobby modal was passing the raw code here.
            hash = await hashPasswordCode(code);
        }
        const action = isReentry ? reenter : register;
        const { ok, txHash } = await action(hash);
        if (ok) {
            // The "You're in." confirmation (opened by the caller via onSuccess)
            // is the single success surface, so no toast here would double up.
            onSuccess(t.id, txHash);
        }
    };

    // The two-step tx indicator is a crypto-only affordance (approve + register).
    const showStepper = isCrypto && status !== 'idle';

    let step1State: TxStepState = 'pending';
    let step2State: TxStepState = 'pending';
    if (status === 'approving') {
        step1State = 'active';
    } else if (status === 'registering') {
        step1State = 'done';
        step2State = 'active';
    } else if (status === 'success') {
        step1State = 'done';
        step2State = 'done';
    } else if (status === 'error') {
        if (lastProgressRef.current === 'registering') {
            step1State = 'done';
            step2State = 'error';
        } else {
            step1State = 'error';
        }
    }

    const verb = isReentry ? 're-enter' : 'register';
    const title = isReentry ? 'Re-enter Tournament' : 'Register for Tournament';
    const cta =
        status === 'error'
            ? 'Retry'
            : isCrypto
              ? isReentry
                  ? 'Approve & Re-enter'
                  : 'Approve & Register'
              : isReentry
                ? 'Confirm Re-entry'
                : 'Confirm Registration';

    return (
        <Modal
            isOpen={!!t}
            onClose={handleClose}
            isCentered
            size="sm"
            initialFocusRef={passwordInputRef}
            closeOnOverlayClick={!isLoading}
            closeOnEsc={!isLoading}
        >
            <ModalOverlay bg="rgba(11, 20, 48, 0.6)" backdropFilter="blur(6px)" />
            <ModalContent
                bg="card.white"
                color="text.primary"
                borderRadius="16px"
                mx={4}
                boxShadow="card.lift"
            >
                <ModalHeader
                    fontSize="xl"
                    fontWeight={800}
                    letterSpacing="-0.02em"
                    color="text.primary"
                    pb={2}
                >
                    {title}
                </ModalHeader>
                <ModalCloseButton
                    color="text.secondary"
                    borderRadius="full"
                    isDisabled={isLoading}
                    _hover={{ bg: 'card.lightGray', color: 'text.primary' }}
                />
                <ModalBody pb={2}>
                    <VStack spacing={4} align="stretch">
                        {isPrivate && !showStepper && (
                            <FormControl>
                                <FormLabel
                                    color="text.secondary"
                                    fontWeight="semibold"
                                    fontSize="sm"
                                    mb={1.5}
                                >
                                    Tournament password
                                </FormLabel>
                                <InputGroup>
                                    <Input
                                        ref={passwordInputRef}
                                        variant="takeSeatModal"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter password"
                                        value={passwordCode}
                                        onChange={(e) =>
                                            setPasswordCode(e.target.value)
                                        }
                                        isDisabled={isLoading}
                                        pr="3.25rem"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSubmit();
                                        }}
                                    />
                                    <InputRightElement h="56px" w="3.25rem">
                                        <IconButton
                                            variant="tactileGhost"
                                            size="sm"
                                            color="text.muted"
                                            _hover={{ color: 'text.primary' }}
                                            aria-label={
                                                showPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                            icon={
                                                <Icon
                                                    as={
                                                        showPassword
                                                            ? FiEyeOff
                                                            : FiEye
                                                    }
                                                    boxSize={5}
                                                />
                                            }
                                            onClick={() =>
                                                setShowPassword((s) => !s)
                                            }
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                        )}

                        {!showStepper &&
                            (isCrypto ? (
                                <VStack align="stretch" spacing={1.5}>
                                    <UsdcAmount
                                        usdc={t?.buy_in_usdc ?? 0}
                                        caption={
                                            isReentry
                                                ? 'USDC re-entry'
                                                : 'USDC buy-in'
                                        }
                                    />
                                    <Text fontSize="xs" color="text.muted">
                                        Transferred on {verb}. Requires two wallet
                                        confirmations.
                                    </Text>
                                </VStack>
                            ) : (
                                <HStack spacing={2.5} align="center">
                                    <Box
                                        px={2.5}
                                        py={0.5}
                                        borderRadius="full"
                                        bg="brand.greenDark"
                                        flexShrink={0}
                                    >
                                        <Text
                                            fontSize="xs"
                                            fontWeight="bold"
                                            color="white"
                                            textTransform="uppercase"
                                            letterSpacing="0.04em"
                                            whiteSpace="nowrap"
                                        >
                                            Free Play
                                        </Text>
                                    </Box>
                                    <Text fontSize="sm" color="text.muted">
                                        Practice chips, no buy-in, no real value.
                                    </Text>
                                </HStack>
                            ))}

                        {showStepper && (
                            <VStack align="stretch" spacing={0} pt={1}>
                                <TxStep
                                    stepNum={1}
                                    label="Approve USDC spend"
                                    sublabel={
                                        step1State === 'active'
                                            ? 'Check your wallet…'
                                            : undefined
                                    }
                                    state={step1State}
                                    isLast={false}
                                />
                                <TxStep
                                    stepNum={2}
                                    label={
                                        isReentry
                                            ? 'Re-enter on-chain'
                                            : 'Register on-chain'
                                    }
                                    sublabel={
                                        step2State === 'active'
                                            ? 'Check your wallet…'
                                            : undefined
                                    }
                                    state={step2State}
                                    isLast={true}
                                />
                            </VStack>
                        )}

                        {error && (
                            <Text fontSize="xs" color={errorFg}>
                                {error}
                            </Text>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter pt={2}>
                    <VStack w="full" spacing={2.5}>
                        <Button
                            variant="tactilePrimary"
                            w="full"
                            minH="48px"
                            onClick={handleSubmit}
                            isLoading={isLoading}
                            loadingText={
                                status === 'approving'
                                    ? 'Approving…'
                                    : isReentry
                                      ? 'Re-entering…'
                                      : 'Registering…'
                            }
                        >
                            {cta}
                        </Button>
                        <Button
                            variant="tactileGhost"
                            w="full"
                            minH="44px"
                            isDisabled={isLoading}
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                    </VStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
