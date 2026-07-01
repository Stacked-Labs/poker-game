import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, HStack, IconButton, Icon } from '@chakra-ui/react';
import { FiSettings, FiMenu } from 'react-icons/fi';
import HomeButton from './HomeButton';

// The Home button is the new top-left "back to lobby" chip on /table pages. These
// stories show it in isolation and in its real cluster context (Home + burger +
// Settings) over the actual table backdrop, at desktop + phone widths, so the
// placement and the tactileChromeSolid styling can be reviewed in both modes.

const meta = {
    title: 'Table/NavBar/HomeButton',
    component: HomeButton,
    parameters: {
        layout: 'fullscreen',
        nextjs: { appDirectory: true },
    },
} satisfies Meta<typeof HomeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// A stand-in for the sibling chips (real Settings/burger need socket + handlers).
function Chip({ icon, label }: { icon: typeof FiSettings; label: string }) {
    return (
        <IconButton
            icon={<Icon as={icon} boxSize={{ base: 4, md: 5 }} />}
            aria-label={label}
            variant="tactileChromeSolid"
            size="md"
            px={2}
            py={2}
            width={{ base: '40px', sm: '40px', md: '48px' }}
            height={{ base: '40px', sm: '40px', md: '48px' }}
        />
    );
}

function TableStage({
    children,
    orientation = 'horizontal',
    width = '820px',
    height = '500px',
}: {
    children: React.ReactNode;
    orientation?: 'horizontal' | 'vertical';
    width?: string;
    height?: string;
}) {
    const img =
        orientation === 'horizontal'
            ? '/table-horizontal-green.webp'
            : '/table-vertical-green.webp';
    return (
        <Box
            bg="bg.letterbox"
            p={6}
            minH="560px"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <Box
                position="relative"
                width={width}
                height={height}
                sx={{
                    backgroundImage: `url(${img})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                }}
            >
                {/* top-left cluster, where the real table navbar sits */}
                <Box position="absolute" top="5%" left="4%">
                    {children}
                </Box>
            </Box>
        </Box>
    );
}

// Just the chip, on a neutral ground.
export const Button: Story = {
    render: () => (
        <Box bg="bg.letterbox" p={10} display="flex" justifyContent="center">
            <HomeButton />
        </Box>
    ),
};

// Desktop: Home + Settings, top-left over the felt.
export const NavClusterDesktop: Story = {
    render: () => (
        <TableStage>
            <HStack spacing={2} alignItems="stretch">
                <HomeButton />
                <Chip icon={FiSettings} label="Settings" />
            </HStack>
        </TableStage>
    ),
};

// Portrait: Home + burger + Settings, top-left over the felt.
export const NavClusterMobile: Story = {
    render: () => (
        <TableStage orientation="vertical" width="360px" height="580px">
            <HStack spacing={1} alignItems="stretch">
                <HomeButton />
                <Chip icon={FiMenu} label="Menu" />
                <Chip icon={FiSettings} label="Settings" />
            </HStack>
        </TableStage>
    ),
};
