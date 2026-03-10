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
            py={{ base: 10, md: 14 }}
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
                bgGradient="radial(circle at 35% 15%, rgba(54, 163, 123, 0.1) 0%, transparent 55%), radial(circle at 70% 0%, rgba(235, 11, 92, 0.1) 0%, transparent 50%), radial(circle at 40% 100%, rgba(253, 197, 29, 0.1) 0%, transparent 50%)"
                opacity={0.7}
                pointerEvents="none"
                zIndex={0}
            />
            <Box
                aria-hidden="true"
                position="absolute"
                inset={0}
                backgroundImage="radial-gradient(circle, rgba(51, 68, 121, 0.15) 1px, transparent 1px)"
                backgroundSize="22px 22px"
                opacity={0.2}
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
                fontSize="xs"
                fontWeight="bold"
                letterSpacing="0.12em"
                textTransform="uppercase"
                boxShadow="0 8px 18px rgba(253, 197, 29, 0.28)"
                transform="rotate(-8deg)"
                pointerEvents="none"
                zIndex={0}
                border="1px solid rgba(255, 255, 255, 0.3)"
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
                                w={{ base: '34px', md: '40px' }}
                                h={{ base: '34px', md: '40px' }}
                                borderRadius="full"
                                bg="brand.pink"
                                color="white"
                                fontSize={{ base: '18px', md: '20px' }}
                                transform="rotate(6deg)"
                                boxShadow="0 10px 20px rgba(235, 11, 92, 0.35)"
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
                                    mb={4}
                                    bg="card.white"
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="border.lightGray"
                                    boxShadow="0 2px 12px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
                                    overflow="hidden"
                                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                    _hover={{
                                        boxShadow:
                                            '0 8px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                                        borderColor: 'brand.green',
                                        transform: 'translateY(-2px)',
                                    }}
                                >
                                    <h2>
                                        <AccordionButton
                                            py={6}
                                            px={8}
                                            _hover={{ bg: 'card.lightGray' }}
                                            display="flex"
                                            justifyContent="space-between"
                                            transition="all 0.2s ease"
                                            borderRadius="xl"
                                        >
                                            <Box
                                                flex="1"
                                                textAlign="left"
                                                fontWeight="bold"
                                                fontSize="xl"
                                                color="text.primary"
                                            >
                                                {faq.question}
                                            </Box>
                                            <AccordionIcon
                                                color="text.secondary"
                                                fontSize="24px"
                                                transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                            />
                                        </AccordionButton>
                                    </h2>
                                    <AccordionPanel
                                        pb={8}
                                        px={8}
                                        color="text.secondary"
                                        fontSize="lg"
                                        lineHeight="tall"
                                    >
                                        {faq.question ===
                                        'How can I get in touch with you?' ? (
                                            <>
                                                {faq.answer}{' '}
                                                <Link
                                                    href="https://discord.gg/347RBVcvpn"
                                                    isExternal
                                                    textDecoration="underline"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                    transition="color 0.2s ease"
                                                    _hover={{
                                                        color: 'brand.green',
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
                                                    textDecoration="underline"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                    transition="color 0.2s ease"
                                                    _hover={{
                                                        color: 'brand.green',
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
