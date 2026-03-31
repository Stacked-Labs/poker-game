'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal, ModalOverlay } from '@chakra-ui/react';
import GuardModal from './GuardModal';

const meta = {
    title: 'Game/GuardModal',
    component: GuardModal,
    tags: ['autodocs'],
    args: {
        handleFold: () => console.log('handleFold'),
        handleCheck: () => console.log('handleCheck'),
        onClose: () => console.log('onClose'),
    },
    decorators: [
        (Story: React.FC) => (
            <Modal
                isOpen={true}
                onClose={() => console.log('onClose')}
                isCentered
                size="xs"
            >
                <ModalOverlay bg="blackAlpha.400" />
                <Story />
            </Modal>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    'Fold-protection confirmation modal. Shown when a player tries to fold but can check for free instead. Renders a ModalContent — the parent Modal wrapper lives in FooterWithActionButtons.',
            },
        },
    },
} satisfies Meta<typeof GuardModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: 'Default',
};
