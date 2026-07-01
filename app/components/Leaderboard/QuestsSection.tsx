'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    Progress,
    Skeleton,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useWarmSkeleton } from '@/app/components/Skeletons/useWarmSkeleton';
import {
    FaArrowRight,
    FaCheck,
    FaCheckDouble,
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
    dark: string;
    edge: string;
}

const QUEST_BRAND: Record<string, BrandPaint> = {
    follow_x: { color: '#0A0B12', tint: 'rgba(10, 11, 18, 0.06)', tintDark: 'rgba(255, 255, 255, 0.10)', dark: '#000000', edge: '#000000' },
    create_table: { color: '#36A37B', tint: 'rgba(54, 163, 123, 0.10)', tintDark: 'rgba(54, 163, 123, 0.18)', dark: '#2A8463', edge: '#22674E' },
    join_telegram: { color: '#229ED9', tint: 'rgba(34, 158, 217, 0.10)', tintDark: 'rgba(34, 158, 217, 0.20)', dark: '#1A86B8', edge: '#136687' },
    join_discord: { color: '#5865F2', tint: 'rgba(88, 101, 242, 0.10)', tintDark: 'rgba(88, 101, 242, 0.22)', dark: '#4752D6', edge: '#3F4ABF' },
    verify_sbt: { color: '#FDC51D', tint: 'rgba(253, 197, 29, 0.10)', tintDark: 'rgba(253, 197, 29, 0.18)', dark: '#D4A010', edge: '#A07800' },
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
}

