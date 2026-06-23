'use client';

import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Grid,
    GridItem,
    Icon,
} from '@chakra-ui/react';
import { MdClose, MdCheck } from 'react-icons/md';
import { motion, useReducedMotion } from 'framer-motion';

const MotionBox = motion(Box);

const rows = [
    {
        old: 'Submit your ID. Wait for review.',
        stacked: 'Connect a wallet. You’re in.',
    },
    {
        old: 'Wait days for withdrawals.',
        stacked: 'Settle to your wallet, onchain.',
    },
    {
        old: 'Trust the operator with your bankroll.',
        stacked: 'Smart contract holds the chips.',
    },
];

const ComparisonSection = () => {
    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = !prefersReducedMotion;

    const fadeUp = (delay = 0) =>
        shouldAnimate
            ? {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, amount: 0.2 },
                  transition: {
                      type: 'spring',
                      stiffness: 200,
                      damping: 22,
                      delay,
                  },
              }
            : {};

    return (
        <Box
            as="section"
            py={{ base: 6, md: 14 }}
            width="100%"
            position="relative"
        >
            <Container maxW="container.lg" position="relative" zIndex={1}>
                <MotionBox {...fadeUp(0)} mb={{ base: 5, md: 14 }} textAlign="center">
                    <Heading
                        fontSize={{ base: '2xl', md: '5xl' }}
                        fontWeight="extrabold"
                        letterSpacing="-0.03em"
                        color="text.primary"
                        lineHeight="shorter"
                    >
                        The old way{' '}
                        <Box as="span" color="text.secondary" fontWeight="normal">
                            vs.
                        </Box>{' '}
                        the{' '}
                        <Box as="span" color="brand.green">
                            Stacked
                        </Box>{' '}
                        way
                    </Heading>
                </MotionBox>

                {/* Column headers */}
                <MotionBox {...fadeUp(0.1)}>
                    <Grid
                        templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                        gap={0}
                        mb={3}
                        display={{ base: 'none', md: 'grid' }}
                    >
                        <GridItem>
                            <Text
                                fontSize="xs"
                                fontWeight="extrabold"
                                letterSpacing="0.15em"
                                textTransform="uppercase"
                                color="text.muted"
                                px={5}
                            >
                                The old way
                            </Text>
                        </GridItem>
                        <GridItem>
                            <Text
                                fontSize="xs"
                                fontWeight="extrabold"
                                letterSpacing="0.15em"
                                textTransform="uppercase"
                                color="brand.green"
                                px={5}
                            >
                                Stacked
                            </Text>
                        </GridItem>
                    </Grid>
                </MotionBox>

                <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                    {rows.map((row, i) => (
                        <MotionBox key={i} {...fadeUp(0.12 + i * 0.06)}>
                            <Grid
                                templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                                gap={0}
                                borderRadius="16px"
                                overflow="hidden"
                                border="1px solid"
                                borderColor="border.lightGray"
                            >
                                {/* Old way cell */}
                                <GridItem
                                    bg="rgba(235, 11, 92, 0.03)"
                                    px={5}
                                    py={{ base: 3, md: 4 }}
                                    borderRight={{ base: 'none', md: '1px solid' }}
                                    borderBottom={{ base: '1px solid', md: 'none' }}
                                    borderColor="border.lightGray"
                                >
                                    <Text
                                        display={{ base: 'block', md: 'none' }}
                                        fontSize="2xs"
                                        fontWeight="extrabold"
                                        letterSpacing="0.18em"
                                        textTransform="uppercase"
                                        color="text.muted"
                                        mb={2}
                                    >
                                        The old way
                                    </Text>
                                    <HStack spacing={3} align="center">
                                        <Box
                                            flexShrink={0}
                                            w="22px"
                                            h="22px"
                                            borderRadius="full"
                                            bg="rgba(235, 11, 92, 0.08)"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Icon
                                                as={MdClose}
                                                color="brand.pink"
                                                fontSize="sm"
                                            />
                                        </Box>
                                        <Text
                                            fontSize="sm"
                                            color="text.secondary"
                                            fontWeight="medium"
                                            lineHeight="short"
                                        >
                                            {row.old}
                                        </Text>
                                    </HStack>
                                </GridItem>

                                {/* Stacked cell */}
                                <GridItem
                                    bg="rgba(54, 163, 123, 0.04)"
                                    px={5}
                                    py={{ base: 3, md: 4 }}
                                >
                                    <Text
                                        display={{ base: 'block', md: 'none' }}
                                        fontSize="2xs"
                                        fontWeight="extrabold"
                                        letterSpacing="0.18em"
                                        textTransform="uppercase"
                                        color="brand.green"
                                        mb={2}
                                    >
                                        Stacked
                                    </Text>
                                    <HStack spacing={3} align="center">
                                        <Box
                                            flexShrink={0}
                                            w="22px"
                                            h="22px"
                                            borderRadius="full"
                                            bg="rgba(54, 163, 123, 0.1)"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Icon
                                                as={MdCheck}
                                                color="brand.green"
                                                fontSize="sm"
                                            />
                                        </Box>
                                        <Text
                                            fontSize="sm"
                                            color="text.primary"
                                            fontWeight="semibold"
                                            lineHeight="short"
                                        >
                                            {row.stacked}
                                        </Text>
                                    </HStack>
                                </GridItem>
                            </Grid>
                        </MotionBox>
                    ))}
                </VStack>
            </Container>
        </Box>
    );
};

export default ComparisonSection;
