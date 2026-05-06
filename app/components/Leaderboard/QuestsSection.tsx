'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Box,
    Button,
    Flex,
    Grid,
    HStack,
    Icon,
    Input,
    Spinner,
    Text,
    Tooltip,
    VStack,
} from '@chakra-ui/react';
import {
    FaCheck,
    FaDiscord,
    FaLock,
    FaTable,
    FaTelegram,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { MdGroups } from 'react-icons/md';
import type { IconType } from 'react-icons';
import { useActiveAccount } from 'thirdweb/react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getQuests, completeQuest, type QuestItem } from '@/app/hooks/server_actions';
import useToastHelper from '@/app/hooks/useToastHelper';

const QUEST_ICONS: Record<string, IconType> = {
    follow_x: FaXTwitter,
    create_table: FaTable,
    join_telegram: FaTelegram,
    join_discord: FaDiscord,
    community_join: MdGroups,
};

const QUEST_COLORS: Record<string, string> = {
    follow_x: '#1DA1F2',
    create_table: 'brand.green',
    join_telegram: '#229ED9',
    join_discord: '#5865F2',
    community_join: 'brand.pink',
};

interface QuestCardProps {
    quest: QuestItem;
    isLocked: boolean;
    communityCode?: string;
    onClaim: (questId: string, communityCode?: string) => Promise<void>;
    isClaiming: boolean;
}

const QuestCard: React.FC<QuestCardProps> = ({
    quest,
    isLocked,
    communityCode,
    onClaim,
    isClaiming,
}) => {
    const [localCode, setLocalCode] = useState(communityCode ?? '');

    const IconComponent = QUEST_ICONS[quest.id] ?? FaCheck;
    const color = QUEST_COLORS[quest.id] ?? 'brand.green';
    const isCommunity = quest.id === 'community_join';

    const handleClaim = () => {
        if (isCommunity) {
            onClaim(quest.id, localCode.trim() || undefined);
        } else if (quest.actionUrl) {
            window.open(quest.actionUrl, '_blank', 'noopener,noreferrer');
            onClaim(quest.id);
        } else {
            onClaim(quest.id);
        }
    };

    return (
        <Box
            bg="card.white"
            borderRadius="16px"
            p={4}
            boxShadow="0 4px 16px rgba(12, 21, 49, 0.07)"
            _dark={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)' }}
            border="1px solid"
            borderColor={
                quest.completed
                    ? 'rgba(54, 163, 123, 0.3)'
                    : isLocked
                      ? 'border.lightGray'
                      : 'transparent'
            }
            opacity={isLocked ? 0.55 : 1}
            transition="opacity 0.2s ease, border-color 0.2s ease"
            position="relative"
            overflow="hidden"
        >
            {/* Completed shimmer strip */}
            {quest.completed && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="2px"
                    bg="linear-gradient(90deg, #36A37B, #4ade80)"
                />
            )}

            <VStack spacing={3} align="stretch">
                {/* Icon + title + points */}
                <HStack spacing={3}>
                    <Flex
                        w="36px"
                        h="36px"
                        borderRadius="10px"
                        bg={quest.completed ? 'rgba(54, 163, 123, 0.12)' : 'card.lightGray'}
                        _dark={{ bg: 'rgba(255,255,255,0.06)' }}
                        align="center"
                        justify="center"
                        flexShrink={0}
                    >
                        <Icon
                            as={quest.completed ? FaCheck : isLocked ? FaLock : IconComponent}
                            color={quest.completed ? 'brand.green' : isLocked ? 'text.secondary' : color}
                            boxSize="16px"
                        />
                    </Flex>

                    <VStack spacing={0} align="flex-start" flex={1} minW={0}>
                        <Text
                            fontSize="sm"
                            fontWeight={700}
                            color={quest.completed ? 'brand.green' : 'text.primary'}
                        >
                            {quest.title}
                        </Text>
                        <HStack spacing={1} align="baseline">
                            <Text
                                fontSize="xs"
                                fontWeight={800}
                                color={quest.completed ? 'brand.green' : 'brand.yellow'}
                            >
                                +{quest.points.toLocaleString()}
                            </Text>
                            <Text fontSize="2xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em">
                                pts
                            </Text>
                        </HStack>
                    </VStack>

                    {/* {quest.completed && (
                        <Flex
                            w="24px"
                            h="24px"
                            borderRadius="full"
                            bg="brand.green"
                            align="center"
                            justify="center"
                            flexShrink={0}
                        >
                            <Icon as={FaCheck} color="white" boxSize="10px" />
                        </Flex>
                    )} */}
                </HStack>

                {/* Community code input */}
                {isCommunity && !quest.completed && !isLocked && (
                    <Input
                        size="sm"
                        placeholder="Enter community code"
                        value={localCode}
                        onChange={(e) => setLocalCode(e.target.value)}
                        borderRadius="8px"
                        borderColor="border.lightGray"
                        _focus={{ borderColor: 'brand.pink', boxShadow: '0 0 0 1px var(--chakra-colors-brand-pink)' }}
                        fontSize="xs"
                    />
                )}

                {/* CTA */}
                {!quest.completed && (
                    <Tooltip
                        label={
                            isLocked
                                ? quest.prerequisite === 'x_linked'
                                    ? 'Link your X account first'
                                    : 'Prerequisite not met'
                                : undefined
                        }
                        isDisabled={!isLocked}
                        hasArrow
                        fontSize="xs"
                    >
                        <Button
                            size="sm"
                            w="full"
                            borderRadius="8px"
                            bg={isLocked ? 'card.lightGray' : 'brand.green'}
                            color={isLocked ? 'text.secondary' : 'white'}
                            fontWeight={700}
                            fontSize="xs"
                            isDisabled={isLocked || isClaiming || (isCommunity && !localCode.trim())}
                            isLoading={isClaiming}
                            loadingText="Claiming…"
                            onClick={handleClaim}
                            _hover={
                                isLocked
                                    ? {}
                                    : { bg: '#2d9268', transform: 'translateY(-1px)' }
                            }
                            _active={{ transform: 'translateY(0)' }}
                            transition="all 0.15s ease"
                        >
                            {isLocked ? 'Locked' : isCommunity ? 'Claim' : quest.actionUrl ? 'Go & Claim' : 'Claim'}
                        </Button>
                    </Tooltip>
                )}
            </VStack>
        </Box>
    );
};