const QuestRow: React.FC<QuestRowProps> = ({ quest, isLocked, onClaim, isClaiming, isLast }) => {
    const IconComponent = QUEST_ICONS[quest.id] ?? FaCheck;
    const isVerifySbt = quest.id === 'verify_sbt';
    const prereq = prereqLabel(quest);
    const paint = paintFor(quest);

    const buttonLabel = isLocked
        ? 'Locked'
        : isVerifySbt
          ? 'Verify & Claim'
          : quest.actionUrl
            ? 'Go & Claim'
            : 'Claim';

    return (
        <Box
            py={2.5}
            borderBottom={isLast ? undefined : '1px solid'}
            borderColor="border.lightGray"
            opacity={quest.completed ? 0.55 : 1}
            transition="background-color 0.15s ease"
            borderRadius="8px"
            _hover={
                quest.completed || isLocked
                    ? undefined
                    : { bg: 'bg.greenTint' }
            }
        >
            <HStack spacing={3} align="center">
                {/* Quiet brand-painted tile (tilt removed — fights the penthouse-calm register). */}
                <Flex
                    w="34px"
                    h="34px"
                    borderRadius="7px"
                    bg={paint.tint}
                    _dark={{ bg: paint.tintDark }}
                    align="center"
                    justify="center"
                    flexShrink={0}
                    boxShadow="inset 0 0 0 1px rgba(11, 20, 48, 0.04)"
                >
                    <Icon
                        as={quest.completed ? FaCheck : IconComponent}
                        color={quest.completed ? 'brand.green' : isLocked ? 'text.secondary' : paint.color}
                        boxSize="18px"
                    />
                </Flex>

                <VStack spacing={0.5} align="flex-start" flex={1} minW={0}>
                    <HStack spacing={1.5}>
                        <Text
                            fontSize="sm"
                            fontWeight={700}
                            color="text.primary"
                            textDecoration={quest.completed ? 'line-through' : undefined}
                            noOfLines={1}
                        >
                            {quest.title}
                        </Text>
                        {isVerifySbt && (
                            <Text
                                fontSize="2xs"
                                fontWeight={800}
                                letterSpacing="0.04em"
                                color="brand.yellowDark"
                                _dark={{ color: 'brand.yellow' }}
                                bg="bg.yellowTint"
                                px={1.5}
                                borderRadius="full"
                                flexShrink={0}
                            >
                                NFT
                            </Text>
                        )}
                    </HStack>
                    <HStack spacing={1.5} align="center">
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
                        <Button
                            size="sm"
                            h="32px"
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
                        <Button
                            as={quest.actionUrl ? 'a' : undefined}
                            href={quest.actionUrl}
                            target={quest.actionUrl ? '_blank' : undefined}
                            rel={quest.actionUrl ? 'noopener noreferrer' : undefined}
                            size="sm"
                            h="32px"
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
                            onClick={() => onClaim(quest.id)}
                            boxShadow={`inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 ${paint.edge}`}
                            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                            _hover={{ bg: paint.color }}
                            _active={{ bg: paint.dark, transform: 'translateY(2px)', boxShadow: `inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 ${paint.edge}` }}
                            _focusVisible={{ boxShadow: 'focus.ring' }}
                            rightIcon={quest.actionUrl ? <Icon as={FaArrowRight} boxSize="9px" /> : undefined}
                        >
                            {buttonLabel}
                        </Button>
                    ))}
            </HStack>

            {isVerifySbt && !quest.completed && !quest.hasNft && !isLocked && (
                <Box mt={2} ml="46px">
                    <Link href="/claim" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <HStack spacing={1} display="inline-flex">
                            <Text fontSize="xs" color="brand.yellowDark" _dark={{ color: 'brand.yellow' }} fontWeight={600}>
                                Claim your NFT badge
                            </Text>
                            <Icon as={FaArrowRight} color="brand.yellowDark" _dark={{ color: 'brand.yellow' }} boxSize="9px" />
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
    const done = quests.filter((q) => q.completed).length;
    const total = quests.length;
    const allDone = total > 0 && done === total;
    const sk = useWarmSkeleton();

    // Activation ladder: claimable easiest-first (lowest points), then locked, then done.
    const sorted = useMemo(() => {
        const rank = (q: QuestItem) => (q.completed ? 2 : isQuestLocked(q) ? 1 : 0);
        return [...quests].sort((a, b) => rank(a) - rank(b) || a.points - b.points);
    }, [quests, isQuestLocked]);

    return (
        <Box
            bg="card.white"
            border="1px solid"
            borderColor="border.felt"
            borderRadius="20px"
            p={{ base: 4, md: 5 }}
            h="full"
        >
            <Flex justify="space-between" align="center" mb={2}>
                <Text as="h2" fontSize="sm" fontWeight={800} color="text.primary">
                    Quests
                </Text>
                {total > 0 && (
                    <HStack spacing={1.5} align="baseline">
                        <Text fontSize="xs" color="text.secondary" fontWeight={600}>
                            {done}/{total} done
                        </Text>
                        <Text
                            fontSize="sm"
                            fontWeight={900}
                            color="brand.green"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            +{totalQuestPoints.toLocaleString()}
                        </Text>
                    </HStack>
                )}
            </Flex>

            {total > 0 && (
                <Progress
                    value={(done / total) * 100}
                    size="xs"
                    borderRadius="full"
                    bg="border.lightGray"
                    mb={3}
                    sx={{ '& > div': { bg: 'brand.green', borderRadius: 'full' } }}
                    aria-label={`${done} of ${total} quests done`}
                />
            )}

            {loading && quests.length === 0 ? (
                <VStack
                    align="stretch"
                    spacing={2}
                    py={2}
                    aria-busy="true"
                    aria-label="Loading quests"
                >
                    {[0, 1, 2].map((i) => (
                        <HStack key={i} spacing={3} py={2} align="center">
                            <Skeleton
                                boxSize="34px"
                                borderRadius="7px"
                                flexShrink={0}
                                {...sk}
                            />
                            <Skeleton
                                h="12px"
                                w={`${60 - i * 8}%`}
                                borderRadius="md"
                                {...sk}
                            />
                        </HStack>
                    ))}
                </VStack>
            ) : allDone ? (
                <HStack spacing={3} py={3} align="center">
                    <Flex w="34px" h="34px" borderRadius="7px" bg="bg.greenTint" align="center" justify="center" flexShrink={0}>
                        <Icon as={FaCheckDouble} color="brand.green" boxSize="16px" />
                    </Flex>
                    <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight={700} color="text.primary">
                            All quests cleared · +{totalQuestPoints.toLocaleString()} pts
                        </Text>
                        <Link href="/create-game" style={{ textDecoration: 'none' }}>
                            <Text fontSize="xs" color="brand.green" fontWeight={600}>
                                Host a table to earn more →
                            </Text>
                        </Link>
                    </VStack>
                </HStack>
            ) : (
                <Box>
                    {sorted.map((q, i) => (
                        <QuestRow
                            key={q.id}
                            quest={q}
                            isLocked={isQuestLocked(q)}
                            onClaim={onClaim}
                            isClaiming={claimingId === q.id}
                            isLast={i === sorted.length - 1}
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
