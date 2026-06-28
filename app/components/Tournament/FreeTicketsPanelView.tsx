'use client';

import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    IconButton,
    Progress,
    Text,
    VStack,
} from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { FiCheck, FiCopy, FiGift, FiPlus, FiTag } from 'react-icons/fi';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaDiscord, FaTelegram } from 'react-icons/fa';
import type {
    FreeTicketCode,
    FreeTicketsPanelData,
} from '../../hooks/server_actions';

// Host-only Free Tickets section (§3.1) — presentational. Direction chosen via a
// 3-way diverge→judge pass: a hybrid of "share-first" (the invite link + a
// full-width Copy CTA leads, the host's #1 recurring job) and "scoreboard" (a
// green-tinted, self-lit status block that stays legible in both modes). Then
// per-channel tracking, then quiet config. Mobile-first.

type TagKey = 'x' | 'discord' | 'tg' | 'custom';

const MINT_OPTIONS: { tag: TagKey; label: string; icon: IconType }[] = [
    { tag: 'x', label: 'X', icon: RiTwitterXLine },
    { tag: 'discord', label: 'Discord', icon: FaDiscord },
    { tag: 'tg', label: 'Telegram', icon: FaTelegram },
    { tag: 'custom', label: 'Custom', icon: FiPlus },
];

// Source tag → display identity for the minted tracking rows.
const CHANNEL: Record<string, { label: string; icon: IconType }> = {
    x: { label: 'X', icon: RiTwitterXLine },
    discord: { label: 'Discord', icon: FaDiscord },
    tg: { label: 'Telegram', icon: FaTelegram },
    telegram: { label: 'Telegram', icon: FaTelegram },
    custom: { label: 'Custom', icon: FiTag },
};
const channelFor = (tag: string | null) =>
    (tag && CHANNEL[tag]) || { label: tag || 'Link', icon: FiTag };