interface QuestsSectionProps {
    communityCode?: string;
    tablesCreated?: number;
}

const QuestsSection: React.FC<QuestsSectionProps> = ({ communityCode, tablesCreated = 0 }) => {
    const account = useActiveAccount();
    const { isAuthenticated, xUsername } = useAuth();
    const toast = useToastHelper();
    const [quests, setQuests] = useState<QuestItem[]>([]);
    const [totalQuestPoints, setTotalQuestPoints] = useState(0);
    const [loading, setLoading] = useState(false);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const communityAutoFired = useRef(false);

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

    // Auto-fire community_join when authenticated with a pre-filled community code
    useEffect(() => {
        if (
            !address ||
            !isAuthenticated ||
            !communityCode ||
            communityAutoFired.current
        ) return;

        const communityQuest = quests.find((q) => q.id === 'community_join');
        if (!communityQuest || communityQuest.completed) return;

        communityAutoFired.current = true;
        completeQuest('community_join', communityCode)
            .then((result) => {
                if (!result.success && !result.alreadyCompleted) {
                    toast.error('Quest failed', result.message ?? 'Could not claim community quest');
                }
                return loadQuests();
            })
            .catch(() => toast.error('Quest failed', 'Could not claim community quest'));
    }, [address, isAuthenticated, communityCode, quests, loadQuests]);

    const handleClaim = useCallback(
        async (questId: string, code?: string) => {
            if (!address) return;
            setClaimingId(questId);
            try {
                const result = await completeQuest(questId, code);
                if (!result.success && !result.alreadyCompleted) {
                    toast.error('Quest failed', result.message ?? 'Could not claim quest');
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
        <Box
            bg="card.white"
            borderRadius="24px"
            p={{ base: 5, md: 6 }}
            boxShadow="0 14px 32px rgba(12, 21, 49, 0.1)"
            _dark={{ boxShadow: '0 16px 30px rgba(0, 0, 0, 0.35)' }}
            mt={4}
        >
            <HStack justify="space-between" mb={4}>
                <VStack spacing={0} align="flex-start">
                    <Text fontSize="md" fontWeight={800} color="text.primary">
                        Quests
                    </Text>
                    <Text fontSize="2xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em">
                        One-time bonus points
                    </Text>
                </VStack>
                {totalQuestPoints > 0 && (
                    <HStack spacing={1} align="baseline">
                        <Text fontSize="lg" fontWeight={900} color="brand.green">
                            +{totalQuestPoints.toLocaleString()}
                        </Text>
                        <Text fontSize="2xs" color="text.secondary" textTransform="uppercase" letterSpacing="0.06em">
                            pts earned
                        </Text>
                    </HStack>
                )}
            </HStack>

            {loading && quests.length === 0 ? (
                <Flex justify="center" py={6}>
                    <Spinner size="sm" color="brand.green" />
                </Flex>
            ) : (
                <Grid
                    templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }}
                    gap={3}
                >
                    {quests.map((quest) => (
                        <QuestCard
                            key={quest.id}
                            quest={quest}
                            isLocked={isLocked(quest)}
                            communityCode={quest.id === 'community_join' ? communityCode : undefined}
                            onClaim={handleClaim}
                            isClaiming={claimingId === quest.id}
                        />
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default QuestsSection;
