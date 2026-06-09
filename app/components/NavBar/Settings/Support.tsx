'use client';

import {
    VStack,
    Text,
    Box,
    HStack,
    Icon,
    Link,
    SimpleGrid,
    Badge,
} from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import { SocialIconButton } from '@/app/components/SocialIconButton';

const SectionGroupHeader = ({ label }: { label: string }) => (
    <HStack spacing={1.5} px={1} mb={1.5}>
        <Text
            fontSize="2xs"
            color="whiteAlpha.700"
            textTransform="uppercase"
            letterSpacing="0.10em"
            fontWeight={800}
        >
            {label}
        </Text>
    </HStack>
);

const SecondaryChannelCard = ({
    title,
    blurb,
    href,
    tone,
    cta,
}: {
    title: string;
    blurb: string;
    href: string;
    tone: 'telegram' | 'x';
    cta: string;
}) => (
    <Box
        bg="card.white"
        borderRadius={{ base: '12px', md: '14px' }}
        border="1px solid"
        borderColor="border.lightGray"
        p={{ base: 2.5, md: 3 }}
        boxShadow="card.lift"
    >
        <VStack spacing={2} align="stretch" h="100%">
            <VStack spacing={0.5} align="flex-start">
                <Text
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight={700}
                    color="text.secondary"
                    lineHeight="1.2"
                >
                    {title}
                </Text>
                <Text
                    fontSize="2xs"
                    color="text.muted"
                    lineHeight="1.35"
                >
                    {blurb}
                </Text>
            </VStack>
            <Link
                href={href}
                isExternal
                _hover={{ textDecoration: 'none' }}
                alignSelf="flex-start"
            >
                <SocialIconButton tone={tone} chipSize="sm" label={cta} />
            </Link>
        </VStack>
    </Box>
);

const Support = () => {
    return (
        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
            {/* Primary support — Discord */}
            <Box>
                <SectionGroupHeader label="Support" />
                <Box
                    bg="card.white"
                    borderRadius={{ base: '12px', md: '14px' }}
                    border="1px solid"
                    borderColor="border.lightGray"
                    p={{ base: 3, md: 3.5 }}
                    boxShadow="card.lift"
                    position="relative"
                    overflow="hidden"
                >
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        height="3px"
                        bg="#5865F2"
                    />
                    <VStack spacing={2.5} align="stretch">
                        <VStack
                            spacing={1}
                            align="flex-start"
                            flex={1}
                            minWidth={0}
                        >
                            <HStack spacing={2} align="center">
                                <Text
                                    fontSize={{ base: 'md', md: 'lg' }}
                                    fontWeight={800}
                                    color="text.secondary"
                                    lineHeight="1.15"
                                >
                                    Open a ticket in Discord
                                </Text>
                                <Badge
                                    bg="rgba(88, 101, 242, 0.10)"
                                    color="#5865F2"
                                    textTransform="uppercase"
                                    letterSpacing="0.08em"
                                    fontSize="2xs"
                                    fontWeight={800}
                                    px={1.5}
                                    py={0.5}
                                    borderRadius="6px"
                                >
                                    Official
                                </Badge>
                            </HStack>
                            <Text
                                fontSize="xs"
                                color="text.muted"
                                lineHeight="1.45"
                            >
                                Our team handles support via tickets in
                                Discord — bug reports, payouts, account
                                questions. Fastest path to a human.
                            </Text>
                        </VStack>
                        <Link
                            href="https://discord.gg/FdzHKPESVd"
                            isExternal
                            _hover={{ textDecoration: 'none' }}
                            alignSelf="flex-start"
                        >
                            <SocialIconButton
                                tone="discord"
                                chipSize="md"
                                label="Open a ticket"
                            />
                        </Link>
                    </VStack>
                </Box>
            </Box>

            {/* Community channels */}
            <Box>
                <SectionGroupHeader label="Also find us" />
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                    <SecondaryChannelCard
                        title="Telegram"
                        blurb="Real-time chat with the community. Quick questions, table-talk, announcements."
                        href="https://t.me/stackedpoker"
                        tone="telegram"
                        cta="Join chat"
                    />
                    <SecondaryChannelCard
                        title="X / Twitter"
                        blurb="Follow @stacked_poker for product updates, drops, and patch notes."
                        href="https://x.com/stacked_poker"
                        tone="x"
                        cta="Follow"
                    />
                </SimpleGrid>
            </Box>

            {/* Tip */}
            <Box
                p={{ base: 2.5, md: 3 }}
                bg="card.lightGray"
                borderRadius={{ base: '12px', md: '14px' }}
                border="1px dashed"
                borderColor="border.lightGray"
            >
                <HStack spacing={2.5} align="flex-start">
                    <Icon
                        as={FiInfo}
                        boxSize={4}
                        color="brand.green"
                        mt="2px"
                        flexShrink={0}
                    />
                    <Text
                        fontSize="xs"
                        color="text.muted"
                        lineHeight="1.45"
                    >
                        <Text
                            as="span"
                            fontWeight={700}
                            color="text.secondary"
                        >
                            Heads up:
                        </Text>{' '}
                        Include your wallet address, table ID, and a short
                        description when you open a ticket — it gets you
                        unblocked faster.
                    </Text>
                </HStack>
            </Box>
        </VStack>
    );
};

export default Support;
