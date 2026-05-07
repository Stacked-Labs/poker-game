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
    useDisclosure,
} from '@chakra-ui/react';
import { useState } from 'react';
import { MdArrowForward, MdCheck } from 'react-icons/md';
import NewsletterSuccessModal from './NewsletterSuccessModal';
import useToastHelper from '@/app/hooks/useToastHelper';

const TRANSITION_SMOOTH = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

const NewsletterSection = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const {
        isOpen: isSuccessOpen,
        onOpen: onSuccessOpen,
        onClose: onSuccessClose,
    } = useDisclosure();
    const toast = useToastHelper();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setIsSubmitted(true);
                setEmail('');
                toast.success("You're in!", 'Check your inbox for updates.');
                onSuccessOpen();
                setTimeout(() => setIsSubmitted(false), 5000);
            } else {
                toast.error(
                    "Couldn't subscribe",
                    'Please try again in a moment.'
                );
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            toast.error(
                'Something went wrong',
                'Please check your connection and try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            py={{ base: 10, md: 14 }}
            width="100%"
            position="relative"
        >
            <Container maxW="container.xl" position="relative" zIndex={1}>
                <Box
                    position="relative"
                    borderRadius={{ base: '20px', md: '28px' }}
                    bg="card.felt"
                    p={{ base: 8, md: 11, lg: 14 }}
                    overflow="hidden"
                    border="1px solid"
                    borderColor="border.felt"
                    boxShadow="0 20px 50px rgba(11, 20, 48, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)"
                    transform={{
                        base: 'rotate(-0.5deg)',
                        md: 'rotate(-1deg)',
                    }}
                    transition={TRANSITION_SMOOTH}
                >
                    {/* Subtle felt grain */}
                    <Box
                        position="absolute"
                        inset={0}
                        opacity={0.18}
                        pointerEvents="none"
                        backgroundImage="radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.10) 0.5px, transparent 0.5px)"
                        backgroundSize="4px 4px"
                        aria-hidden="true"
                    />

                    {/* Big suit watermarks — felt-fluent decoration */}
                    <Text
                        as="span"
                        position="absolute"
                        bottom={{ base: '-60px', md: '-90px' }}
                        right={{ base: '-20px', md: '-30px' }}
                        fontSize={{ base: '220px', md: '320px', lg: '380px' }}
                        color="rgba(255, 255, 255, 0.05)"
                        lineHeight={1}
                        fontWeight="bold"
                        pointerEvents="none"
                        transform="rotate(-12deg)"
                        aria-hidden="true"
                    >
                        ♠
                    </Text>
                    <Text
                        as="span"
                        position="absolute"
                        top={{ base: '-20px', md: '-40px' }}
                        left={{ base: '-15px', md: '-10px' }}
                        fontSize={{ base: '120px', md: '180px' }}
                        color="rgba(235, 11, 92, 0.10)"
                        lineHeight={1}
                        fontWeight="bold"
                        pointerEvents="none"
                        transform="rotate(18deg)"
                        aria-hidden="true"
                    >
                        ♥
                    </Text>

                    <Flex
                        direction={{ base: 'column', lg: 'row' }}
                        justify="space-between"
                        align={{ base: 'flex-start', lg: 'center' }}
                        gap={{ base: 8, lg: 14 }}
                        position="relative"
                        zIndex={2}
                    >
                        <VStack align="start" spacing={4} maxW="xl">
                            <HStack spacing={2} align="center">
                                <Box
                                    w="6px"
                                    h="6px"
                                    borderRadius="full"
                                    bg="brand.pink"
                                />
                                <Text
                                    color="brand.lightGray"
                                    fontSize="2xs"
                                    fontWeight="bold"
                                    letterSpacing="0.25em"
                                    textTransform="uppercase"
                                    opacity={0.85}
                                >
                                    Updates &amp; Promos
                                </Text>
                            </HStack>

                            <Heading
                                color="white"
                                fontSize={{
                                    base: '3xl',
                                    md: '5xl',
                                    lg: '6xl',
                                }}
                                fontWeight="extrabold"
                                lineHeight={1.0}
                                letterSpacing="-0.03em"
                            >
                                Don&apos;t miss a{' '}
                                <Box
                                    as="span"
                                    display="inline-block"
                                    position="relative"
                                    px={1}
                                >
                                    hand
                                    <Box
                                        as="span"
                                        position="absolute"
                                        left="0"
                                        right="0"
                                        bottom={{ base: '0px', md: '2px' }}
                                        height={{ base: '10px', md: '14px' }}
                                        bg="brand.yellow"
                                        opacity={0.55}
                                        borderRadius="full"
                                        zIndex={-1}
                                        transform="rotate(-1deg)"
                                    />
                                </Box>
                                .
                            </Heading>

                            <Text
                                color="whiteAlpha.800"
                                fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
                                lineHeight="tall"
                                fontWeight="medium"
                                maxW="md"
                            >
                                Game updates. Bonus drops. Special deals.
                                Straight to your inbox.
                            </Text>
                        </VStack>

                        <VStack
                            as="form"
                            onSubmit={handleSubmit}
                            w={{ base: '100%', lg: 'sm' }}
                            spacing={2.5}
                            align="stretch"
                        >
                            <Input
                                type="email"
                                name="email"
                                autoComplete="email"
                                inputMode="email"
                                aria-label="Email address"
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
                                bg="rgba(255, 255, 255, 0.06)"
                                borderRadius="12px"
                                border="1.5px solid"
                                borderColor={
                                    isSubmitted
                                        ? 'brand.green'
                                        : 'rgba(255, 255, 255, 0.16)'
                                }
                                transition={TRANSITION_SMOOTH}
                                _placeholder={{ color: 'whiteAlpha.450' }}
                                _hover={{
                                    borderColor: 'rgba(255, 255, 255, 0.32)',
                                    bg: 'rgba(255, 255, 255, 0.10)',
                                }}
                                _focus={{
                                    borderColor: 'brand.green',
                                    bg: 'rgba(255, 255, 255, 0.12)',
                                    boxShadow:
                                        '0 0 0 3px rgba(54, 163, 123, 0.20)',
                                }}
                                required
                            />
                            <Button
                                type="submit"
                                aria-label="Save my seat"
                                bg="brand.green"
                                color="white"
                                px={6}
                                height="52px"
                                width="100%"
                                borderRadius="12px"
                                fontSize="sm"
                                fontWeight="700"
                                letterSpacing="0.06em"
                                textTransform="uppercase"
                                border="none"
                                rightIcon={
                                    <Icon
                                        as={
                                            isSubmitted
                                                ? MdCheck
                                                : MdArrowForward
                                        }
                                        boxSize={4}
                                    />
                                }
                                disabled={isSubmitting || isSubmitted}
                                transition={TRANSITION_SMOOTH}
                                boxShadow="0 6px 18px rgba(54, 163, 123, 0.30)"
                                _hover={{
                                    bg: 'brand.green',
                                    transform: 'translateY(-1px)',
                                    boxShadow:
                                        '0 10px 24px rgba(54, 163, 123, 0.42)',
                                    filter: 'brightness(1.08)',
                                }}
                                _active={{
                                    transform: 'translateY(0) scale(0.98)',
                                }}
                                _focusVisible={{
                                    outline: '2px solid',
                                    outlineColor: 'brand.pink',
                                    outlineOffset: '4px',
                                }}
                            >
                                {isSubmitting
                                    ? 'Saving'
                                    : isSubmitted
                                      ? 'Saved'
                                      : 'Save my seat'}
                            </Button>
                        </VStack>
                    </Flex>
                </Box>
            </Container>

            <NewsletterSuccessModal
                isOpen={isSuccessOpen}
                onClose={onSuccessClose}
            />
        </Box>
    );
};

export default NewsletterSection;
