'use client';

import { KeyboardEvent } from 'react';
import {
    Box,
    Flex,
    HStack,
    Image,
    SimpleGrid,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { FiUsers } from 'react-icons/fi';
import ExternalLink from '@/app/components/ExternalLink';

export type CreateGameMode = 'free' | 'real';

const USDC_BLUE = '#2775CA';
const USDC_BLUE_EDGE = '#1F5FA3';
const GREEN_HEX = '#36A37B';
const GREEN_EDGE = '#1F7A5C';

interface ModeChooserProps {
    selectedMode: CreateGameMode | null;
    onSelect: (mode: CreateGameMode) => void;
}

export default function ModeChooser({
    selectedMode,
    onSelect,
}: ModeChooserProps) {
    const cardBg = useColorModeValue('card.white', 'card.darkNavy');
    const idleBorder = useColorModeValue('border.lightGray', 'whiteAlpha.200');
    const restingEdge = useColorModeValue(
        '0 2px 0 rgba(0,0,0,0.06)',
        '0 2px 0 rgba(0,0,0,0.35)'
    );
    const bodyColor = useColorModeValue('text.secondary', 'whiteAlpha.800');

    const greenTintSelected = useColorModeValue(
        'inset 0 0 0 9999px rgba(54,163,123,0.10)',
        'inset 0 0 0 9999px rgba(54,163,123,0.16)'
    );
    const greenTintHover = useColorModeValue(
        'inset 0 0 0 9999px rgba(54,163,123,0.05)',
        'inset 0 0 0 9999px rgba(54,163,123,0.08)'
    );
    const blueTintSelected = useColorModeValue(
        'inset 0 0 0 9999px rgba(39,117,202,0.09)',
        'inset 0 0 0 9999px rgba(39,117,202,0.16)'
    );
    const blueTintHover = useColorModeValue(
        'inset 0 0 0 9999px rgba(39,117,202,0.05)',
        'inset 0 0 0 9999px rgba(39,117,202,0.08)'
    );

    const hasSelection = selectedMode !== null;

    return (
        <VStack
            align="stretch"
            spacing={3}
            role="radiogroup"
            aria-label="Play mode"
        >
            <SimpleGrid columns={2} spacing={{ base: 2, md: 4 }}>
                <ModeCard
                    isSelected={selectedMode === 'free'}
                    tabbable={selectedMode === 'free' || !hasSelection}
                    onSelect={() => onSelect('free')}
                    accentColor={GREEN_HEX}
                    accentEdge={GREEN_EDGE}
                    selectedTint={greenTintSelected}
                    hoverTint={greenTintHover}
                    title="Free Play"
                    body="Practice chips, no risk. Play with friends just for the fun of it."
                    icon={
                        <Box
                            as={FiUsers}
                            boxSize="22px"
                            color={GREEN_HEX}
                            aria-hidden
                        />
                    }
                    cardBg={cardBg}
                    idleBorder={idleBorder}
                    restingEdge={restingEdge}
                    bodyColor={bodyColor}
                />
                <ModeCard
                    isSelected={selectedMode === 'real'}
                    tabbable={selectedMode === 'real'}
                    onSelect={() => onSelect('real')}
                    accentColor={USDC_BLUE}
                    accentEdge={USDC_BLUE_EDGE}
                    selectedTint={blueTintSelected}
                    hoverTint={blueTintHover}
                    title="Real Money"
                    body="Stakes in USDC on Base. Settles on-chain in under 5 seconds."
                    proof="Hosts earn 25% of the platform fee."
                    icon={
                        <Image
                            src="/usdc-logo.png"
                            alt=""
                            boxSize="26px"
                            loading="lazy"
                            flexShrink={0}
                        />
                    }
                    cardBg={cardBg}
                    idleBorder={idleBorder}
                    restingEdge={restingEdge}
                    bodyColor={bodyColor}
                />
            </SimpleGrid>
            {selectedMode === 'real' && (
                <Box pl={1}>
                    <ExternalLink
                        href="https://docs.stackedpoker.io"
                        fontSize="xs"
                    >
                        How payouts work
                    </ExternalLink>
                </Box>
            )}
        </VStack>
    );
}

interface ModeCardProps {
    isSelected: boolean;
    tabbable: boolean;
    onSelect: () => void;
    accentColor: string;
    accentEdge: string;
    selectedTint: string;
    hoverTint: string;
    title: string;
    body: string;
    proof?: string;
    icon: React.ReactNode;
    cardBg: string;
    idleBorder: string;
    restingEdge: string;
    bodyColor: string;
}

function ModeCard({
    isSelected,
    tabbable,
    onSelect,
    accentColor,
    accentEdge,
    selectedTint,
    hoverTint,
    title,
    body,
    proof,
    icon,
    cardBg,
    idleBorder,
    restingEdge,
    bodyColor,
}: ModeCardProps) {
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onSelect();
        }
    };

    const selectedShadow = `${selectedTint}, inset 0 1px 0 rgba(255,255,255,0.20), 0 2px 0 ${accentEdge}`;
    const hoverShadow = `${hoverTint}, ${restingEdge}`;

    return (
        <Box
            role="radio"
            aria-checked={isSelected}
            tabIndex={tabbable ? 0 : -1}
            onClick={onSelect}
            onKeyDown={onKeyDown}
            cursor="pointer"
            borderWidth="2px"
            borderColor={isSelected ? accentColor : idleBorder}
            borderRadius="16px"
            bg={cardBg}
            p={{ base: 3, md: 5 }}
            minH={{ base: '108px', md: '128px' }}
            boxShadow={isSelected ? selectedShadow : restingEdge}
            transition="border-color 120ms ease, box-shadow 120ms ease, transform 80ms cubic-bezier(0.2,0.8,0.2,1)"
            _hover={
                isSelected
                    ? {}
                    : { borderColor: accentColor, boxShadow: hoverShadow }
            }
            _focusVisible={{
                outline: '2px solid',
                outlineColor: accentColor,
                outlineOffset: '2px',
            }}
            _active={{
                transform: 'translateY(2px)',
                boxShadow: isSelected
                    ? `${selectedTint}, inset 0 2px 4px rgba(0,0,0,0.14), 0 0 0 ${accentEdge}`
                    : 'inset 0 1px 2px rgba(0,0,0,0.10)',
            }}
        >
            <Flex align="flex-start" gap={3}>
                <Box flexShrink={0} mt="2px">
                    {icon}
                </Box>
                <VStack align="stretch" spacing={1.5} flex="1" minW={0}>
                    <HStack spacing={2} align="center">
                        <Text
                            color="text.primary"
                            fontWeight={700}
                            fontSize="md"
                            lineHeight="1.2"
                        >
                            {title}
                        </Text>
                        {isSelected && (
                            <Box
                                boxSize="8px"
                                borderRadius="full"
                                bg={accentColor}
                                boxShadow={`0 0 0 3px ${accentColor}22`}
                                aria-hidden
                            />
                        )}
                    </HStack>
                    <Text color={bodyColor} fontSize="sm" lineHeight="1.45">
                        {body}
                    </Text>
                    {proof && (
                        <Text
                            mt={1}
                            fontSize="xs"
                            fontWeight={700}
                            letterSpacing="0.01em"
                            color={USDC_BLUE}
                            _dark={{ color: '#7FB4E0' }}
                        >
                            {proof}
                        </Text>
                    )}
                </VStack>
            </Flex>
        </Box>
    );
}
