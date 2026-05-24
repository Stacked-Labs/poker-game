'use client';

import React, { useEffect, useState } from 'react';
import {
    Button,
    CloseButton,
    HStack,
    Icon,
    Text,
} from '@chakra-ui/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BsBarChartLineFill } from 'react-icons/bs';
import { getConsent, setConsent } from '@/app/utils/analytics';

const GREEN_BG = 'brand.green';
const AllowButtonProps = {
    bg: GREEN_BG,
    color: 'white',
    border: 'none',
    fontWeight: 700,
    letterSpacing: '0.02em',
    boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.18), 0 1.5px 0 var(--chakra-colors-brand-greenDark)',
    transition:
        'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease',
    _hover: { bg: GREEN_BG, color: 'white' },
    _active: {
        bg: 'brand.greenDark',
        color: 'white',
        transform: 'translateY(1.5px)',
        boxShadow:
            'inset 0 2px 4px rgba(0,0,0,0.20), 0 0 0 var(--chakra-colors-brand-greenDark)',
    },
    _focus: { color: 'white' },
} as const;

const motionProps = {
    initial: { opacity: 0, y: 14, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 6, scale: 0.96 },
    transition: { type: 'spring' as const, stiffness: 380, damping: 24 },
};

const reducedMotionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.18 },
};

export function ConsentBanner() {
    const [show, setShow] = useState(false);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        if (getConsent() === null) setShow(true);
    }, []);

    const choose = (value: 'granted' | 'declined') => {
        setConsent(value);
        setShow(false);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="analytics-consent"
                    {...(reduceMotion ? reducedMotionProps : motionProps)}
                    style={{
                        position: 'fixed',
                        bottom: 'env(safe-area-inset-bottom, 0px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '16px',
                        zIndex: 1500,
                        pointerEvents: 'auto',
                        maxWidth: 'calc(100vw - 24px)',
                    }}
                >
                    <HStack
                        spacing={{ base: 2, sm: 3 }}
                        bg="card.white"
                        borderRadius="full"
                        boxShadow="0 12px 28px rgba(12, 21, 49, 0.18), 0 0 0 1px rgba(11, 20, 48, 0.06)"
                        _dark={{
                            boxShadow:
                                '0 14px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)',
                        }}
                        pl={{ base: 3, sm: 4 }}
                        pr={1.5}
                        py={1.5}
                        role="dialog"
                        aria-modal="false"
                        aria-labelledby="consent-banner-title"
                    >
                        <Icon
                            as={BsBarChartLineFill}
                            boxSize={3.5}
                            color="brand.green"
                            flexShrink={0}
                            aria-hidden
                        />
                        <Text
                            id="consent-banner-title"
                            fontSize="xs"
                            fontWeight={700}
                            color="text.primary"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                        >
                            Help shape Stacked.
                            <Text
                                as="span"
                                ml={1.5}
                                fontWeight={500}
                                color="text.secondary"
                                display={{ base: 'none', sm: 'inline' }}
                            >
                                Anonymous analytics.
                            </Text>
                        </Text>
                        <Button
                            {...AllowButtonProps}
                            onClick={() => choose('granted')}
                            size="xs"
                            h="26px"
                            borderRadius="full"
                            px={3}
                            flexShrink={0}
                        >
                            <Text
                                as="span"
                                fontWeight={800}
                                color="white"
                                fontSize="xs"
                            >
                                Allow
                            </Text>
                        </Button>
                        <CloseButton
                            size="sm"
                            color="text.secondary"
                            _hover={{
                                color: 'text.primary',
                                bg: 'card.lightGray',
                            }}
                            onClick={() => choose('declined')}
                            aria-label="Decline analytics"
                        />
                    </HStack>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
