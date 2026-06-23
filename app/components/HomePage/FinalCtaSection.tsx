'use client';

import {
    Box,
    Button,
    Container,
    Heading,
    Icon,
    Stack,
    Text,
    VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { MdArrowForward } from 'react-icons/md';

const MotionVStack = motion(VStack);

// The closer. After the FAQ has handled objections, give the page one clear,
// confident "go play / go host" moment — the play CTA the long scroll otherwise
// lacks. Slide-only reveal so it's never gated invisible; reduced-motion safe.
const FinalCtaSection = () => {
    const prefersReducedMotion = useReducedMotion();
    const fadeUp = prefersReducedMotion
        ? {}
        : {
              initial: { y: 24 },
              whileInView: { y: 0 },
              viewport: { once: true, amount: 0.4 },
              transition: { duration: 0.6, ease: 'easeOut' },
          };

    return (
        <Box
            as="section"
            id="play-cta"
            py={{ base: 8, md: 16 }}
            width="100%"
            position="relative"
            textAlign="center"
        >
            <Container maxW="container.md" position="relative" zIndex={1}>
                <MotionVStack spacing={{ base: 4, md: 6 }} {...fadeUp}>
                    <Heading
                        as="h2"
                        fontSize={{ base: '4xl', md: '6xl' }}
                        fontWeight="black"
                        color="text.primary"
                        letterSpacing="-0.03em"
                        lineHeight={1}
                    >
                        Pull up a{' '}
                        <Box
                            as="span"
                            display="inline-block"
                            position="relative"
                            px={1}
                        >
                            seat
                            <Box
                                as="span"
                                position="absolute"
                                left="0"
                                right="0"
                                bottom={{ base: '0px', md: '4px' }}
                                height={{ base: '10px', md: '14px' }}
                                bg="brand.green"
                                opacity={0.18}
                                borderRadius="full"
                                zIndex={-1}
                                transform="rotate(-1deg)"
                            />
                        </Box>
                        .
                    </Heading>
                    <Text
                        fontSize={{ base: 'md', md: 'lg' }}
                        color="text.secondary"
                        fontWeight="medium"
                        maxW="lg"
                        lineHeight="tall"
                    >
                        Real hands, real stakes. Your table is one click away.
                    </Text>
                    <Stack
                        direction={{ base: 'column', sm: 'row' }}
                        spacing={3}
                        pt={2}
                        w={{ base: '100%', sm: 'auto' }}
                    >
                        <Button
                            as={Link}
                            href="/public-games"
                            variant="tactilePrimary"
                            height={{ base: '52px', md: '56px' }}
                            px={8}
                            fontSize={{ base: 'md', md: 'lg' }}
                            rightIcon={
                                <Icon as={MdArrowForward} boxSize="18px" />
                            }
                        >
                            Browse live tables
                        </Button>
                        <Button
                            as={Link}
                            href="/create-game"
                            variant="tactileOutline"
                            height={{ base: '52px', md: '56px' }}
                            px={8}
                            fontSize={{ base: 'md', md: 'lg' }}
                        >
                            Host a table
                        </Button>
                    </Stack>
                </MotionVStack>
            </Container>
        </Box>
    );
};

export default FinalCtaSection;
