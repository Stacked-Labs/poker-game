import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    Box,
    Flex,
    Text,
    ResponsiveValue,
    HStack,
    Tag,
    IconButton,
} from '@chakra-ui/react';
import { FiSmile } from 'react-icons/fi';
import ConnectXPrompt from './ConnectXPrompt';
import SeatStatusChip, {
    SEAT_BADGE_STYLE,
    SEAT_BADGE_PORTRAIT_SX,
    SEAT_BADGE_TOP_OFFSET,
} from './SeatStatusChip';
import { getSeatStatus } from '@/app/lib/seatStatus';
import { keyframes } from '@emotion/react';
import {
    motion,
    animate,
    useAnimationControls,
    useReducedMotion,
    AnimatePresence,
} from 'framer-motion';
import PlayerAvatar from './PlayerAvatar';
import { Card, DisplayMode, Player } from '../interfaces';
import { AppContext } from '../contexts/AppStoreProvider';
import { SocketContext } from '../contexts/WebSocketProvider';
import { useSound } from '../contexts/SoundProvider';
import CardComponent from './Card';
import { currentHandLabel } from '@/app/lib/poker/pokerHandEval';
import { sendMessage } from '@/app/hooks/server_actions';
import {
    handleReturnReady,
    handleCancelRejoin,
} from '@/app/hooks/useTableOptions';
import useToastHelper from '@/app/hooks/useToastHelper';
import type { Emote } from '@/app/stores/emotes';
import { useSeatReactionsStore } from '@/app/stores/seatReactions';
import { useRabbitHuntStore } from '@/app/stores/rabbitHunt';
import { buildSeatReactionMessage } from '@/app/utils/seatReaction';
import EmotePicker from './NavBar/Chat/EmotePicker';
import { useFormatAmount } from '@/app/hooks/useFormatAmount';
import {
    ACTION_LABEL_DURATION_MS,
    actionLabelColor,
    actionLabelText,
    usePlayerActionLabelStore,
} from '@/app/stores/playerActionLabel';
import { useAuth } from '@/app/contexts/AuthContext';
import { refreshXIdentity } from '@/app/hooks/server_actions';

const offlinePulse = keyframes`
  0%, 100% {
    opacity: 0.75;
  }
  50% {
    opacity: 0.85;
  }
`;

const bubbleFadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const StackValue = React.memo(function StackValue({
    value,
    color,
    fontSize,
    formatValue,
}: {
    value: number;
    color: string;
    fontSize: ResponsiveValue<string>;
    formatValue?: (n: number) => string;
}) {
    const prefersReducedMotion = useReducedMotion();
    const animationControls = useAnimationControls();
    const previousValueRef = useRef<number>(value);
    const [displayValue, setDisplayValue] = useState<number>(value);

    useEffect(() => {
        animationControls.set({ y: 0, opacity: 1 });
    }, [animationControls]);

    useEffect(() => {
        if (prefersReducedMotion) {
            setDisplayValue(value);
            previousValueRef.current = value;
            return;
        }

        const fromValue = previousValueRef.current;
        if (fromValue === value) {
            return;
        }
        previousValueRef.current = value;
        const direction = value >= fromValue ? 1 : -1;

        const controls = animate(fromValue, value, {
            duration: 0.4,
            ease: 'easeOut',
            onUpdate: (latest) => {
                setDisplayValue(Math.round(latest));
            },
        });

        animationControls.start({
            y: [direction * 6, 0],
            opacity: [0.5, 1],
            transition: { duration: 0.35, ease: 'easeOut' },
        });

        return () => {
            controls.stop();
        };
    }, [value, prefersReducedMotion, animationControls]);

    const formattedValue = useMemo(
        () =>
            Number.isFinite(displayValue)
                ? formatValue
                    ? formatValue(displayValue)
                    : displayValue.toLocaleString('en-US')
                : '0',
        [displayValue, formatValue]
    );

    return (
        <Text
            variant="seatText"
            fontSize={fontSize}
            fontWeight="bold"
            lineHeight={1}
            color={color}
            minWidth="fit-content"
        >
            <motion.span
                style={{ display: 'inline-block', willChange: 'transform' }}
                animate={animationControls}
                initial={false}
            >
                {formattedValue}
            </motion.span>
        </Text>
    );
});

