'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Spinner,
    Text,
    VStack,
} from '@chakra-ui/react';
import {
    FaArrowRight,
    FaCheck,
    FaDiscord,
    FaTelegram,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { GiPokerHand, GiSpades } from 'react-icons/gi';
import type { IconType } from 'react-icons';
import Link from 'next/link';
import { useActiveAccount } from 'thirdweb/react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getQuests, completeQuest, type QuestItem } from '@/app/hooks/server_actions';
import useToastHelper from '@/app/hooks/useToastHelper';
import { friendlyMessage } from '@/app/utils/toastErrors';

const QUEST_ICONS: Record<string, IconType> = {
    follow_x: FaXTwitter,
    create_table: GiPokerHand,
    join_telegram: FaTelegram,
    join_discord: FaDiscord,
    verify_sbt: GiSpades,
};

interface BrandPaint {
    color: string;
    tint: string;
    tintDark: string;
    /** Darker shade for tactile press. */
    dark: string;
    /** Edge color for the chip's bottom rim (tactile-tone Claim button). */
    edge: string;
}

const QUEST_BRAND: Record<string, BrandPaint> = {
    follow_x: {
        color: '#0A0B12',
        tint: 'rgba(10, 11, 18, 0.06)',
        tintDark: 'rgba(255, 255, 255, 0.10)',
        dark: '#000000',
        edge: '#000000',
    },
    create_table: {
        color: '#36A37B',
        tint: 'rgba(54, 163, 123, 0.10)',
        tintDark: 'rgba(54, 163, 123, 0.18)',
        dark: '#2A8463',
        edge: '#22674E',
    },
    join_telegram: {
        color: '#229ED9',
        tint: 'rgba(34, 158, 217, 0.10)',
        tintDark: 'rgba(34, 158, 217, 0.20)',
        dark: '#1A86B8',
        edge: '#136687',
    },
    join_discord: {
        color: '#5865F2',
        tint: 'rgba(88, 101, 242, 0.10)',
        tintDark: 'rgba(88, 101, 242, 0.22)',
        dark: '#4752D6',
        edge: '#3F4ABF',
    },
    verify_sbt: {
        color: '#FDC51D',
        tint: 'rgba(253, 197, 29, 0.10)',
        tintDark: 'rgba(253, 197, 29, 0.18)',
        dark: '#D4A010',
        edge: '#A07800',
    },
};

const NEUTRAL_PAINT: BrandPaint = {
    color: 'text.primary',
    tint: 'card.lightGray',
    tintDark: 'rgba(255, 255, 255, 0.06)',
    dark: '#1A1A1A',
    edge: '#000000',
};

function paintFor(quest: QuestItem): BrandPaint {
    return QUEST_BRAND[quest.id] ?? NEUTRAL_PAINT;
}

function prereqLabel(quest: QuestItem): string | null {
    if (quest.prerequisite === 'x_linked') return 'Requires X account';
    if (quest.id === 'create_table') return 'Create your first table to unlock';
    return null;
}

interface QuestRowProps {
    quest: QuestItem;
    isLocked: boolean;
    onClaim: (questId: string) => Promise<void> | void;
    isClaiming: boolean;
    isLast: boolean;
    rowIndex: number;
}

const QuestRow: React.FC<QuestRowProps> = ({
    quest,
    isLocked,
    onClaim,
    isClaiming,
    isLast,
    rowIndex,
}) => {
    const IconComponent = QUEST_ICONS[quest.id] ?? FaCheck;
    const isVerifySbt = quest.id === 'verify_sbt';
    const prereq = prereqLabel(quest);
    const paint = paintFor(quest);
    const tilt = rowIndex % 2 === 0 ? -2 : 2;

    const handle = () => {
        onClaim(quest.id);
    };

    const buttonLabel = isLocked
        ? 'Locked'
        : isVerifySbt
          ? 'Verify & Claim'
          : quest.actionUrl
            ? 'Go & Claim'
            : 'Claim';

    return (
        <Box
            py={3}
            borderBottom={isLast ? undefined : '1px solid'}
            borderColor="border.lightGray"
            opacity={quest.completed ? 0.55 : 1}
            transition="background-color 0.15s ease"
            _hover={
                quest.completed || isLocked
                    ? undefined
                    : {
                          bg: 'rgba(0, 0, 0, 0.02)',
                          _dark: { bg: 'rgba(255, 255, 255, 0.02)' },
                      }
            }
            sx={{
                '&:hover .quest-tile': {
                    transform: `rotate(${tilt * 1.5}deg) translateY(-1px)`,
                },
            }}
        >
            <HStack spacing={3} align="center">
                <Flex
                    className="quest-tile"
                    w="34px"
                    h="34px"
                    borderRadius="7px"
                    bg={paint.tint}
                    _dark={{ bg: paint.tintDark }}
                    align="center"
                    justify="center"
                    flexShrink={0}
                    transform={`rotate(${tilt}deg)`}
                    transition="transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)"
                    boxShadow="inset 0 0 0 1px rgba(11, 20, 48, 0.04), 0 1px 2px rgba(11, 20, 48, 0.04)"
                >
                    <Icon
                        as={quest.completed ? FaCheck : IconComponent}
                        color={
                            quest.completed
                                ? 'brand.green'
                                : isLocked
                                  ? 'text.secondary'
                                  : paint.color
                        }
                        boxSize="20px"
                    />
                </Flex>

                <VStack spacing={0} align="flex-start" flex={1} minW={0}>
                    <Text
                        fontSize="sm"
                        fontWeight={700}
                        color="text.primary"
                        textDecoration={quest.completed ? 'line-through' : undefined}
                    >
                        {quest.title}
                    </Text>
                    <HStack spacing={1.5} align="center">
                        <Box
                            w="6px"
                            h="6px"
                            borderRadius="full"
                            bg={paint.color}
                            opacity={isLocked ? 0.4 : 0.85}
                            flexShrink={0}
                            boxShadow="inset 0 0 0 1px rgba(255, 255, 255, 0.4)"
                        />
                        <Text
                            fontSize="xs"
                            fontWeight={800}
                            color="brand.green"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            +{quest.points.toLocaleString()} pts
                        </Text>
                        {prereq && isLocked && (
                            <Text fontSize="2xs" color="text.secondary">
                                · {prereq}
                            </Text>
                        )}
                    </HStack>
                </VStack>

                {!quest.completed &&
                    (isLocked ? (
                        // Locked state: neutral muted ghost — desaturated so it
                        // doesn't read as "available".
                        <Button
                            size="sm"
                            h="30px"
                            px={3}
                            borderRadius="full"
                            variant="ghost"
                            color="text.secondary"
                            bg="transparent"
                            border="1px solid"
                            borderColor="border.lightGray"
                            fontWeight={700}
                            fontSize="xs"
                            isDisabled
                            _hover={{}}
                        >
                            Locked
                        </Button>
                    ) : (
                        // Tactile-tone Claim — solid chip in the quest's brand color.
                        <Button
                            as={quest.actionUrl ? 'a' : undefined}
                            href={quest.actionUrl}
                            target={quest.actionUrl ? '_blank' : undefined}
                            rel={quest.actionUrl ? 'noopener noreferrer' : undefined}
                            size="sm"
                            h="30px"
                            px={3}
                            borderRadius="full"
                            color="white"
                            bg={paint.color}
                            border="none"
                            fontWeight={700}
                            fontSize="xs"
                            isDisabled={isClaiming || (isVerifySbt && !quest.hasNft)}
                            isLoading={isClaiming}
                            loadingText="…"
                            onClick={handle}
                            boxShadow={`inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 ${paint.edge}`}
                            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                            _hover={{ bg: paint.color }}
                            _active={{
                                bg: paint.dark,
                                transform: 'translateY(2px)',
                                boxShadow: `inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 ${paint.edge}`,
                            }}
                            rightIcon={
                                quest.actionUrl ? (
                                    <Icon as={FaArrowRight} boxSize="9px" />
                                ) : undefined
                            }
                        >
                            {buttonLabel}
                        </Button>
                    ))}
            </HStack>

            {isVerifySbt && !quest.completed && !quest.hasNft && !isLocked && (
                <Box mt={2} ml="46px">
                    <Link
                        href="/claim"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                    >
                        <HStack spacing={1} display="inline-flex">
                            <Text fontSize="xs" color="brand.yellow" fontWeight={600}>
                                Claim your NFT badge
                            </Text>
                            <Icon as={FaArrowRight} color="brand.yellow" boxSize="9px" />
                        </HStack>
                    </Link>
                </Box>
            )}
        </Box>
    );
};

export interface QuestsSectionViewProps {
    quests: QuestItem[];
    totalQuestPoints: number;
    loading: boolean;
    claimingId?: string | null;
    isQuestLocked: (quest: QuestItem) => boolean;
    onClaim: (questId: string) => Promise<void> | void;
}

export const QuestsSectionView: React.FC<QuestsSectionViewProps> = ({
    quests,
    totalQuestPoints,
    loading,
    claimingId,
    isQuestLocked,
    onClaim,
}) => {
    return (
        <Box
            bg="card.white"
            borderRadius="24px"
            p={{ base: 5, md: 6 }}
            boxShadow="0 14px 32px rgba(12, 21, 49, 0.1)"
            _dark={{ boxShadow: '0 16px 30px rgba(0, 0, 0, 0.35)' }}
            mt={4}
        >
            <Flex justify="space-between" align="baseline" mb={4}>
                <Text fontSize="md" fontWeight={800} color="text.primary">
                    Quests
                </Text>
                <HStack spacing={1} align="baseline">
                    <Text fontSize="lg" fontWeight={900} color="brand.green">
                        +{totalQuestPoints.toLocaleString()}
                    </Text>
                    <Text
                        fontSize="2xs"
                        color="text.secondary"
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                    >
                        earned
                    </Text>
                </HStack>
            </Flex>

            {loading && quests.length === 0 ? (
                <Flex justify="center" py={6}>
                    <Spinner size="sm" color="brand.green" />
                </Flex>
            ) : (
                <Box>
                    {quests.map((q, i) => (
                        <QuestRow
                            key={q.id}
                            quest={q}
                            isLocked={isQuestLocked(q)}
                            onClaim={onClaim}
                            isClaiming={claimingId === q.id}
                            isLast={i === quests.length - 1}
                            rowIndex={i}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

interface QuestsSectionProps {
    tablesCreated?: number;
}

const QuestsSection: React.FC<QuestsSectionProps> = ({ tablesCreated = 0 }) => {
    const account = useActiveAccount();
    const { isAuthenticated, xUsername } = useAuth();
    const toast = useToastHelper();
    const [quests, setQuests] = useState<QuestItem[]>([]);
    const [totalQuestPoints, setTotalQuestPoints] = useState(0);
    const [loading, setLoading] = useState(false);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    const address = account?.address;

    const loadQuests = useCallback(async () => {
        if (!address) return;
        setLoading(true);
        try {
            const result = await getQuests(address);
            setQuests(result.quests);
            setTotalQuestPoints(result.totalQuestPoints);
        } finally {
            setLoading(false);
        }
    }, [address]);

    useEffect(() => {
        loadQuests();
    }, [loadQuests]);

    const handleClaim = useCallback(
        async (questId: string) => {
            if (!address) return;
            setClaimingId(questId);
            try {
                const result = await completeQuest(questId);
                if (!result.success && !result.alreadyCompleted) {
                    const { title, description } = friendlyMessage(result.message, {
                        title: 'Quest failed',
                        description: 'Could not claim quest. Please try again.',
                    });
                    toast.error(title, description);
                }
                await loadQuests();
            } catch {
                toast.error('Quest failed', 'Network error — please try again');
            } finally {
                setClaimingId(null);
            }
        },
        [address, loadQuests, toast]
    );

    if (!address || !isAuthenticated) return null;

    const isLocked = (quest: QuestItem): boolean => {
        if (quest.prerequisite === 'x_linked') return !xUsername;
        if (quest.id === 'create_table') return tablesCreated === 0;
        return false;
    };

    return (
        <QuestsSectionView
            quests={quests}
            totalQuestPoints={totalQuestPoints}
            loading={loading}
            claimingId={claimingId}
            isQuestLocked={isLocked}
            onClaim={handleClaim}
        />
    );
};

export default QuestsSection;
