'use client';

import { Box, CloseButton, Flex, Icon, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IconType } from 'react-icons';
import {
    MdCheckCircle,
    MdError,
    MdInfo,
    MdWarning,
} from 'react-icons/md';

export type ToastBannerVariant = 'success' | 'error' | 'warning' | 'info';

const variantConfig: Record<
    ToastBannerVariant,
    { bg: string; icon: IconType }
> = {
    success: { bg: 'brand.green', icon: MdCheckCircle },
    error: { bg: 'brand.pink', icon: MdError },
    warning: { bg: 'brand.yellowDark', icon: MdWarning },
    info: { bg: 'brand.navy', icon: MdInfo },
};

const slideDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-100%); opacity: 0; }
`;

type Props = {
    variant: ToastBannerVariant;
    title: string;
    description?: string;
    onClose: () => void;
    autoCloseMs?: number;
    animationMs?: number;
};

export default function ToastBanner({
    variant,
    title,
    description,
    onClose,
    autoCloseMs = 3000,
    animationMs = 180,
}: Props) {
    const config = variantConfig[variant];
    const [isClosing, setIsClosing] = useState(false);
    const closeTimeoutRef = useRef<number | null>(null);
    const animationTimeoutRef = useRef<number | null>(null);

    const handleClose = () => {
        if (isClosing) return;
        setIsClosing(true);
        if (animationTimeoutRef.current) {
            window.clearTimeout(animationTimeoutRef.current);
        }
        animationTimeoutRef.current = window.setTimeout(() => {
            onClose();
        }, animationMs);
    };

    const animation = useMemo(() => {
        const keyframe = isClosing ? slideUp : slideDown;
        return `${keyframe} ${animationMs}ms ease-out`;
    }, [animationMs, isClosing]);

    useEffect(() => {
        if (!autoCloseMs) return;
        closeTimeoutRef.current = window.setTimeout(() => {
            handleClose();
        }, autoCloseMs);

        return () => {
            if (closeTimeoutRef.current) {
                window.clearTimeout(closeTimeoutRef.current);
            }
            if (animationTimeoutRef.current) {
                window.clearTimeout(animationTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoCloseMs]);

    return (
        <Box
            width="100%"
            bg={config.bg}
            color="white"
            boxShadow="0 10px 22px rgba(0, 0, 0, 0.18)"
            animation={animation}
            position="relative"
            willChange="transform, opacity"
            sx={{ animationFillMode: 'forwards' }}
        >
            <Flex
                align="center"
                justify="center"
                width="100%"
                px={{ base: 4, md: 6 }}
                py={2.5}
                gap={4}
            >
                <Icon
                    aria-hidden
                    as={config.icon}
                    boxSize={5}
                    color="inherit"
                    position="absolute"
                    left={{ base: 4, md: 6 }}
                    top="50%"
                    transform="translateY(-50%)"
                />

                <Box minWidth={0} textAlign="center" px="44px">
                    <Text
                        fontWeight="bold"
                        fontSize={{ base: 'sm', md: 'sm' }}
                        lineHeight="short"
                        noOfLines={1}
                        color="inherit"
                    >
                        {title}
                    </Text>
                    {description ? (
                        <Text
                            fontSize={{ base: 'xs', md: 'sm' }}
                            opacity={0.92}
                            lineHeight="short"
                            noOfLines={1}
                            color="inherit"
                        >
                            {description}
                        </Text>
                    ) : null}
                </Box>

                <CloseButton
                    aria-label="Close notification"
                    onClick={handleClose}
                    size="sm"
                    borderRadius="full"
                    position="absolute"
                    right={{ base: 4, md: 6 }}
                    top="50%"
                    transform="translateY(-50%)"
                    color="inherit"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.16)' }}
                />
            </Flex>
        </Box>
    );
}
