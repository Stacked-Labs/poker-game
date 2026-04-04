'use client';

import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    VStack,
    HStack,
    Input,
    Button,
    Icon,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { MdArrowForward, MdCheck } from 'react-icons/md';
import FloatingDecor from './FloatingDecor';
import NewsletterSuccessModal from './NewsletterSuccessModal';
import useToastHelper from '@/app/hooks/useToastHelper';

const TRANSITION_SMOOTH = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

const NewsletterSection = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose } = useDisclosure();
    const toast = useToastHelper();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setIsSubmitted(true);
                setEmail('');
                toast.success('You\'re in!', 'Check your inbox for updates.');
                onSuccessOpen();
                // Reset success message after 5 seconds
                setTimeout(() => setIsSubmitted(false), 5000);
            } else {
                toast.error('Couldn\'t subscribe', 'Please try again in a moment.');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            toast.error('Something went wrong', 'Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            bg="bg.default"
            py={{ base: 2, md: 4 }}
            width="100%"
            position="relative"
            overflow="hidden"
        >
            <FloatingDecor density="light" />
            <Container maxW="container.xl" position="relative" zIndex={1}>
                <Box
                    position="relative"
                    borderRadius={{ base: '24px', md: '40px' }}
                    bg="#073d2a"
                    p={{ base: 8, md: 12, lg: 14 }}
                    overflow="hidden"
                    boxShadow="0 20px 80px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                    role="group"
                    border="3px solid"
                    borderColor="#0d5e3f"
                    transition={TRANSITION_SMOOTH}
                    _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow:
                            '0 30px 100px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                    }}
                >
                    {/* Felt Texture — dense noise pattern */}
                    <Box
                        position="absolute"
                        inset={0}
                        opacity="0.3"
                        pointerEvents="none"
                        backgroundImage="radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 0.5px, transparent 0.5px)"
                        backgroundSize="4px 4px"
                    />

                    {/* Secondary felt texture layer for depth */}
                    <Box
                        position="absolute"
                        inset={0}
                        opacity="0.15"
                        pointerEvents="none"
                        backgroundImage="radial-gradient(circle at 2px 2px, rgba(0, 0, 0, 0.2) 0.5px, transparent 0.5px)"
                        backgroundSize="7px 7px"
                    />

                    {/* Spotlight — overhead lamp effect */}
                    <Box
                        position="absolute"
                        inset={0}
                        bgGradient="radial(ellipse at 50% -30%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 40%, transparent 70%)"
                        pointerEvents="none"
                    />

                    {/* Subtle vignette for depth */}
                    <Box
                        position="absolute"
                        inset={0}
                        boxShadow="inset 0 0 120px rgba(0, 0, 0, 0.5)"
                        pointerEvents="none"
                        borderRadius="inherit"
                    />

                    {/* Rail highlight — top edge shine */}
                    <Box
                        position="absolute"
                        top={0}
                        left="10%"
                        right="10%"
                        h="1px"
                        bgGradient="linear(to-r, transparent, rgba(255, 255, 255, 0.12), transparent)"
                        pointerEvents="none"
                    />

                    <Flex
                        direction={{ base: 'column', lg: 'row' }}
                        justify="space-between"
                        align={{ base: 'flex-start', lg: 'center' }}
                        gap={{ base: 10, lg: 16 }}
                        position="relative"
                        zIndex={1}
                    >
                        {/* Text Content */}
                        <VStack align="start" spacing={6} maxW="2xl">
                            <HStack spacing={3}>
                                <Flex align="center" gap={2}>
                                    <Box
                                        w="8px"
                                        h="8px"
                                        borderRadius="full"
                                        bg="brand.green"
                                        boxShadow="0 0 10px rgba(54, 163, 123, 0.6), 0 0 30px rgba(54, 163, 123, 0.2)"
                                        sx={{
                                            animation: 'pulse-glow 2.5s ease-in-out infinite',
                                            '@keyframes pulse-glow': {
                                                '0%, 100%': { opacity: 1 },
                                                '50%': { opacity: 0.6 },
                                            },
                                        }}
                                    />
                                </Flex>
                                <Text
                                    color="brand.green"
                                    fontSize="xs"
                                    fontWeight="extrabold"
                                    letterSpacing="0.25em"
                                    textTransform="uppercase"
                                >
                                    Members Only
                                </Text>
                            </HStack>

                            <Heading
                                color="white"
                                fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
                                fontWeight="extrabold"
                                lineHeight={1.05}
                                letterSpacing="-0.04em"
                            >
                                A Seat is{' '}
                                <Box
                                    as="span"
                                    bgGradient="linear(135deg, brand.yellow, brand.pink)"
                                    bgClip="text"
                                    sx={{ WebkitTextFillColor: 'transparent' }}
                                >
                                    Waiting
                                </Box>{' '}
                                For You
                            </Heading>

                            <Text
                                color="whiteAlpha.700"
                                fontSize={{ base: 'md', md: 'lg' }}
                                lineHeight="tall"
                                fontWeight="medium"
                                maxW="lg"
                            >
                                The world&apos;s funnest digital poker party.
                                Big pots, bigger personalities. Get invites to
                                private games and dev Q&As.
                            </Text>
                        </VStack>

                        {/* Tear Line Separator */}
                        <Box
                            h={{ base: '2px', lg: '220px' }}
                            w={{ base: '100%', lg: '2px' }}
                            position="relative"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                        >
                            <Box
                                h="100%"
                                w="100%"
                                borderLeft={{ base: 'none', lg: '2px dashed' }}
                                borderBottom={{
                                    base: '2px dashed',
                                    lg: 'none',
                                }}
                                borderColor="whiteAlpha.300"
                            />
                            {/* Punch Holes */}
                            <Box
                                position="absolute"
                                top={{ base: '-10px', lg: '-10px' }}
                                left={{ base: '50%', lg: '50%' }}
                                transform="translateX(-50%)"
                                w="20px"
                                h="20px"
                                bg="#052c1e"
                                borderRadius="full"
                                border="1.5px solid"
                                borderColor="whiteAlpha.150"
                                boxShadow="inset 0 2px 6px rgba(0, 0, 0, 0.6)"
                            />
                            <Box
                                position="absolute"
                                bottom={{ base: '-10px', lg: '-10px' }}
                                left={{ base: '50%', lg: '50%' }}
                                transform="translateX(-50%)"
                                w="20px"
                                h="20px"
                                bg="#052c1e"
                                borderRadius="full"
                                border="1.5px solid"
                                borderColor="whiteAlpha.150"
                                boxShadow="inset 0 2px 6px rgba(0, 0, 0, 0.6)"
                            />
                        </Box>

                        {/* Form Section — Ticket Stub */}
                        <VStack
                            align={{ base: 'stretch', lg: 'flex-end' }}
                            spacing={5}
                            w={{ base: '100%', lg: 'sm' }}
                        >
                            {/* Ticket header */}
                            <Text
                                color="whiteAlpha.500"
                                fontSize="2xs"
                                fontWeight="bold"
                                letterSpacing="0.2em"
                                textTransform="uppercase"
                                textAlign={{ base: 'left', lg: 'right' }}
                            >
                                Admit One
                            </Text>

                            <VStack
                                as="form"
                                onSubmit={handleSubmit}
                                w="100%"
                                spacing={3}
                                align="stretch"
                            >
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    variant="unstyled"
                                    color="white"
                                    px={5}
                                    height="52px"
                                    fontSize="sm"
                                    fontWeight="medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting || isSubmitted}
                                    bg="rgba(255, 255, 255, 0.08)"
                                    borderRadius="14px"
                                    border="1.5px solid"
                                    borderColor={isSubmitted ? 'brand.green' : 'whiteAlpha.200'}
                                    transition={TRANSITION_SMOOTH}
                                    _placeholder={{
                                        color: 'whiteAlpha.400',
                                    }}
                                    _hover={{
                                        borderColor: isSubmitted ? 'brand.green' : 'whiteAlpha.400',
                                        bg: 'rgba(255, 255, 255, 0.10)',
                                    }}
                                    _focus={{
                                        borderColor: 'brand.green',
                                        bg: 'rgba(255, 255, 255, 0.12)',
                                        boxShadow: '0 0 0 3px rgba(54, 163, 123, 0.15)',
                                    }}
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="unstyled"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bgGradient={
                                        isSubmitted
                                            ? 'linear(to-r, brand.green, rgba(54, 163, 123, 0.85))'
                                            : 'linear(to-r, brand.green, rgba(54, 163, 123, 0.85))'
                                    }
                                    color="white"
                                    px={8}
                                    height="52px"
                                    width="100%"
                                    borderRadius="14px"
                                    fontSize="sm"
                                    fontWeight="bold"
                                    textTransform="uppercase"
                                    letterSpacing="0.08em"
                                    boxShadow="0 4px 14px rgba(54, 163, 123, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                                    transition={TRANSITION_SMOOTH}
                                    disabled={isSubmitting || isSubmitted}
                                    _hover={{
                                        bgGradient:
                                            'linear(to-r, rgba(54, 163, 123, 0.95), rgba(54, 163, 123, 0.78))',
                                        boxShadow:
                                            '0 8px 24px rgba(54, 163, 123, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                                        transform: 'translateY(-1px)',
                                    }}
                                    _active={{
                                        transform: 'translateY(0) scale(0.98)',
                                        boxShadow:
                                            '0 2px 8px rgba(54, 163, 123, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                    }}
                                    gap={2}
                                >
                                    {isSubmitting
                                        ? 'Saving...'
                                        : isSubmitted
                                        ? 'Saved!'
                                        : 'Save My Seat'}
                                    <Icon
                                        as={isSubmitted ? MdCheck : MdArrowForward}
                                        boxSize={4}
                                        transition={TRANSITION_SMOOTH}
                                    />
                                </Button>
                            </VStack>

                            {/* Privacy note */}
                            <Text
                                color="whiteAlpha.300"
                                fontSize="2xs"
                                textAlign={{ base: 'left', lg: 'right' }}
                            >
                                No spam. Unsubscribe anytime.
                            </Text>
                        </VStack>
                    </Flex>
                </Box>
            </Container>

            <NewsletterSuccessModal isOpen={isSuccessOpen} onClose={onSuccessClose} />
        </Box>
    );
};

export default NewsletterSection;
