'use client';

import React from 'react';
import {
    Button,
    CloseButton,
    HStack,
    Icon,
    Text,
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaXTwitter } from 'react-icons/fa6';

interface ConnectXPromptProps {
    isOpen: boolean;
    onConnect: () => void;
    onDismiss: () => void;
}

const motionProps = {
    initial: { opacity: 0, y: 6, scale: 0.94 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 6, scale: 0.94 },
    transition: { type: 'spring' as const, stiffness: 380, damping: 24 },
};

const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 'calc(100% + 10px)',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 30,
    pointerEvents: 'auto',
};

// X-brand button — matches the Settings/ConnectXSection recipe so every X button in the app feels like one component.
const X_BG = '#0A0B12';
const XButtonProps = {
    bg: X_BG,
    color: 'white',
    border: 'none',
    fontWeight: 700,
    letterSpacing: '0.02em',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 #000000',
    transition:
        'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease',
    _hover: { bg: X_BG, color: 'white' },
    _active: {
        bg: '#000000',
        color: 'white',
        transform: 'translateY(1.5px)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.30), 0 0 0 #000000',
    },
    _focus: { color: 'white' },
} as const;

const ConnectXPrompt: React.FC<ConnectXPromptProps> = ({
    isOpen,
    onConnect,
    onDismiss,
}) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div key="x-prompt" {...motionProps} style={wrapperStyle}>
                <HStack
                    spacing={2.5}
                    bg="card.white"
                    borderRadius="full"
                    boxShadow="0 12px 28px rgba(12, 21, 49, 0.18), 0 0 0 1px rgba(11, 20, 48, 0.06)"
                    _dark={{
                        boxShadow:
                            '0 14px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)',
                    }}
                    pl={3}
                    pr={1.5}
                    py={1.5}
                >
                    <Text
                        fontSize="xs"
                        fontWeight={700}
                        color="text.primary"
                        whiteSpace="nowrap"
                    >
                        Get social. Earn more.
                    </Text>
                    <Button
                        {...XButtonProps}
                        onClick={onConnect}
                        size="xs"
                        h="26px"
                        borderRadius="full"
                        px={3}
                        leftIcon={
                            <Icon as={FaXTwitter} boxSize={2.5} color="white" />
                        }
                    >
                        <Text
                            as="span"
                            fontWeight={800}
                            color="white"
                            fontSize="xs"
                        >
                            Link
                        </Text>
                    </Button>
                    <CloseButton
                        size="sm"
                        color="text.secondary"
                        _hover={{ color: 'text.primary', bg: 'card.lightGray' }}
                        onClick={onDismiss}
                        aria-label="Dismiss"
                    />
                </HStack>
            </motion.div>
        )}
    </AnimatePresence>
);

export default ConnectXPrompt;
