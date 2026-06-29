'use client';

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Button,
    HStack,
    Icon,
    IconButton,
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    SimpleGrid,
    Stack,
    Text,
    Tooltip,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { FaDownload, FaTimes, FaCheck, FaCrown } from 'react-icons/fa';
import { FaXTwitter, FaTelegram } from 'react-icons/fa6';
import { SocialIconButton } from '../SocialIconButton';

/* -------------------------------------------------------------------------- */
/*  Faithful render of the production shareable card.                         */
/*  Mirrors the layout in app/components/Leaderboard/ShareRankCard.tsx so the */
/*  spike shows the actual artifact being framed by the modal chrome.         */
/* -------------------------------------------------------------------------- */

const SAMPLE = {
    rank: 21,
    points: 1860,
    address: '0xFA04567890abcdef1234567890abcdef12345678',
    tierColor: '#FDC51D',
    tierLabel: 'GOLD',
};

const ordinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] ?? s[v] ?? s[0];
};

const FaithfulShareCard: React.FC<{ height?: string; lifted?: boolean }> = ({
    height = '210px',
    lifted = false,
}) => {
    const liftShadow = useColorModeValue(
        '0 18px 36px rgba(11, 20, 48, 0.18)',
        '0 18px 36px rgba(0, 0, 0, 0.55)',
    );
    const truncated = `${SAMPLE.address.slice(0, 6)}...${SAMPLE.address.slice(-4)}`;
    return (
        <Box
            w="100%"
            h={height}
            borderRadius="14px"
            position="relative"
            overflow="hidden"
            boxShadow={lifted ? liftShadow : 'none'}
            sx={{ fontFamily: 'Poppins, sans-serif' }}
        >
            {/* Full-bleed bg (matches /video/bgplaceholder.webp tone in production) */}
            <Box
                position="absolute"
                inset={0}
                bgGradient="linear(135deg, #1a2040 0%, #2c1e4a 45%, #0f1530 100%)"
            />

            {/* Bottom darken for rank readability */}
            <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="50%"
                bgGradient="linear(to top, rgba(0,0,0,0.55) 0%, transparent 100%)"
                pointerEvents="none"
            />

            {/* Points + address — frosted top-left pill */}
            <Box
                position="absolute"
                top="12px"
                left="12px"
                px="16px"
                py="10px"
                borderRadius="14px"
                bg="rgba(0, 0, 0, 0.55)"
                sx={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
                <HStack spacing="5px" align="baseline" mb="3px">
                    <Text fontSize="34px" fontWeight={900} color="white" lineHeight={1}>
                        {SAMPLE.points.toLocaleString()}
                    </Text>
                    <Text fontSize="10px" fontWeight={800} color="whiteAlpha.700" letterSpacing="0.12em">
                        PTS
                    </Text>
                </HStack>
                <Text fontSize="10px" color="whiteAlpha.600" fontFamily="mono" letterSpacing="0.04em">
                    ♠ {truncated}
                </Text>
            </Box>

            {/* Tier chip — top-right */}
            <HStack
                position="absolute"
                top="14px"
                right="14px"
                spacing="5px"
                px="13px"
                py="5px"
                borderRadius="full"
                bg="rgba(0,0,0,0.62)"
                border="1.5px solid"
                borderColor={SAMPLE.tierColor}
                boxShadow={`0 0 10px ${SAMPLE.tierColor}55`}
            >
                <Icon
                    as={FaCrown}
                    color={SAMPLE.tierColor}
                    boxSize="12px"
                    sx={{ filter: `drop-shadow(0 0 4px ${SAMPLE.tierColor})` }}
                />
                <Text
                    fontSize="13px"
                    fontWeight={800}
                    color="white"
                    letterSpacing="0.04em"
                    sx={{ textShadow: `0 0 8px ${SAMPLE.tierColor}` }}
                >
                    {SAMPLE.tierLabel}
                </Text>
            </HStack>

            {/* Rank — bottom-left */}
            <HStack
                position="absolute"
                bottom="14px"
                left="16px"
                spacing="4px"
                align="baseline"
            >
                <Text
                    fontSize="20px"
                    fontWeight={900}
                    color="brand.yellow"
                    lineHeight={1}
                    sx={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                >
                    #
                </Text>
                <Text
                    fontSize="54px"
                    fontWeight={900}
                    color="brand.yellow"
                    lineHeight={1}
                    letterSpacing="-3px"
                    sx={{ textShadow: '0 2px 12px rgba(0,0,0,0.55)' }}
                >
                    {SAMPLE.rank}
                </Text>
                <Text
                    fontSize="13px"
                    fontWeight={600}
                    color="whiteAlpha.900"
                    pb="5px"
                    sx={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
                >
                    {ordinalSuffix(SAMPLE.rank)} place
                </Text>
            </HStack>

            {/* Logo — bottom-right */}
            <HStack
                position="absolute"
                bottom="14px"
                right="14px"
                spacing="7px"
                align="center"
            >
                <Box
                    w="20px"
                    h="20px"
                    borderRadius="full"
                    bg="brand.green"
                    sx={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))' }}
                />
                <Text
                    fontSize="11px"
                    fontWeight={700}
                    color="white"
                    letterSpacing="0.08em"
                    sx={{ textShadow: '0 1px 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.4)' }}
                >
                    STACKED POKER
                </Text>
            </HStack>
        </Box>
    );
};

/* -------------------------------------------------------------------------- */
/*  Shared modal title row                                                    */
/* -------------------------------------------------------------------------- */

const ModalTitleRow: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const titleColor = useColorModeValue('text.primary', 'whiteAlpha.900');
    const closeColor = useColorModeValue('text.secondary', 'whiteAlpha.700');
    return (
        <HStack justify="space-between" align="center" w="full" px={1} pb={3}>
            <Text fontSize="md" fontWeight={700} color={titleColor} letterSpacing="-0.01em">
                Share your rank
            </Text>
            <IconButton
                aria-label="Close"
                icon={<Icon as={FaTimes} boxSize="12px" />}
                size="sm"
                variant="ghost"
                color={closeColor}
                onClick={onClose}
                borderRadius="full"
            />
        </HStack>
    );
};

/* -------------------------------------------------------------------------- */
/*  Saved-confirmation chip (replaces the emoji hint)                          */
/* -------------------------------------------------------------------------- */

const SavedChip: React.FC = () => {
    const bg = useColorModeValue('rgba(54, 163, 123, 0.10)', 'rgba(54, 163, 123, 0.18)');
    const fg = useColorModeValue('brand.green', 'brand.green');
    return (
        <HStack
            spacing={1.5}
            px={2.5}
            py={1}
            borderRadius="full"
            bg={bg}
            alignSelf="center"
        >
            <Icon as={FaCheck} boxSize="10px" color={fg} />
            <Text fontSize="2xs" fontWeight={700} color={fg} letterSpacing="0.04em">
                Image saved. Add it to your post.
            </Text>
        </HStack>
    );
};

/* -------------------------------------------------------------------------- */
/*  Tactile chip — local recipe for telegram + chrome (mode-aware), aligned   */
/*  with §10 of CHAKRA.md. Used by Direction A and B.                          */
/* -------------------------------------------------------------------------- */

const X_TONE = {
    bg: '#0F1419',
    bgHover: '#0F1419',
    bgPress: '#000000',
    edge: '#000000',
    fg: 'white',
};

const TG_TONE = {
    bg: '#0088CC',
    bgHover: '#0088CC',
    bgPress: '#0077B5',
    edge: '#006A9D',
    fg: 'white',
};

type Tone = typeof X_TONE;

const SolidTactileButton: React.FC<{
    tone: Tone;
    leftIcon: React.ReactElement;
    children: React.ReactNode;
    onClick?: () => void;
    height?: string;
    flex?: number | string;
    width?: string;
}> = ({ tone, leftIcon, children, onClick, height = '44px', flex, width }) => (
    <Button
        leftIcon={leftIcon}
        onClick={onClick}
        flex={flex}
        width={width}
        height={height}
        borderRadius="10px"
        fontWeight={700}
        letterSpacing="0.02em"
        fontSize="sm"
        color={tone.fg}
        bg={tone.bg}
        border="none"
        boxShadow={`inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 ${tone.edge}`}
        transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
        _hover={{ bg: tone.bgHover }}
        _active={{
            bg: tone.bgPress,
            transform: 'translateY(2px)',
            boxShadow: `inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 ${tone.edge}`,
        }}
    >
        {children}
    </Button>
);

const ChromeTactileButton: React.FC<{
    leftIcon: React.ReactElement;
    children: React.ReactNode;
    onClick?: () => void;
    height?: string;
    flex?: number | string;
    width?: string;
}> = ({ leftIcon, children, onClick, height = '44px', flex, width }) => {
    const bg = useColorModeValue('#F2F4FA', 'rgba(255,255,255,0.06)');
    const bgHover = useColorModeValue('#E8EBF4', 'rgba(255,255,255,0.10)');
    const bgPress = useColorModeValue('#DCE0EC', 'rgba(255,255,255,0.14)');
    const edge = useColorModeValue('#C9CEDC', 'rgba(0,0,0,0.45)');
    const fg = useColorModeValue('text.primary', 'whiteAlpha.900');
    return (
        <Button
            leftIcon={leftIcon}
            onClick={onClick}
            flex={flex}
            width={width}
            height={height}
            borderRadius="10px"
            fontWeight={700}
            letterSpacing="0.02em"
            fontSize="sm"
            color={fg}
            bg={bg}
            border="none"
            boxShadow={`inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 ${edge}`}
            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
            _hover={{ bg: bgHover }}
            _active={{
                bg: bgPress,
                transform: 'translateY(2px)',
                boxShadow: `inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 ${edge}`,
            }}
        >
            {children}
        </Button>
    );
};

/* -------------------------------------------------------------------------- */
/*  Direction A — Tactile chip row                                             */
/* -------------------------------------------------------------------------- */

const DirectionA: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [saved, setSaved] = useState(false);
    return (
        <VStack spacing={3} align="stretch" w="full">
            <ModalTitleRow onClose={onClose} />
            <FaithfulShareCard />
            <Stack
                direction={{ base: 'column', sm: 'row' }}
                spacing={2}
                w="full"
                pt={1}
            >
                <SolidTactileButton
                    tone={X_TONE}
                    leftIcon={<Icon as={FaXTwitter} boxSize="14px" />}
                    flex={1}
                >
                    Post on X
                </SolidTactileButton>
                <SolidTactileButton
                    tone={TG_TONE}
                    leftIcon={<Icon as={FaTelegram} boxSize="14px" />}
                    flex={1}
                >
                    Send
                </SolidTactileButton>
                <ChromeTactileButton
                    leftIcon={<Icon as={FaDownload} boxSize="13px" />}
                    flex={1}
                    onClick={() => setSaved(true)}
                >
                    Save image
                </ChromeTactileButton>
            </Stack>
            {saved && <SavedChip />}
        </VStack>
    );
};