function buildShareUrl(code: FreeTicketCode): string {
    if (code.share_url) return code.share_url;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}${code.claim_path}`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Text
            fontSize="2xs"
            textTransform="uppercase"
            letterSpacing="0.08em"
            fontWeight="semibold"
            color="text.muted"
        >
            {children}
        </Text>
    );
}

export interface FreeTicketsPanelViewProps {
    data: FreeTicketsPanelData;
    rowBg: string;
    copiedId: number | null;
    creatingTag: string | null;
    onCopy: (code: FreeTicketCode) => void;
    onAddTag: (tag: TagKey) => void;
}

export default function FreeTicketsPanelView({
    data,
    rowBg,
    copiedId,
    creatingTag,
    onCopy,
    onAddTag,
}: FreeTicketsPanelViewProps) {
    const publicCode = data.codes.find((c) => c.code_type === 'public');
    const taggedCodes = data.codes.filter((c) => c.code_type === 'tagged');
    const capped = !data.infinite && data.cap > 0;
    const claimedPct = capped
        ? Math.min(100, Math.round((data.claimed / data.cap) * 100))
        : 0;

    return (
        <VStack align="stretch" spacing={5}>
            {/* Header — mirrors the "Host controls" section label, no emoji. */}
            <HStack spacing={2}>
                <Icon as={FiGift} boxSize={4} color="text.muted" aria-hidden />
                <SectionLabel>Free tickets</SectionLabel>
            </HStack>

            {/* Share hero — the host's #1 recurring job: grab the link and send it.
                The link field confirms what they're sharing; the full-width tactile
                CTA is the unmissable top-of-fold tap target. */}
            {publicCode && (
                <Box>
                    <SectionLabel>Your invite link</SectionLabel>
                    <Box
                        mt={2}
                        mb={2}
                        bg={rowBg}
                        borderRadius="12px"
                        px={3}
                        py={2.5}
                    >
                        <Text
                            fontSize="sm"
                            color="text.primary"
                            noOfLines={1}
                            title={buildShareUrl(publicCode)}
                        >
                            {buildShareUrl(publicCode)}
                        </Text>
                    </Box>
                    <Button
                        variant="tactilePrimary"
                        w="full"
                        leftIcon={
                            <Icon
                                as={
                                    copiedId === publicCode.id
                                        ? FiCheck
                                        : FiCopy
                                }
                            />
                        }
                        onClick={() => onCopy(publicCode)}
                    >
                        {copiedId === publicCode.id
                            ? 'Copied'
                            : 'Copy invite link'}
                    </Button>
                </Box>
            )}

            {/* Status scoreboard — how the drop is doing, at a glance. Green-tinted
                so the metrics sit on a self-lit surface that holds up in dark. */}
            <Box
                bg="bg.greenSubtle"
                borderWidth="1px"
                borderColor="border.greenSubtle"
                borderRadius="xl"
                p={4}
            >
                <Flex justify="space-between" align="baseline" gap={3}>
                    <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color="text.secondary"
                    >
                        Free seats claimed
                    </Text>
                    <HStack spacing={1} align="baseline">
                        <Text
                            fontSize="2xl"
                            fontWeight={800}
                            lineHeight="1"
                            color="text.primary"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {data.claimed}
                        </Text>
                        {capped && (
                            <Text
                                fontSize="md"
                                fontWeight={600}
                                color="text.muted"
                            >
                                / {data.cap}
                            </Text>
                        )}
                    </HStack>
                </Flex>
                {capped && (
                    <Progress
                        value={claimedPct}
                        size="sm"
                        borderRadius="full"
                        bg="border.lightGray"
                        sx={{ '& > div': { bg: 'brand.green' } }}
                        mt={2.5}
                        aria-label={`${data.claimed} of ${data.cap} free entries claimed`}
                    />
                )}
                <Text fontSize="sm" color="text.secondary" mt={2.5}>
                    <Text as="span" fontWeight={700} color="text.primary">
                        {data.played}
                    </Text>{' '}
                    played ·{' '}
                    <Text as="span" fontWeight={700} color="text.primary">
                        {data.codes_in_circulation}
                    </Text>{' '}
                    codes out{!capped && ' · no cap'}
                </Text>
            </Box>

            {/* Channel tracking — mint a tagged link, then see per-channel claims. */}
            <Box>
                <SectionLabel>Track by channel</SectionLabel>
                <HStack mt={2} spacing={2} flexWrap="wrap">
                    {MINT_OPTIONS.map((opt) => (
                        <Button
                            key={opt.tag}
                            size="sm"
                            variant="tactileOutline"
                            leftIcon={<Icon as={opt.icon} />}
                            isLoading={creatingTag === opt.tag}
                            onClick={() => onAddTag(opt.tag)}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </HStack>
                {taggedCodes.length > 0 && (
                    <VStack align="stretch" spacing={2} mt={3}>
                        {taggedCodes.map((c) => {
                            const ch = channelFor(c.source_tag);
                            return (
                                <Flex
                                    key={c.id}
                                    bg={rowBg}
                                    borderRadius="10px"
                                    pl={3}
                                    pr={1.5}
                                    py={1.5}
                                    align="center"
                                    gap={3}
                                >
                                    <Icon
                                        as={ch.icon}
                                        boxSize={4}
                                        color="text.secondary"
                                        flexShrink={0}
                                        aria-hidden
                                    />
                                    <Text
                                        fontSize="sm"
                                        fontWeight={600}
                                        color="text.primary"
                                        flex="1"
                                        minW={0}
                                        noOfLines={1}
                                    >
                                        {ch.label}
                                    </Text>
                                    <Text
                                        fontSize="xs"
                                        color="text.muted"
                                        flexShrink={0}
                                        sx={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {c.claims_count} claimed
                                    </Text>
                                    <IconButton
                                        aria-label={`Copy ${ch.label} link`}
                                        size="sm"
                                        variant="tactileGhost"
                                        color="text.muted"
                                        flexShrink={0}
                                        icon={
                                            copiedId === c.id ? (
                                                <FiCheck />
                                            ) : (
                                                <FiCopy />
                                            )
                                        }
                                        onClick={() => onCopy(c)}
                                    />
                                </Flex>
                            );
                        })}
                    </VStack>
                )}
            </Box>

            {/* Quiet config context. */}
            <Text fontSize="xs" color="text.muted">
                Each claimer gets {data.codes_per_claimer} invite link
                {data.codes_per_claimer === 1 ? '' : 's'} to pass on.
            </Text>
        </VStack>
    );
}
