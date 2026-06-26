'use client';

import {
    Box,
    Button,
    Flex,
    HStack,
    VStack,
    Text,
    Progress,
    Icon,
    Link,
} from '@chakra-ui/react';
import { FiCopy, FiCheck, FiCheckCircle } from 'react-icons/fi';
import ShareResultButton from './ShareResultButton';
import { SocialIconButton } from '../SocialIconButton';

// Bring-a-Friend share card (§3.3) — presentational. "I saved you a seat at my
// table": recognition only, never a money surface. Reuses the blessed share
// components (ShareResultButton, SocialIconButton) so it matches the share UX
// everywhere else. Pure props → fully reviewable in Storybook.
export interface FriendInviteProps {
    joined: number;
    issued: number;
    shareText: string;
    shareUrl: string;
    tweetUrl: string;
    telegramUrl: string;
    copied: boolean;
    onCopy: () => void;
}

export default function FriendInvite({
    joined,
    issued,
    shareText,
    shareUrl,
    tweetUrl,
    telegramUrl,
    copied,
    onCopy,
}: FriendInviteProps) {
    const allUsed = issued > 0 && joined >= issued;
    const pct = issued > 0 ? (joined / issued) * 100 : 0;

    return (
        <Box
            bg="card.white"
            borderRadius="xl"
            p={{ base: 5, md: 6 }}
            boxShadow="card.lift"
        >
            <VStack align="stretch" spacing={4}>
                <VStack align="start" spacing={1}>
                    <Text fontWeight={800} color="text.primary">
                        Bring a friend
                    </Text>
                    <Text fontSize="sm" color="text.secondary">
                        Each invite is a free seat at this event.
                    </Text>
                </VStack>

                {/* Labeled count + meter, mirroring the host panel's scoreboard.
                    The empty 0% track is hidden (the count carries it) so it never
                    reads as an inert/disabled slider. */}
                <Box>
                    <Flex
                        justify="space-between"
                        align="baseline"
                        mb={joined > 0 ? 1.5 : 0}
                    >
                        <Text fontSize="xs" color="text.muted">
                            Friends joined
                        </Text>
                        <Text
                            fontSize="sm"
                            fontWeight={700}
                            color="text.primary"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {joined} of {issued}
                        </Text>
                    </Flex>
                    {joined > 0 && (
                        <Progress
                            value={pct}
                            size="sm"
                            borderRadius="full"
                            bg="border.lightGray"
                            sx={{ '& > div': { bg: 'brand.green' } }}
                            aria-label={`${joined} of ${issued} friends joined`}
                        />
                    )}
                </Box>

                {allUsed ? (
                    <HStack spacing={2}>
                        <Icon
                            as={FiCheckCircle}
                            color="brand.green"
                            aria-hidden
                        />
                        <Text
                            fontSize="sm"
                            color="brand.green"
                            fontWeight={600}
                        >
                            All {issued} invites used. Nice work.
                        </Text>
                    </HStack>
                ) : (
                    <VStack align="stretch" spacing={3}>
                        <ShareResultButton
                            shareText={shareText}
                            shareUrl={shareUrl}
                            variant="tactilePrimary"
                            label="Invite a friend"
                        />
                        <HStack spacing={2} justify="center">
                            <Button
                                variant="tactileNeutral"
                                size="sm"
                                minH="40px"
                                leftIcon={
                                    <Icon as={copied ? FiCheck : FiCopy} />
                                }
                                onClick={onCopy}
                            >
                                {copied ? 'Copied' : 'Copy link'}
                            </Button>
                            <Link
                                href={tweetUrl}
                                isExternal
                                _hover={{ textDecoration: 'none' }}
                            >
                                <SocialIconButton
                                    tone="x"
                                    tabIndex={-1}
                                    aria-label="Share on X"
                                />
                            </Link>
                            <Link
                                href={telegramUrl}
                                isExternal
                                _hover={{ textDecoration: 'none' }}
                            >
                                <SocialIconButton
                                    tone="telegram"
                                    tabIndex={-1}
                                    aria-label="Share on Telegram"
                                />
                            </Link>
                        </HStack>
                    </VStack>
                )}
            </VStack>
        </Box>
    );
}