/* -------------------------------------------------------------------------- */
/*  Direction B — Primary + secondary hierarchy                                */
/* -------------------------------------------------------------------------- */

const DirectionB: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [saved, setSaved] = useState(false);
    return (
        <VStack spacing={3} align="stretch" w="full">
            <ModalTitleRow onClose={onClose} />
            <FaithfulShareCard />
            <VStack spacing={2} pt={1} align="stretch">
                <SolidTactileButton
                    tone={X_TONE}
                    leftIcon={<Icon as={FaXTwitter} boxSize="15px" />}
                    width="100%"
                    height="48px"
                >
                    Post on X
                </SolidTactileButton>
                <SimpleGrid columns={2} spacing={2}>
                    <ChromeTactileButton
                        leftIcon={
                            <Icon as={FaTelegram} boxSize="14px" color="brand.telegram" />
                        }
                        height="40px"
                    >
                        Send
                    </ChromeTactileButton>
                    <ChromeTactileButton
                        leftIcon={<Icon as={FaDownload} boxSize="13px" />}
                        height="40px"
                        onClick={() => setSaved(true)}
                    >
                        Save
                    </ChromeTactileButton>
                </SimpleGrid>
            </VStack>
            {saved && <SavedChip />}
        </VStack>
    );
};

/* -------------------------------------------------------------------------- */
/*  Direction C — Card-as-canvas + sticky icon footer                          */
/* -------------------------------------------------------------------------- */

