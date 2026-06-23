'use client';

import React from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    Link,
    VStack,
    Icon,
} from '@chakra-ui/react';
import { MdAdd, MdRemove } from 'react-icons/md';
import { FAQs } from '../../utils/FAQsData';
import { motion, useReducedMotion } from 'framer-motion';

const MotionVStack = motion(VStack);

const FAQSection = () => {
    const prefersReducedMotion = useReducedMotion();

    const fadeUp = (delay = 0) =>
        prefersReducedMotion
            ? {}
            : {
                  initial: { opacity: 0, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, amount: 0.3 },
                  transition: { duration: 0.6, ease: 'easeOut', delay },
              };

    const renderAnswer = (faq: { question: string; answer: string }) => {
        if (faq.question === 'How can I get in touch with you?') {
            return (
                <>
                    {faq.answer}{' '}
                    <Link
                        href="https://discord.gg/xdaC5gRP4E"
                        isExternal
                        textDecoration="none"
                        fontWeight="semibold"
                        color="brand.green"
                        borderBottom="1px solid"
                        borderColor="brand.green"
                        _hover={{
                            color: 'brand.pink',
                            borderColor: 'brand.pink',
                        }}
                    >
                        Join our Discord
                    </Link>
                    .
                </>
            );
        }
        if (faq.question === 'Where can I learn more?') {
            return (
                <>
                    You can find our roadmap, game rules, and technical
                    architecture in our{' '}
                    <Link
                        href="https://docs.stackedpoker.io/"
                        isExternal
                        textDecoration="none"
                        fontWeight="semibold"
                        color="brand.green"
                        borderBottom="1px solid"
                        borderColor="brand.green"
                        _hover={{
                            color: 'brand.pink',
                            borderColor: 'brand.pink',
                        }}
                    >
                        documentation
                    </Link>
                    .
                </>
            );
        }
        return faq.answer;
    };

    return (
        <Box
            as="section"
            id="faq"
            py={{ base: 10, md: 14 }}
            w="100%"
            position="relative"
        >
            {/* Big ? watermark — section signature */}
            <Box
                aria-hidden="true"
                position="absolute"
                bottom={{ base: '-60px', md: '-120px' }}
                right={{ base: '-30px', md: '-30px', lg: '-10px' }}
                fontSize={{ base: '240px', md: '500px', lg: '600px' }}
                lineHeight={0.85}
                color="brand.pink"
                opacity={0.05}
                pointerEvents="none"
                transform="rotate(-8deg)"
                fontWeight="black"
                userSelect="none"
            >
                ?
            </Box>

            <Container maxW="container.lg" position="relative" zIndex={1}>
                <MotionVStack
                    align="start"
                    spacing={{ base: 8, md: 12 }}
                    {...fadeUp(0)}
                >
                    <VStack align="start" spacing={3}>
                        <Text
                            fontSize="2xs"
                            fontWeight="bold"
                            color="text.muted"
                            letterSpacing="0.22em"
                            textTransform="uppercase"
                        >
                            FAQ
                        </Text>
                        <Heading
                            as="h2"
                            fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
                            fontWeight="black"
                            color="text.primary"
                            letterSpacing="-0.03em"
                            lineHeight={0.95}
                        >
                            Before you{' '}
                            <Box
                                as="span"
                                color="brand.pink"
                                position="relative"
                                display="inline-block"
                            >
                                sit down
                            </Box>
                            ...
                        </Heading>
                    </VStack>

                    <Box
                        w="100%"
                        borderTop="1px solid"
                        borderColor="border.lightGray"
                    >
                        <Accordion allowMultiple>
                            {FAQs.map((faq, index) => {
                                const num = String(index + 1).padStart(2, '0');
                                return (
                                    <AccordionItem
                                        key={faq.question}
                                        border="none"
                                        borderBottom="1px solid"
                                        borderBottomColor="border.lightGray"
                                    >
                                        {({ isExpanded }) => (
                                            <>
                                                <h3>
                                                    <AccordionButton
                                                        py={{
                                                            base: 5,
                                                            md: 6,
                                                        }}
                                                        px={0}
                                                        _hover={{
                                                            bg: 'transparent',
                                                        }}
                                                        _expanded={{
                                                            bg: 'transparent',
                                                        }}
                                                        display="flex"
                                                        alignItems="flex-start"
                                                        gap={{
                                                            base: 4,
                                                            md: 6,
                                                        }}
                                                        textAlign="left"
                                                    >
                                                        <Text
                                                            fontFamily="mono"
                                                            fontSize={{
                                                                base: 'sm',
                                                                md: 'md',
                                                            }}
                                                            fontWeight="bold"
                                                            color={
                                                                isExpanded
                                                                    ? 'brand.green'
                                                                    : 'text.muted'
                                                            }
                                                            transition="color 0.2s ease"
                                                            flexShrink={0}
                                                            minW={{
                                                                base: '24px',
                                                                md: '32px',
                                                            }}
                                                            pt={{
                                                                base: '2px',
                                                                md: '4px',
                                                            }}
                                                        >
                                                            {num}
                                                        </Text>
                                                        <Box
                                                            flex="1"
                                                            fontSize={{
                                                                base: 'md',
                                                                md: 'lg',
                                                            }}
                                                            fontWeight="bold"
                                                            color="text.primary"
                                                            letterSpacing="-0.005em"
                                                            lineHeight={1.4}
                                                        >
                                                            {faq.question}
                                                        </Box>
                                                        <Box
                                                            flexShrink={0}
                                                            w={{
                                                                base: '32px',
                                                                md: '36px',
                                                            }}
                                                            h={{
                                                                base: '32px',
                                                                md: '36px',
                                                            }}
                                                            borderRadius="full"
                                                            border="1px solid"
                                                            borderColor={
                                                                isExpanded
                                                                    ? 'brand.green'
                                                                    : 'border.lightGray'
                                                            }
                                                            bg={
                                                                isExpanded
                                                                    ? 'brand.green'
                                                                    : 'transparent'
                                                            }
                                                            color={
                                                                isExpanded
                                                                    ? 'white'
                                                                    : 'text.muted'
                                                            }
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            transition="all 0.2s ease"
                                                            mt={{
                                                                base: '-2px',
                                                                md: '0px',
                                                            }}
                                                        >
                                                            <Icon
                                                                as={
                                                                    isExpanded
                                                                        ? MdRemove
                                                                        : MdAdd
                                                                }
                                                                boxSize={{
                                                                    base: '18px',
                                                                    md: '20px',
                                                                }}
                                                            />
                                                        </Box>
                                                    </AccordionButton>
                                                </h3>
                                                <AccordionPanel
                                                    pb={{ base: 6, md: 8 }}
                                                    pt={0}
                                                    px={0}
                                                    pl={{
                                                        base: '40px',
                                                        md: '56px',
                                                    }}
                                                    pr={{
                                                        base: '44px',
                                                        md: '52px',
                                                    }}
                                                    color="text.secondary"
                                                    fontSize={{
                                                        base: 'sm',
                                                        md: 'md',
                                                    }}
                                                    lineHeight={1.75}
                                                    fontWeight="medium"
                                                >
                                                    {renderAnswer(faq)}
                                                </AccordionPanel>
                                            </>
                                        )}
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </Box>
                </MotionVStack>
            </Container>
        </Box>
    );
};

export default FAQSection;
