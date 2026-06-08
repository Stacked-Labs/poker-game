import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    Box,
    Flex,
    Heading,
    HStack,
    SimpleGrid,
    Text,
    VStack,
} from '@chakra-ui/react';
import type { TemplateName } from './blindStructures';
import {
    TYPE_IDENTITY,
    TournamentDefaultAvatar,
    TournamentDefaultCover,
} from './tournamentDefaults';

// Visual proof for the default branding used when a Host uploads no logo/banner.
// The look matches the create-game type picker: the type's icon in its accent
// color on a faint tinted tile (avatar), and a card-suit wallpaper in the same
// accent over the neutral surface (cover). Reviewers should confirm:
//   • recognizability — bolt/fire/clock/layers + the accent color name the type
//   • restraint — the color is a small accent, never a flood
//   • legibility on a white card AND a dark navy card, in light and dark mode

const TYPES: TemplateName[] = ['hyper', 'turbo', 'regular', 'deep'];

// One detail-hero-style card per type: a suit-wallpaper cover with the type
// avatar straddling its lower edge, exactly as TournamentDetail renders it.
function Specimen({ type }: { type: TemplateName }) {
    const id = TYPE_IDENTITY[type];
    return (
        <VStack
            align="stretch"
            spacing={0}
            borderWidth="1px"
            borderColor="border.lightGray"
            borderRadius="16px"
            overflow="hidden"
            bg="card.white"
            boxShadow="card.lift"
        >
            <Box position="relative" h="104px" overflow="hidden">
                <TournamentDefaultCover type={type} />
            </Box>
            <Box px={3} pb={3}>
                <Box mt="-34px" w="fit-content" borderRadius="16px" borderWidth="3px" borderColor="card.white" bg="card.white" overflow="hidden" lineHeight={0}>
                    <TournamentDefaultAvatar type={type} size={64} />
                </Box>
                <HStack justify="space-between" mt={2}>
                    <Text fontWeight={700} fontSize="sm" color="text.primary">
                        {id.label}
                    </Text>
                    <Text fontSize="2xs" color="text.muted">
                        {id.suit} · NLH
                    </Text>
                </HStack>
            </Box>
        </VStack>
    );
}

function Gallery() {
    return (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
            {TYPES.map((type) => (
                <Specimen key={type} type={type} />
            ))}
        </SimpleGrid>
    );
}

// Avatar size ramp per type — confirms the icon scale + radius hold from a lobby
// chip (32px) up to the detail hero (96px).
function SizeRamp() {
    const sizes = [32, 40, 56, 72, 96];
    return (
        <VStack align="stretch" spacing={3}>
            <Heading size="xs" color="text.primary">
                Avatar size ramp (per type)
            </Heading>
            <VStack align="stretch" spacing={3}>
                {TYPES.map((type) => (
                    <HStack key={type} spacing={4} align="center">
                        <Text w="64px" fontSize="xs" color="text.muted" flexShrink={0}>
                            {TYPE_IDENTITY[type].label}
                        </Text>
                        {sizes.map((s) => (
                            <TournamentDefaultAvatar key={s} type={type} size={s} />
                        ))}
                    </HStack>
                ))}
            </VStack>
        </VStack>
    );
}

function Panel({
    mode,
    children,
}: {
    mode: 'light' | 'dark';
    children: React.ReactNode;
}) {
    // Force semantic tokens to resolve for this subtree by setting Chakra's
    // color-mode class locally, so light and dark can sit side by side.
    return (
        <Box
            className={`chakra-ui-${mode}`}
            flex="1"
            minW="320px"
            bg="bg.charcoal"
            p={{ base: 4, md: 5 }}
        >
            <Text
                fontSize="xs"
                color="text.muted"
                mb={3}
                textTransform="uppercase"
                letterSpacing="0.08em"
            >
                {mode}
            </Text>
            {children}
        </Box>
    );
}

const meta = {
    title: 'Tournament/Foundations/DefaultBranding',
    component: Gallery,
    tags: ['autodocs'],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

// Follows the toolbar light/dark toggle.
export const AllTypes: Story = {
    render: () => (
        <Box p={{ base: 4, md: 6 }} minH="100vh" bg="bg.default">
            <VStack align="stretch" spacing={8}>
                <Box>
                    <Heading size="md" color="text.primary" mb={1}>
                        Tournament default branding
                    </Heading>
                    <Text fontSize="sm" color="text.muted">
                        No upload, no problem: the type’s icon avatar and a
                        card-suit cover wallpaper in the type’s accent color.
                        Matches the create-game type picker.
                    </Text>
                </Box>
                <Gallery />
                <SizeRamp />
            </VStack>
        </Box>
    ),
};

// Light and dark pinned side by side for a single-glance legibility review.
export const BothModes: Story = {
    parameters: { chromatic: { disableSnapshot: false } },
    render: () => (
        <Flex direction={{ base: 'column', lg: 'row' }} minH="100vh">
            <Panel mode="light">
                <Gallery />
            </Panel>
            <Panel mode="dark">
                <Gallery />
            </Panel>
        </Flex>
    ),
};