const DirectionC: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const footerBg = useColorModeValue(
        'rgba(245, 247, 252, 0.92)',
        'rgba(11, 20, 48, 0.55)',
    );
    const footerBorder = useColorModeValue(
        'rgba(11, 20, 48, 0.06)',
        'rgba(255,255,255,0.06)',
    );
    const downloadBg = useColorModeValue('#F2F4FA', 'rgba(255,255,255,0.08)');
    const downloadBgHover = useColorModeValue('#E8EBF4', 'rgba(255,255,255,0.14)');
    const downloadBgPress = useColorModeValue('#DCE0EC', 'rgba(255,255,255,0.18)');
    const downloadEdge = useColorModeValue('#C9CEDC', 'rgba(0,0,0,0.45)');
    const downloadFg = useColorModeValue('text.primary', 'whiteAlpha.900');

    return (
        <VStack spacing={4} align="stretch" w="full">
            <ModalTitleRow onClose={onClose} />
            <Box px={2} pb={2}>
                <FaithfulShareCard height="230px" lifted />
            </Box>
            <Box
                bg={footerBg}
                borderTop="1px solid"
                borderColor={footerBorder}
                mx={-4}
                mb={-4}
                px={4}
                py={3}
                backdropFilter="blur(8px)"
            >
                <HStack spacing={3} justify="center">
                    <Tooltip label="Post on X" placement="top" hasArrow openDelay={200}>
                        <Box>
                            <SocialIconButton tone="x" chipSize="md" aria-label="Post on X" />
                        </Box>
                    </Tooltip>
                    <Tooltip label="Send to Telegram" placement="top" hasArrow openDelay={200}>
                        <Box>
                            <SocialIconButton
                                tone="telegram"
                                chipSize="md"
                                aria-label="Send to Telegram"
                            />
                        </Box>
                    </Tooltip>
                    <Tooltip label="Save image" placement="top" hasArrow openDelay={200}>
                        <IconButton
                            aria-label="Save image"
                            icon={<Icon as={FaDownload} boxSize="14px" />}
                            w="40px"
                            h="40px"
                            minW="40px"
                            borderRadius="10px"
                            color={downloadFg}
                            bg={downloadBg}
                            border="none"
                            boxShadow={`inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 0 ${downloadEdge}`}
                            transition="transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease"
                            _hover={{ bg: downloadBgHover }}
                            _active={{
                                bg: downloadBgPress,
                                transform: 'translateY(2px)',
                                boxShadow: `inset 0 2px 4px rgba(0,0,0,0.18), 0 0 0 ${downloadEdge}`,
                            }}
                        />
                    </Tooltip>
                </HStack>
            </Box>
        </VStack>
    );
};

