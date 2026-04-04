'use client';

import React from 'react';
import {
    Box,
    Container,
    Heading,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Link,
    VStack,
} from '@chakra-ui/react';
import { FAQs } from '../../utils/FAQsData';
import { motion, useReducedMotion } from 'framer-motion';
import FloatingDecor from './FloatingDecor';

const MotionBox = motion(Box);

const FAQSection = () => {
    const prefersReducedMotion = useReducedMotion();

    return (
        <Box
            as="section"
            id="faq"
            py={{ base: 16, md: 20 }}
            bg="bg.default"
            w="100%"
            position="relative"
            overflow="hidden"
        >
            {/* Background decorations */}
            <Box
                aria-hidden="true"
                position="absolute"
                inset={0}
                bgGradient="radial(circle at 35% 15%, rgba(54, 163, 123, 0.08) 0%, transparent 55%), radial(circle at 70% 0%, rgba(235, 11, 92, 0.06) 0%, transparent 50%), radial(circle at 40% 100%, rgba(253, 197, 29, 0.06) 0%, transparent 50%)"
                opacity={0.6}
                pointerEvents="none"
                zIndex={0}
            />
            <Box
                aria-hidden="true"
                position="absolute"
                inset={0}
                backgroundImage="radial-gradient(circle, rgba(51, 68, 121, 0.12) 1px, transparent 1px)"
                backgroundSize="24px 24px"
                opacity={0.15}
                pointerEvents="none"
                zIndex={0}
            />
            <FloatingDecor density="light" />

            {/* Floating badge */}
            <MotionBox
                aria-hidden="true"
                position="absolute"
                top={{ base: '30%', md: '28%' }}
                left={{ base: '6%', md: '10%' }}
                bg="brand.yellow"
                color="brand.darkNavy"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="2xs"
                fontWeight="bold"
                letterSpacing="0.14em"
                textTransform="uppercase"
                boxShadow="glow-yellow"
                transform="rotate(-8deg)"
                pointerEvents="none"
                zIndex={0}
                border="1px solid rgba(255, 255, 255, 0.4)"
                backdropFilter="blur(4px)"
                opacity={0.85}
                animate={
                    prefersReducedMotion
                        ? undefined
                        : {
                              rotate: [-8, 2, -8],
                              y: [0, -4, 0],
                          }
                }
                transition={
                    prefersReducedMotion
                        ? undefined
                        : {
                              duration: 4.6,
                              repeat: Infinity,
                              ease: 'easeInOut',
                          }
                }
            >
                FAQ DEAL
            </MotionBox>

            <Container maxW="container.lg">
                <VStack
                    spacing={12}
                    align="stretch"
                    position="relative"
                    zIndex={1}
                >
                    <MotionBox
                        initial={
                            prefersReducedMotion
                                ? undefined
                                : { opacity: 0, y: 20 }
                        }
                        whileInView={
                            prefersReducedMotion
                                ? undefined
                                : { opacity: 1, y: 0 }
                        }
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 20,
                        }}
                    >
                        <Heading
                            as="h2"
                            size="2xl"
                            textAlign="left"
                            color="text.primary"
                            fontWeight="extrabold"
                        >
                            Frequently Asked Questions
                            <Box
                                as="span"
                                ml={3}
                                display="inline-flex"
                                alignItems="center"
                                justifyContent="center"
                                w={{ base: '36px', md: '42px' }}
                                h={{ base: '36px', md: '42px' }}
                                borderRadius="full"
                                bg="brand.pink"
                                color="white"
                                fontSize={{ base: '18px', md: '21px' }}
                                fontWeight="extrabold"
                                transform="rotate(6deg)"
                                boxShadow="glow-pink"
                                transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                            >
                                ?
                            </Box>
                        </Heading>
                    </MotionBox>

                    <Accordion allowMultiple>
                        {FAQs.map((faq, index) => (
                            <MotionBox
                                key={index}
                                initial={
                                    prefersReducedMotion
                                        ? undefined
                                        : { opacity: 0, y: 20 }
                                }
                                whileInView={
                                    prefersReducedMotion
                                        ? undefined
                                        : { opacity: 1, y: 0 }
                                }
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 20,
                                    delay: index * 0.08,
                                }}
                            >
                                <AccordionItem
                                    mb={3}
                                    bg="card.white"
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="border.lightGray"
                                    boxShadow="glass"
                                    overflow="hidden"
                                    transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                    _hover={{
                                        boxShadow: 'glass-hover',
                                        borderColor: 'brand.green',
                                        transform: 'translateY(-1px)',
                                    }}
                                    sx={{
                                        '&[data-expanded]': {
                                            borderColor: 'brand.green',
                                            boxShadow:
                                                '0 8px 24px rgba(54, 163, 123, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04)',
                                        },
                                    }}
                                >
                                    <h2>
                                        <AccordionButton
                                            py={5}
                                            px={{ base: 5, md: 7 }}
                                            _hover={{
                                                bg: 'rgba(236, 238, 245, 0.5)',
                                            }}
                                            _expanded={{
                                                bg: 'rgba(236, 238, 245, 0.3)',
                                            }}
                                            display="flex"
                                            justifyContent="space-between"
                                            transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                            borderRadius="xl"
                                        >
                                            <Box
                                                flex="1"
                                                textAlign="left"
                                                fontWeight="bold"
                                                fontSize={{
                                                    base: 'md',
                                                    md: 'lg',
                                                }}
                                                color="text.primary"
                                                pr={4}
                                            >
                                                {faq.question}
                                            </Box>
                                            <AccordionIcon
                                                color="text.muted"
                                                fontSize="22px"
                                                transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                            />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel
                                        pb={6}
                                        pt={0}
                                        px={{ base: 5, md: 7 }}
                                        color="text.secondary"
                                        fontSize="md"
                                        lineHeight="1.75"
                                    >
                                        {faq.question ===
                                        'How can I get in touch with you?' ? (
                                            <>
                                                {faq.answer}{' '}
                                                <Link
                                                    href="https://discord.gg/347RBVcvpn"
                                                    isExternal
                                                    textDecoration="none"
                                                    fontWeight="semibold"
                                                    color="brand.green"
                                                    borderBottom="1px solid"
                                                    borderColor="brand.green"
                                                    transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                                    _hover={{
                                                        color: 'brand.pink',
                                                        borderColor:
                                                            'brand.pink',
                                                    }}
                                                >
                                                    here
                                                </Link>
                                                .
                                            </>
                                        ) : faq.question ===
                                          'Where can I learn more?' ? (
                                            <>
                                                You can find our roadmap, game
                                                rules, and technical
                                                architecture in the docs{' '}
                                                <Link
                                                    href="https://docs.stackedpoker.io"
                                                    isExternal
                                                    textDecoration="none"
                                                    fontWeight="semibold"
                                                    color="brand.green"
                                                    borderBottom="1px solid"
                                                    borderColor="brand.green"
                                                    transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                                                    _hover={{
                                                        color: 'brand.pink',
                                                        borderColor:
                                                            'brand.pink',
                                                    }}
                                                >
                                                    here
                                                </Link>
                                                .
                                            </>
                                        ) : (
                                            faq.answer
                                        )}
                                    </AccordionPanel>
                                </AccordionItem>
                            </MotionBox>
                        ))}
                    </Accordion>
                </VStack>
            </Container>
        </Box>
    );
};

export default FAQSection;