const chipPositionStyles: { [key: number]: object } = {
    1: {
        justifyContent: 'center',
        '@media (orientation: portrait)': {
            top: '-30%',
        },
        '@media (orientation: landscape)': {
            top: '-25%',
        },
    },
    2: {
        justifyContent: 'center',
        '@media (orientation: portrait)': {
            top: '15%',
            right: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            top: '-25%',
            right: 0,
            flexDirection: 'row',
        },
    },
    3: {
        '@media (orientation: portrait)': {
            top: '15%',
            right: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            bottom: '23%',
            right: '-110%',
            flexDirection: 'row',
        },
    },
    4: {
        '@media (orientation: portrait)': {
            bottom: '20%',
            right: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            top: '30%',
            right: '-110%',
            flexDirection: 'row',
        },
    },
    5: {
        justifyContent: 'center',
        alignItems: 'start',
        '@media (orientation: portrait)': {
            bottom: '20%',
            right: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            bottom: '-30%',
            right: 0,
            flexDirection: 'row',
        },
    },
    6: {
        justifyContent: 'center',
        flexDirection: 'row',
        '@media (orientation: portrait)': {
            bottom: '-30%',
            right: 0,
        },
        '@media (orientation: landscape)': {
            bottom: '-30%',
            right: 0,
        },
    },
    7: {
        justifyContent: 'center',
        alignItems: 'end',
        '@media (orientation: portrait)': {
            bottom: '20%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            bottom: '-30%',
            left: 0,
            flexDirection: 'row',
        },
    },
    8: {
        alignItems: 'end',
        '@media (orientation: portrait)': {
            bottom: '20%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            top: '30%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
    },
    9: {
        alignItems: 'end',
        '@media (orientation: portrait)': {
            top: '15%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            bottom: '23%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
    },
    10: {
        justifyContent: 'center',
        alignItems: 'end',
        '@media (orientation: portrait)': {
            top: '15%',
            left: '-110%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        '@media (orientation: landscape)': {
            top: '-25%',
            left: '0%',
            flexDirection: 'row',
        },
    },
};

const defaultPositionStyles = {
    top: '100%',
    flexDirection: 'row',
};

const timerColorMap: Record<'green' | 'yellow' | 'red' | 'gray', string> = {
    red: '#FF2D6F',
    yellow: 'brand.yellow',
    green: '#3FBD8A',
    gray: 'gray.400',
};

/**
 * Distinct color for the refillable time-bank reserve of the action ring. Violet
 * reads as "reserve / bonus time" — clearly separate from the green→yellow→red
 * standard-clock urgency colors, so the bank segment never looks like a base state.
 */
const TIME_BANK_COLOR = '#A78BFA';

// ── Card V-shape layout tuning ──
const CARD_FAN_ANGLE = 4; // degrees each card rotates outward (try 5–15)
const CARD_FAN_SPREAD = 0; // px horizontal offset from center (try 0–8)
const CARD_FAN_OVERLAP = -20; // % negative margin to overlap cards (try -15 to 0)

const TakenSeatButton = ({
    player,
    visualSeatId,
    isCurrentTurn,
    isWinner,
    isRevealed: _isRevealed,
    winnings,
    activePotIndex,
    equity,
}: {
    player: Player;
    visualSeatId?: number;
    isCurrentTurn: boolean;
    isWinner: boolean;
    isRevealed: boolean;
    winnings: number;
    activePotIndex: number | null;
    equity: number | null;
}) => {
    const { appState, dispatch } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const { play, stop } = useSound();
    const { format, mode: displayMode } = useFormatAmount();

    const isCrypto = appState.game?.config?.crypto === true;
    const cycleDisplayMode = useCallback(() => {
        const order: DisplayMode[] = isCrypto
            ? ['chips', 'bb', 'usdc']
            : ['chips', 'bb'];
        const idx = order.indexOf(displayMode);
        const next = order[(idx === -1 ? 0 : idx + 1) % order.length];
        dispatch({ type: 'setDisplayMode', payload: next });
    }, [dispatch, displayMode, isCrypto]);
    const { isAuthenticated, xUsername, refreshXStatus } = useAuth();
    const { info: toastInfo } = useToastHelper();
    const playCardFlip = useCallback(() => play('card_flip'), [play]);
    const isSelf = appState.clientID
        ? player.uuid === appState.clientID
        : false;
    const prefersReducedMotion = useReducedMotion();
    const seatReaction = useSeatReactionsStore(
        (state) => state.reactionsByTarget[player.uuid]
    );

    // Offline status - default to true if undefined (backwards compatibility)
    const isOffline = player.isOnline === false;
    const seatStatus = getSeatStatus(player);
    const seatId = visualSeatId ?? player?.seatID ?? 4;

    const chipPositionSx = chipPositionStyles[seatId] || defaultPositionStyles;

    // Countdown timer logic
    const deadline = appState.game?.actionDeadline ?? 0;
    const [remaining, setRemaining] = useState<number>(0);
    const [initialDuration, setInitialDuration] = useState<number>(0); // ms
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const tickTockPlayedForDeadlineRef = useRef<number | null>(null);
    const tickTockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );

    const actionIndex = appState.game?.action;


    // Transient action label that briefly replaces the username (e.g. RAISE).
    const actionLabel = usePlayerActionLabelStore(
        (s) => s.labels[player.uuid]
    );
    const clearActionLabel = usePlayerActionLabelStore((s) => s.clear);
    useEffect(() => {
        if (!actionLabel) return;
        const { nonce } = actionLabel;
        const timeout = setTimeout(() => {
            clearActionLabel(player.uuid, nonce);
        }, ACTION_LABEL_DURATION_MS);
        return () => clearTimeout(timeout);
    }, [actionLabel, clearActionLabel, player.uuid]);

    useEffect(() => {
        // Stop any timer if this seat is not the current turn
        if (!isCurrentTurn) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setRemaining(0);
            tickTockPlayedForDeadlineRef.current = null;
            if (tickTockTimeoutRef.current) {
                clearTimeout(tickTockTimeoutRef.current);
                tickTockTimeoutRef.current = null;
            }
            return;
        }

        // For the active player, (re)start the timer whenever deadline changes
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!deadline || deadline === 0) {
            setRemaining(0);
            tickTockPlayedForDeadlineRef.current = null;
            if (tickTockTimeoutRef.current) {
                clearTimeout(tickTockTimeoutRef.current);
                tickTockTimeoutRef.current = null;
            }
            return;
        }

        const calcAndSet = () => {
            const diff = Math.max(deadline - Date.now(), 0);
            setRemaining(diff);
        };

        const initial = Math.max(deadline - Date.now(), 0);
        setInitialDuration(initial);

        calcAndSet();
        intervalRef.current = setInterval(calcAndSet, 250);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [deadline, actionIndex, isCurrentTurn, seatId]);

    useEffect(() => {
        if (tickTockTimeoutRef.current) {
            clearTimeout(tickTockTimeoutRef.current);
            tickTockTimeoutRef.current = null;
        }

        if (!isSelf || !isCurrentTurn || !deadline) return;

        const alreadyPlayedForThisDeadline =
            tickTockPlayedForDeadlineRef.current === deadline;

        if (alreadyPlayedForThisDeadline) return;

        const now = Date.now();
        if (deadline <= now) return;

        const msUntilPlay = Math.max(deadline - now - 5000, 0);
        tickTockTimeoutRef.current = setTimeout(() => {
            tickTockPlayedForDeadlineRef.current = deadline;
            play('tick_tock');
        }, msUntilPlay);

        return () => {
            if (tickTockTimeoutRef.current) {
                clearTimeout(tickTockTimeoutRef.current);
                tickTockTimeoutRef.current = null;
            }
            stop('tick_tock');
        };
    }, [deadline, isCurrentTurn, isSelf, play, stop]);

    const total = initialDuration || 1; // avoid divide by zero
    const progress = Math.min((remaining / total) * 100, 100);
    const timerAngle = progress * 3.6; // 0-100% → 0-360deg

    // Time-bank two-segment split. The actor's window is `base + bank`. STANDARD
    // (base) time is spent FIRST — the backend only charges the bank for elapsed
    // beyond base (deadline = base + bank), so the standard segment depletes before
    // the bank reserve and the ring counts down continuously from the full window.
    // When the feature is off / no config, baseMs is the whole window so the ring
    // collapses to a single standard segment with the legacy thresholds.
    const configBaseMs = appState.game?.config?.baseActionMs ?? 0;
    const baseMs = configBaseMs > 0 ? Math.min(configBaseMs, total) : total;
    const bankMs = Math.max(0, total - baseMs);
    const hasBankSegment = bankMs > 0;
    const bankRemaining = Math.min(remaining, bankMs); // reserve still held
    const standardRemaining = Math.max(0, remaining - bankMs); // standard clock left
    const onBankReserve = hasBankSegment && standardRemaining <= 0; // standard spent

    // Urgency tracks the STANDARD clock (green → yellow → red as the free time runs
    // out). Once the player is on the bank reserve the ring switches to the time-bank
    // color regardless of how much reserve remains.
    const standardScheme: 'green' | 'yellow' | 'red' | 'gray' = isCurrentTurn
        ? standardRemaining <= 5000
            ? 'red'
            : standardRemaining <= 10000
              ? 'yellow'
              : 'green'
        : 'gray';
    const standardColor = timerColorMap[standardScheme] || 'brand.navy';

    // Border / seat highlight: violet while on the bank reserve, else standard urgency.
    const timerColor = onBankReserve ? TIME_BANK_COLOR : standardColor;

    // Bank arc sits nearest the top (depletes LAST); the standard arc is the tail
    // (depletes FIRST). bankAngle stays constant until the standard clock is spent.
    const bankAngle = Math.min((bankRemaining / total) * 360, 360);

    // Single countdown from the TOTAL window (base + bank); no "+Ns" overlay.
    const timerSeconds = Math.ceil(remaining / 1000);
    const timerLabel = `${timerSeconds}`;
    const timerTextColor = onBankReserve ? TIME_BANK_COLOR : 'whiteAlpha.900';

    const pots = appState.game?.pots ?? [];
    const resolvedPot =
        typeof activePotIndex === 'number' &&
        activePotIndex >= 0 &&
        activePotIndex < pots.length
            ? pots[activePotIndex]
            : pots.find((pot) =>
                  pot.winners?.some((w) => (w.winningHand?.length ?? 0) > 0)
              );
    const playerWinsActivePot = resolvedPot
        ? Boolean(resolvedPot.winningPlayerNums?.includes(player.position))
        : isWinner;
    const winningSet = new Set<number>();
    if (playerWinsActivePot) {
        const winner = resolvedPot?.winners?.find(
            (w) => w.playerNum === player.position
        );
        (winner?.winningHand ?? []).forEach((card) => {
            winningSet.add(Number(card));
        });
    }
    const hasWinningComboForPlayer = winningSet.size > 0;
    const showWinnerHighlight =
        activePotIndex === null ? isWinner : playerWinsActivePot;
    const isSelfAway = isSelf && player.stack > 0 && !player.ready;
    const highlightVariant = isCurrentTurn
        ? 'active'
        : showWinnerHighlight
          ? 'winner'
          : isSelfAway
            ? 'selfAway'
            : null;
    const highlightBorderColor =
        highlightVariant === 'active'
            ? timerColor
            : highlightVariant === 'winner'
              ? 'brand.yellow'
              : highlightVariant === 'selfAway'
                ? 'brand.green'
                : 'brand.darkNavy';
    const emoteIconColor =
        isCurrentTurn || showWinnerHighlight ? 'gray.400' : 'whiteAlpha.600';
    const emoteIconHoverBg =
        isCurrentTurn || showWinnerHighlight
            ? 'blackAlpha.50'
            : 'whiteAlpha.100';
    const emoteIconActiveBg =
        isCurrentTurn || showWinnerHighlight
            ? 'blackAlpha.100'
            : 'whiteAlpha.200';
    const canSendSeatReaction =
        Boolean(socket) &&
        socket?.readyState === WebSocket.OPEN &&
        Boolean(appState.username || appState.clientID);
    const handleSelectSeatEmote = useCallback(
        (emote: Emote) => {
            if (!socket || socket.readyState !== WebSocket.OPEN) return;
            if (!player.uuid) return;

            const payload = buildSeatReactionMessage({
                targetUuid: player.uuid,
                emoteId: emote.id,
                emoteName: emote.name,
                senderUuid: appState.clientID,
                nonce: `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,
                ts: Date.now(),
            });

            sendMessage(socket, payload);
        },
        [appState.clientID, player.uuid, socket]
    );

    const handleConnectX = useCallback(() => {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        let handled = false;
        const width = 500;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
            `${backendUrl}/auth/x`,
            'x_oauth',
            `width=${width},height=${height},left=${left},top=${top},popup=yes`
        );
        const onComplete = () => {
            if (handled) return;
            handled = true;
            refreshXStatus().then(() => {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    refreshXIdentity(socket);
                }
            });
        };
        const handler = (event: MessageEvent) => {
            if (event.data?.type !== 'x_oauth_result') return;
            window.removeEventListener('message', handler);
            if (event.data.status === 'success') {
                onComplete();
            }
        };
        window.addEventListener('message', handler);
        const pollClosed = setInterval(() => {
            if (popup && popup.closed) {
                clearInterval(pollClosed);
                window.removeEventListener('message', handler);
                onComplete();
            }
        }, 500);
    }, [refreshXStatus, socket]);

    const canShowXPrompt = isSelf && isAuthenticated && !xUsername && !player.profileImageUrl;

    // Hover card: auto-reveal on mount, hover re-triggers, dismissible up to 3x (localStorage).
    const [isAvatarHovered, setIsAvatarHovered] = useState(false);
    const [autoRevealActive, setAutoRevealActive] = useState(false);
    const [xPromptDismissed, setXPromptDismissed] = useState(false);

    // Read dismissal count once on mount. >=3 dismissals → never show again.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const raw = window.localStorage.getItem('stacked_x_prompt_dismissed');
        const count = raw ? parseInt(raw, 10) : 0;
        if (Number.isFinite(count) && count >= 3) {
            setXPromptDismissed(true);
        }
    }, []);

    // Flip autoRevealActive false → true after mount so AnimatePresence sees the
    // child transition from absent → present and plays its enter animation.
    useEffect(() => {
        if (!canShowXPrompt || xPromptDismissed) return;
        const showTimer = setTimeout(() => setAutoRevealActive(true), 350);
        return () => clearTimeout(showTimer);
    }, [canShowXPrompt, xPromptDismissed]);

    // Auto-hide after ~8s of visibility.
    useEffect(() => {
        if (!autoRevealActive) return;
        const hideTimer = setTimeout(() => setAutoRevealActive(false), 8000);
        return () => clearTimeout(hideTimer);
    }, [autoRevealActive]);

    const handleDismissXPrompt = useCallback(() => {
        if (typeof window === 'undefined') return;
        const raw = localStorage.getItem('stacked_x_prompt_dismissed');
        const count = raw ? parseInt(raw, 10) : 0;
        const next = (Number.isFinite(count) ? count : 0) + 1;
        localStorage.setItem('stacked_x_prompt_dismissed', String(next));
        setAutoRevealActive(false);
        setIsAvatarHovered(false);
        if (next >= 3) setXPromptDismissed(true);
    }, []);

    const showXHoverCard =
        canShowXPrompt && !xPromptDismissed && (isAvatarHovered || autoRevealActive);

    const stackColor =
        showWinnerHighlight && winnings > 0
            ? 'brand.green'
            : isCurrentTurn
              ? 'brand.darkNavy'
              : 'white';

    const rabbitRevealed = useRabbitHuntStore((s) => s.revealed);

    // When rabbit cards exist, the label is suppressed for every seat until
    // the local user reveals them — then the rabbit cards augment the board.
    const strengthLabel: string | null = useMemo(() => {
        const game = appState.game;
        if (!game) return null;

        const hasRabbit = (game.rabbitCards || []).length > 0;
        if (hasRabbit && !rabbitRevealed) return null;

        const community = (game.communityCards || [])
            .map((c) => Number(c))
            .filter((c) => c > 0);
        const rabbit = hasRabbit
            ? (game.rabbitCards || [])
                  .map((c) => Number(c))
                  .filter((c) => c > 0)
            : [];
        const board = [...community, ...rabbit];
        const hole = (player.cards || [])
            .map((c) => Number(c))
            .filter((c) => c > 0);

        const boardHasFlop = board.length >= 3;
        if (!boardHasFlop) return null;

        const bothHoleVisible = hole.length >= 2 && hole[0] > 0 && hole[1] > 0;
        if (!bothHoleVisible) return null;

        const label = currentHandLabel(hole as number[], board as number[]);
        return label ?? null;
    }, [appState.game, player.cards, rabbitRevealed]);

    if (!appState.game) {
        return null;
    }

    const showDealerBadge =
        appState.game.running && appState.game.dealer == player.position;
    const showCheckBubble =
        appState.game.running && player.called && player.bet === 0;
    const showBetBubble = player.bet !== 0;
    const showActionBubble = showCheckBubble || showBetBubble;
    const dealerBadgeBoxSize = { base: 4, md: 6, lg: 6, xl: 6, '2xl': 8 };
    const actionBubbleSlotWidth = {
        base: '56px',
        md: '72px',
        lg: '76px',
        xl: '76px',
        '2xl': '92px',
    };
    const reverseDealerGroupInPortrait =
        seatId === 7 || seatId === 8 || seatId === 9 || seatId === 10;
    const reverseDealerGroupInLandscape = seatId === 8 || seatId === 9;

    return (
        <Flex
            data-testid={`taken-seat-${player.seatID}`}
            className={`taken-seat-button ${isOffline ? 'offline' : ''}`}
            width={'100%'}
            height={'100%'}
            minWidth={0}
            sx={{
                '@media (orientation: portrait)': {
                    width: '90%',
                },
            }}
            position={'relative'}
            alignItems={'center'}
            justifyContent={'center'}
        >
            {/* Away badge moved into player info container below */}
            <Flex
                className="chip-position-container"
                position={'absolute'}
                key="betbox"
                width={'100%'}
                gap={2}
                alignItems="center"
                sx={chipPositionSx}
                zIndex={5}
            >
                {showDealerBadge ? (
                    <Flex
                        width="fit-content"
                        alignItems="center"
                        gap={1}
                        pointerEvents="none"
                        sx={{
                            '@media (orientation: portrait)': {
                                flexDirection: reverseDealerGroupInPortrait
                                    ? 'row-reverse'
                                    : 'row',
                            },
                            '@media (orientation: landscape)': {
                                flexDirection: reverseDealerGroupInLandscape
                                    ? 'row-reverse'
                                    : 'row',
                            },
                        }}
                    >
                        <Text
                            fontWeight="bold"
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="full"
                            bg="brand.lightGray"
                            color="brand.navy"
                            width={dealerBadgeBoxSize}
                            height={dealerBadgeBoxSize}
                            variant={'seatText'}
                            zIndex={3}
                            boxShadow="0 3px 0 #9ca3c2"
                            flexShrink={0}
                        >
                            D
                        </Text>
                        <Flex
                            width={actionBubbleSlotWidth}
                            justifyContent="flex-start"
                            pointerEvents="none"
                            sx={{
                                '@media (orientation: portrait)': {
                                    justifyContent: reverseDealerGroupInPortrait
                                        ? 'flex-end'
                                        : 'flex-start',
                                },
                                '@media (orientation: landscape)': {
                                    justifyContent:
                                        reverseDealerGroupInLandscape
                                            ? 'flex-end'
                                            : 'flex-start',
                                },
                            }}
                        >
                            <Text
                                borderRadius="1.5rem"
                                px={{ base: 2, md: 3 }}
                                py={0}
                                width="fit-content"
                                maxWidth="100%"
                                bg={
                                    showBetBubble
                                        ? 'brand.yellow'
                                        : 'rgba(255,255,255,0.2)'
                                }
                                fontWeight="bold"
                                color={showBetBubble ? 'brand.navy' : 'white'}
                                display="inline-flex"
                                alignItems="center"
                                justifyContent="center"
                                variant={'seatText'}
                                fontSize={{
                                    base: '10px',
                                    sm: '10px',
                                    md: '14px',
                                }}
                                zIndex={3}
                                border={
                                    showBetBubble
                                        ? 'none'
                                        : '1px solid rgba(255,255,255,0.3)'
                                }
                                boxShadow={
                                    showBetBubble
                                        ? '0 3px 0 #c99500'
                                        : 'none'
                                }
                                animation={
                                    showActionBubble
                                        ? `${bubbleFadeIn} 0.25s ease-out`
                                        : undefined
                                }
                                visibility={
                                    showActionBubble ? 'visible' : 'hidden'
                                }
                                noOfLines={1}
                            >
                                {showBetBubble ? format(player.bet) : 'Check'}
                            </Text>
                        </Flex>
                    </Flex>
                ) : null}
                {/* Check bubble - shows when player has called with no bet (checked) */}
                {!showDealerBadge && showCheckBubble && (
                    <Text
                        borderRadius="1.5rem"
                        px={{ base: 2, md: 3 }}
                        py={0}
                        w={'fit-content'}
                        bg="rgba(255,255,255,0.2)"
                        fontWeight="bold"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        variant={'seatText'}
                        fontSize={{ base: '10px', sm: '10px', md: '14px' }}
                        zIndex={3}
                        border="1px solid rgba(255,255,255,0.3)"
                        animation={`${bubbleFadeIn} 0.25s ease-out`}
                    >
                        Check
                    </Text>
                )}
                {/* Bet amount - shows when player has bet (replaces Check if they bet later) */}
                {!showDealerBadge && showBetBubble && (
                    <Text
                        borderRadius="1.5rem"
                        px={{ base: 2, md: 3 }}
                        py={0}
                        w={'fit-content'}
                        bg="brand.yellow"
                        fontWeight="bold"
                        color="brand.navy"
                        display="inline-flex"
                        alignItems="center"
                        justifyContent="center"
                        variant={'seatText'}
                        fontSize={{ base: '10px', sm: '10px', md: '14px' }}
                        zIndex={3}
                        boxShadow="0 3px 0 #c99500"
                        animation={`${bubbleFadeIn} 0.25s ease-out`}
                    >
                        {format(player.bet)}
                    </Text>
                )}
            </Flex>
            <Flex
                className="seat-core"
                width="100%"
                height="100%"
                minWidth={0}
                position="relative"
                alignItems="center"
                justifyContent="center"
                zIndex={1}
                sx={{
                    ...(isOffline && {
                        filter: 'grayscale(100%)',
                        animation: prefersReducedMotion
                            ? 'none'
                            : `${offlinePulse} 3s ease-in-out infinite`,
                    }),
                }}
            >
                <Flex
                    data-testid={`player-hole-cards-${player.seatID}`}
                    className="player-cards-container"
                    position={'absolute'}
                    justifyContent={'center'}
                    width={'100%'}
                    height={'100%'}
                    gap={0}
                    left="50%"
                    transform="translateX(-50%)"
                    marginTop={{ base: 0, md: '12px' }}
                >
                    <AnimatePresence mode="wait">
                        {(() => {
                            // Determine if this is the current user's cards (needed for render condition)
                            const isSelfPlayer = appState.clientID
                                ? player.uuid === appState.clientID
                                : false;

                            const game = appState.game;

                            // Determine if we are in showdown/reveal window state (hand ended, before next hand starts)
                            const isShowdown = Boolean(
                                game &&
                                    game.stage === 1 &&
                                    !game.betting &&
                                    (game.actionDeadline ?? 0) === 0 &&
                                    ((game.pots?.length || 0) > 0 ||
                                        (game.communityCards || []).some(
                                            (card) => Number(card) > 0
                                        ))
                            );

                            // Check if player has real (revealed) cards - not [0,0] or [-1,-1]
                            const hasRevealedCards =
                                Number(player.cards[0]) > 0 &&
                                Number(player.cards[1]) > 0;

                            // Only render cards if:
                            // - Player is still in hand, OR
                            // - It's the current user AND they have actual cards (so they can see their folded cards dimmed, but not after board clear), OR
                            // - It's showdown AND player has revealed cards (backend sends real values for showdown participants), OR
                            // - This player is the winner (so their cards remain visible even if they win by fold)
                            const shouldRenderCards =
                                appState.game.running &&
                                Number(player.cards[0]) !== -1 &&
                                (player.in ||
                                    (isSelfPlayer && hasRevealedCards) ||
                                    (isShowdown && hasRevealedCards) ||
                                    showWinnerHighlight);

                            if (!shouldRenderCards) return null;

                            return player.cards.map(
                                (card: Card, index: number) => {
                                    const isCardWinning = winningSet.has(
                                        Number(card)
                                    );

                                    // Dimming rules:
                                    // - During showdown: winners dim ONLY non-winning cards; losers dim all cards
                                    // - Otherwise: dim players who folded / are not in hand, but NEVER dim the overall winner highlight
                                    const dimThisCard = isShowdown
                                        ? playerWinsActivePot
                                            ? hasWinningComboForPlayer
                                                ? !isCardWinning
                                                : false
                                            : true
                                        : !player.in && !showWinnerHighlight;

                                    // Folded visual (for non-showdown states) still uses folded prop,
                                    // but do not treat winner's cards as folded (they should remain visible)
                                    const foldedVisual =
                                        !isShowdown &&
                                        !player.in &&
                                        !showWinnerHighlight;

                                    // Skip flip animation for enemy players only when NOT in showdown
                                    // During showdown, allow flip animation so opponent cards reveal smoothly
                                    const skipAnimation =
                                        !isSelfPlayer && !isShowdown;

                                    const isLeft = index === 0;
                                    const rotation = isLeft
                                        ? -CARD_FAN_ANGLE
                                        : CARD_FAN_ANGLE;
                                    const fanX = isLeft
                                        ? -CARD_FAN_SPREAD
                                        : CARD_FAN_SPREAD;

                                    return (
                                        <motion.div
                                            key={`${player.seatID}-card-${index}`}
                                            data-testid={`card-${player.seatID}-${index}`}
                                            data-face={
                                                isSelfPlayer ? 'up' : 'down'
                                            }
                                            className={`player-card seat-${player.seatID}-card-${index}`}
                                            initial={{
                                                opacity: 1,
                                                scale: 1,
                                                rotate: rotation,
                                                x: fanX,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                rotate: rotation,
                                                x: fanX,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                scale: 0.9,
                                                y: 20,
                                                transition: {
                                                    duration: 0.5,
                                                    ease: 'easeOut',
                                                },
                                            }}
                                            style={{
                                                width: '48%',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                justifyContent: 'flex-start',
                                                padding: 0,
                                                margin: 0,
                                                marginLeft:
                                                    index === 0
                                                        ? 0
                                                        : `${CARD_FAN_OVERLAP}%`,
                                                transformOrigin:
                                                    'bottom center',
                                            }}
                                        >
                                            <CardComponent
                                                card={card}
                                                placeholder={false}
                                                folded={foldedVisual}
                                                highlighted={isCardWinning}
                                                dimmed={dimThisCard}
                                                skipAnimation={skipAnimation}
                                                onFlipStart={playCardFlip}
                                            />
                                        </motion.div>
                                    );
                                }
                            );
                        })()}
                    </AnimatePresence>
                    {equity !== null && (
                        <Box
                            className="equity-badge"
                            position="absolute"
                            top="-6px"
                            right="-8px"
                            bg={
                                equity > 50
                                    ? '#1B7A4E'
                                    : equity >= 30
                                      ? 'gray.500'
                                      : 'red.500'
                            }
                            color="white"
                            fontSize={{ base: '9px', md: '13px' }}
                            px={{ base: '4px', md: '7px' }}
                            py={{ base: '2px', md: '4px' }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            lineHeight={1}
                            whiteSpace="nowrap"
                            pointerEvents="none"
                            zIndex={5}
                            fontWeight="bold"
                            borderRadius="full"
                            boxShadow="inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 6px rgba(0,0,0,0.4)"
                            sx={{
                                '@media (orientation: portrait)': {
                                    fontSize: '12px',
                                    px: '6px',
                                    py: '3px',
                                    top: '-7px',
                                    right: '-8px',
                                },
                            }}
                        >
                            {equity}%
                        </Box>
                    )}
                </Flex>
                <Box
                    className="player-info-wrapper"
                    position={'relative'}
                    width={'110%'}
                    minWidth={0}
                    maxWidth={'110%'}
                    zIndex={showXHoverCard ? 7 : 1}
                    alignSelf={'flex-end'}
                    overflow="visible"
                >
                    {/* Clockwise fuse timer — thick border that depletes clockwise from top-center */}
                    {isCurrentTurn && deadline > 0 && remaining > 0 && (
                        <>
                            {/* Track (dim background ring, always visible during turn) */}
                            <Box
                                className="player-timer-track"
                                position="absolute"
                                top="-4px"
                                left="-4px"
                                right="-4px"
                                bottom="-4px"
                                borderRadius="8px"
                                border="4px solid"
                                borderColor="whiteAlpha.200"
                                pointerEvents="none"
                                zIndex={2}
                            />
                            {/* Bank reserve (violet — the extra time beyond the standard
                                clock; the arc nearest the top, which depletes LAST because
                                standard time is spent first). */}
                            {hasBankSegment && (
                                <Box
                                    className="player-timer-fill-bank"
                                    position="absolute"
                                    top="-4px"
                                    left="-4px"
                                    right="-4px"
                                    bottom="-4px"
                                    borderRadius="8px"
                                    border="4px solid"
                                    borderColor={TIME_BANK_COLOR}
                                    pointerEvents="none"
                                    zIndex={2}
                                    sx={{
                                        maskImage: `conic-gradient(from 0deg, transparent ${360 - bankAngle}deg, #000 ${360 - bankAngle}deg)`,
                                        WebkitMaskImage: `conic-gradient(from 0deg, transparent ${360 - bankAngle}deg, #000 ${360 - bankAngle}deg)`,
                                    }}
                                    transition="border-color 0.5s ease-in-out"
                                />
                            )}
                            {/* Standard clock (green→yellow→red by standard time left — the
                                tail of the arc, which depletes FIRST; masked to the band
                                between the full remaining arc and the bank reserve. With no
                                bank configured this is the whole ring). */}
                            <Box
                                className="player-timer-fill"
                                position="absolute"
                                top="-4px"
                                left="-4px"
                                right="-4px"
                                bottom="-4px"
                                borderRadius="8px"
                                border="4px solid"
                                borderColor={standardColor}
                                pointerEvents="none"
                                zIndex={2}
                                sx={{
                                    maskImage: `conic-gradient(from 0deg, transparent ${360 - timerAngle}deg, #000 ${360 - timerAngle}deg, #000 ${360 - bankAngle}deg, transparent ${360 - bankAngle}deg)`,
                                    WebkitMaskImage: `conic-gradient(from 0deg, transparent ${360 - timerAngle}deg, #000 ${360 - timerAngle}deg, #000 ${360 - bankAngle}deg, transparent ${360 - bankAngle}deg)`,
                                }}
                                transition="border-color 0.5s ease-in-out"
                            />
                        </>
                    )}
                    <Flex
                        className="player-info-container"
                        direction={'column'}
                        bg={
                            isCurrentTurn || showWinnerHighlight
                                ? 'white'
                                : 'brand.darkNavy'
                        }
                        borderRadius={4}
                        width={'100%'}
                        minWidth={0}
                        maxWidth={'100%'}
                        paddingX={0}
                        paddingTop={{ base: 0.5, md: 1 }}
                        paddingBottom={{ base: 0.5, md: 1 }}
                        justifySelf={'flex-end'}
                        justifyContent={'center'}
                        alignItems={'flex-start'}
                        transition={'all 0.5s ease-in-out'}
                        position={'relative'}
                        cursor={isSelfAway ? 'pointer' : undefined}
                        onClick={
                            isSelfAway
                                ? () => {
                                      if (player.readyNextHand) {
                                          handleCancelRejoin(socket, toastInfo);
                                      } else {
                                          handleReturnReady(socket, toastInfo);
                                      }
                                  }
                                : undefined
                        }
                        aria-label={isSelfAway ? (player.readyNextHand ? 'Cancel rejoin' : 'Tap to rejoin') : undefined}
                        role={isSelfAway ? 'button' : undefined}
                        sx={{
                            '@media (orientation: portrait)': {
                                paddingTop: 0.5,
                                paddingBottom: 0.5,
                            },
                        }}
                        border="2px solid"
                        borderColor={
                            highlightVariant === 'active'
                                ? 'transparent'
                                : highlightVariant
                                  ? highlightBorderColor
                                  : showWinnerHighlight
                                    ? 'brand.yellow'
                                    : 'brand.darkNavy'
                        }
                    >
                        <SeatStatusChip
                            kind={seatStatus.kind}
                            iconOnly={isSelf || !!strengthLabel}
                        />
                        {strengthLabel && (
                            <Tag
                                {...SEAT_BADGE_STYLE}
                                position="absolute"
                                top={SEAT_BADGE_TOP_OFFSET}
                                left={'50%'}
                                transform={'translateX(-50%)'}
                                bg="brand.green"
                                color="white"
                                variant="solid"
                                borderColor="brand.greenDark"
                                whiteSpace="nowrap"
                                pointerEvents="none"
                                zIndex={4}
                                boxShadow="0 0 16px rgba(54, 163, 123, 0.45), 0 1px 2px rgba(0, 0, 0, 0.35)"
                                sx={SEAT_BADGE_PORTRAIT_SX}
                            >
                                {strengthLabel}
                            </Tag>
                        )}
                        <AnimatePresence>
                            {seatReaction && (
                                <motion.div
                                    key={seatReaction.id}
                                    initial={{ opacity: 0, scale: 0.7, y: 8 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.85, y: -6 }}
                                    transition={{
                                        duration: 0.35,
                                        ease: 'easeOut',
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '-1%',
                                        top: '-65%',
                                        zIndex: 6,
                                        pointerEvents: 'none',
                                    }}
                                >
                                    <Flex
                                        alignItems="center"
                                        justifyContent="center"
                                        bg={
                                            isCurrentTurn || showWinnerHighlight
                                                ? 'blackAlpha.200'
                                                : 'whiteAlpha.300'
                                        }
                                        borderRadius="4px"
                                        padding={{ base: 0.5, md: 1 }}
                                        boxShadow="0 6px 16px rgba(0, 0, 0, 0.25)"
                                    >
                                        <Box
                                            as="img"
                                            src={seatReaction.emoteUrl}
                                            alt={seatReaction.emoteName}
                                            height={{
                                                base: '24px',
                                                md: '38px',
                                            }}
                                            minWidth={{
                                                base: '24px',
                                                md: '42px',
                                            }}
                                            maxWidth={{
                                                base: '50px',
                                                md: '100px',
                                            }}
                                            width="auto"
                                            display="block"
                                            borderRadius="4px"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </Flex>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <HStack
                            className="player-info-header"
                            spacing={{ base: 1, md: 1.5 }}
                            width="100%"
                            minWidth={0}
                            alignItems="center"
                            px={{ base: 0.5, md: 1 }}
                        >
                            {/* Square avatar — blockie from address, or initials fallback, with timer overlay */}
                            <Box
                                position="relative"
                                flexShrink={0}
                                width={{ base: '40px', md: '50px' }}
                                height={{ base: '40px', md: '50px' }}
                                sx={{
                                    '@media (orientation: portrait)': {
                                        width: '31px',
                                        height: '31px',
                                    },
                                }}
                                onMouseEnter={() =>
                                    canShowXPrompt &&
                                    !xPromptDismissed &&
                                    setIsAvatarHovered(true)
                                }
                                onMouseLeave={() => setIsAvatarHovered(false)}
                            >
                                <PlayerAvatar
                                    profileImageUrl={player.profileImageUrl}
                                    address={player.address}
                                    username={player.username}
                                    initialsFontSize={{
                                        base: '14px',
                                        md: '18px',
                                    }}
                                    initialsSx={{
                                        '@media (orientation: portrait)': {
                                            fontSize: '11px',
                                        },
                                    }}
                                />
                                {/* Connect X prompt — see ConnectXPrompt.stories.tsx for variants */}
                                <ConnectXPrompt
                                    isOpen={showXHoverCard}
                                    onConnect={handleConnectX}
                                    onDismiss={handleDismissXPrompt}
                                />
                                {/* Timer seconds overlay on avatar — shape adapts to avatar (circular for X, square for blockie/initials) */}
                                {isCurrentTurn &&
                                    deadline > 0 &&
                                    remaining > 0 && (
                                        <Flex
                                            position="absolute"
                                            top={0}
                                            left={0}
                                            right={0}
                                            bottom={0}
                                            borderRadius={
                                                player.profileImageUrl
                                                    ? 'full'
                                                    : '4px'
                                            }
                                            bg="blackAlpha.600"
                                            alignItems="center"
                                            justifyContent="center"
                                            pointerEvents="none"
                                        >
                                            <Text
                                                fontSize={{
                                                    base: '24px',
                                                    md: '31px',
                                                }}
                                                sx={{
                                                    '@media (orientation: portrait)':
                                                        {
                                                            fontSize: '19px',
                                                        },
                                                }}
                                                fontWeight="900"
                                                color={timerTextColor}
                                                lineHeight="1"
                                                userSelect="none"
                                                textShadow="0 1px 4px rgba(0,0,0,0.6)"
                                                transition="color 0.3s ease-in-out"
                                            >
                                                {timerLabel}
                                            </Text>
                                        </Flex>
                                    )}
                            </Box>
                            {/* Username + stack stacked vertically */}
                            <Flex
                                direction="column"
                                minWidth={0}
                                flex={1}
                                gap={0}
                            >
                                <Flex
                                    alignItems="center"
                                    gap={{ base: 1 }}
                                    minWidth={0}
                                    width="100%"
                                >
                                    <Box
                                        position="relative"
                                        minWidth={0}
                                        flex={1}
                                    >
                                        <AnimatePresence
                                            mode="wait"
                                            initial={false}
                                        >
                                            {actionLabel ? (
                                                <motion.div
                                                    key={`action-${actionLabel.nonce}`}
                                                    style={{ width: '100%' }}
                                                    initial={{
                                                        opacity: 0,
                                                        y: prefersReducedMotion
                                                            ? 0
                                                            : 4,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        y: prefersReducedMotion
                                                            ? 0
                                                            : -4,
                                                    }}
                                                    transition={{
                                                        duration: 0.18,
                                                        ease: 'easeOut',
                                                    }}
                                                >
                                                    <Text
                                                        className="player-action-label"
                                                        variant="seatText"
                                                        fontSize={{
                                                            base: 'sm',
                                                            md: 'md',
                                                            lg: 'lg',
                                                        }}
                                                        fontWeight={900}
                                                        letterSpacing="0.08em"
                                                        textTransform="uppercase"
                                                        color={actionLabelColor(
                                                            actionLabel.action
                                                        )}
                                                        isTruncated
                                                        lineHeight="1.2"
                                                        sx={{
                                                            '@media (orientation: portrait)':
                                                                {
                                                                    fontSize:
                                                                        '11px',
                                                                },
                                                        }}
                                                    >
                                                        {actionLabelText(
                                                            actionLabel.action
                                                        )}
                                                    </Text>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="username"
                                                    style={{ width: '100%' }}
                                                    initial={{
                                                        opacity: 0,
                                                        y: prefersReducedMotion
                                                            ? 0
                                                            : -4,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        y: prefersReducedMotion
                                                            ? 0
                                                            : 4,
                                                    }}
                                                    transition={{
                                                        duration: 0.18,
                                                        ease: 'easeOut',
                                                    }}
                                                >
                                                    <Text
                                                        className="player-username"
                                                        variant="seatText"
                                                        fontSize={{
                                                            base: 'sm',
                                                            md: 'md',
                                                            lg: 'lg',
                                                        }}
                                                        fontWeight="bold"
                                                        color={
                                                            isCurrentTurn ||
                                                            showWinnerHighlight
                                                                ? 'gray.500'
                                                                : 'gray.400'
                                                        }
                                                        cursor="pointer"
                                                        isTruncated
                                                        lineHeight="1.2"
                                                        sx={{
                                                            '@media (orientation: portrait)':
                                                                {
                                                                    fontSize:
                                                                        '11px',
                                                                },
                                                        }}
                                                    >
                                                        {player.username}
                                                    </Text>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Box>
                                    {canSendSeatReaction && isSelf ? (
                                        <EmotePicker
                                            onSelectEmote={
                                                handleSelectSeatEmote
                                            }
                                            columns={6}
                                            maxHeight="280px"
                                            width={{
                                                base: '280px',
                                                md: '340px',
                                            }}
                                            showSearch={true}
                                            popoverContentProps={{
                                                zIndex: 2000,
                                            }}
                                            trigger={
                                                <IconButton
                                                    aria-label="Seat emotes"
                                                    icon={<FiSmile />}
                                                    fontSize={{
                                                        base: '18px',
                                                        md: '20px',
                                                    }}
                                                    variant="tactileGhost"
                                                    color={emoteIconColor}
                                                    height={{
                                                        base: '28px',
                                                        md: '32px',
                                                    }}
                                                    width={{
                                                        base: '28px',
                                                        md: '32px',
                                                    }}
                                                    minW="unset"
                                                    borderRadius="full"
                                                    sx={{
                                                        '@media (orientation: portrait)':
                                                            {
                                                                height: '14px',
                                                                width: '14px',
                                                                fontSize:
                                                                    '11px',
                                                            },
                                                    }}
                                                    _hover={{
                                                        bg: emoteIconHoverBg,
                                                        color: emoteIconColor,
                                                    }}
                                                    _active={{
                                                        bg: emoteIconActiveBg,
                                                        color: emoteIconColor,
                                                    }}
                                                />
                                            }
                                        />
                                    ) : (
                                        <Box
                                            aria-hidden
                                            width={{ base: '28px', md: '32px' }}
                                            height={{
                                                base: '28px',
                                                md: '32px',
                                            }}
                                            flexShrink={0}
                                            sx={{
                                                '@media (orientation: portrait)':
                                                    {
                                                        width: '14px',
                                                        height: '14px',
                                                    },
                                            }}
                                        />
                                    )}
                                </Flex>
                                <Flex
                                    data-testid={`player-stack-${player.seatID}`}
                                    className="player-stack-container"
                                    alignItems="center"
                                    gap={{ base: 1, md: 2 }}
                                    width="100%"
                                    cursor="pointer"
                                    onClick={cycleDisplayMode}
                                    title="Click to change display format"
                                    userSelect="none"
                                    sx={{
                                        '@media (orientation: portrait)': {
                                            fontSize: 'sm',
                                        },
                                    }}
                                >
                                    <StackValue
                                        value={player.stack}
                                        color={stackColor}
                                        fontSize={{
                                            base: 'md',
                                            md: 'lg',
                                            lg: 'xl',
                                        }}
                                        formatValue={format}
                                    />
                                </Flex>
                            </Flex>
                        </HStack>
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
};

export default TakenSeatButton;