/* -------------------------------------------------------------------------- */
/*  Storybook frame — renders all three directions in a real Modal at a        */
/*  given size, against the production overlay color.                          */
/* -------------------------------------------------------------------------- */

type DirectionKey = 'A' | 'B' | 'C';

const DIRECTION_LABEL: Record<DirectionKey, string> = {
    A: 'A — Tactile chip row',
    B: 'B — Primary + secondary',
    C: 'C — Card-as-canvas + sticky CTA',
};

const InlineModalFrame: React.FC<{
    direction: DirectionKey;
    width: string;
}> = ({ direction, width }) => {
    const [open, setOpen] = useState(true);
    const labelColor = useColorModeValue('text.secondary', 'whiteAlpha.700');

    return (
        <VStack spacing={3} align="stretch">
            <Text
                fontSize="2xs"
                fontWeight={700}
                letterSpacing="0.12em"
                textTransform="uppercase"
                color={labelColor}
                textAlign="center"
            >
                {DIRECTION_LABEL[direction]}
            </Text>
            <Box
                position="relative"
                w={width}
                minH="520px"
                borderRadius="20px"
                overflow="hidden"
                bg="rgba(11, 20, 48, 0.65)"
                backdropFilter="blur(8px)"
                p={6}
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                {!open && (
                    <Button
                        size="sm"
                        variant="tactileChrome"
                        onClick={() => setOpen(true)}
                    >
                        Reopen modal
                    </Button>
                )}
                {/* Real Modal so the spike is honest about z-index, focus, etc. */}
                <Modal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    isCentered
                    size="md"
                    blockScrollOnMount={false}
                    trapFocus={false}
                    autoFocus={false}
                >
                    <ModalOverlay
                        backdropFilter="blur(8px)"
                        bg="rgba(11, 20, 48, 0.65)"
                    />
                    <ModalContent
                        bg="card.white"
                        borderRadius="20px"
                        boxShadow="0 24px 48px rgba(0,0,0,0.25)"
                        _dark={{ boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
                        p={0}
                        mx={4}
                        maxW={width}
                        overflow="hidden"
                    >
                        <ModalBody p={4}>
                            {direction === 'A' && (
                                <DirectionA onClose={() => setOpen(false)} />
                            )}
                            {direction === 'B' && (
                                <DirectionB onClose={() => setOpen(false)} />
                            )}
                            {direction === 'C' && (
                                <DirectionC onClose={() => setOpen(false)} />
                            )}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Box>
        </VStack>
    );
};

const SideBySide: React.FC<{ width: string }> = ({ width }) => {
    const pageBg = useColorModeValue('#F5F7FC', '#0B1430');
    return (
        <Box bg={pageBg} minH="100vh" p={{ base: 4, md: 8 }}>
            <Stack
                direction={{ base: 'column', xl: 'row' }}
                spacing={8}
                align="flex-start"
                justify="center"
            >
                <InlineModalFrame direction="A" width={width} />
                <InlineModalFrame direction="B" width={width} />
                <InlineModalFrame direction="C" width={width} />
            </Stack>
        </Box>
    );
};

/* -------------------------------------------------------------------------- */
/*  Stories                                                                   */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof SideBySide> = {
    title: 'Design Spikes / Leaderboard — Share Rank Modal',
    component: SideBySide,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Three alternative redesigns of the Leaderboard "Share Rank" modal action row, presented side-by-side over the production overlay backdrop. Toggle the Storybook theme to assess both modes.',
            },
        },
    },
};
export default meta;

type Story = StoryObj<typeof SideBySide>;

export const Desktop: Story = {
    name: 'Desktop — 480px modal',
    render: () => <SideBySide width="480px" />,
};

export const Mobile: Story = {
    name: 'Mobile — 360px modal',
    render: () => <SideBySide width="360px" />,
};
