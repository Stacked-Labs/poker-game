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

const FAQSection = () => {
    return (
        <Box as="section" py={{ base: 10, md: 14 }} bg="bg.default" w="100%">
            <Container maxW="container.lg">
                <VStack spacing={12} align="stretch">
                    <Heading
                        as="h2"
                        size="2xl"
                        textAlign="left"
                        color="text.primary"
                        fontWeight="extrabold"
                    >
                        Frequently Asked Questions
                    </Heading>

                    <Accordion allowMultiple>
                        {FAQs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                mb={4}
                                bg="card.white"
                                borderRadius="xl"
                                border="1px solid"
                                borderColor="border.lightGray"
                                boxShadow="sm"
                                overflow="hidden"
                            >
                                <h2>
                                    <AccordionButton
                                        py={6}
                                        px={8}
                                        _hover={{ bg: 'card.lightGray' }}
                                        display="flex"
                                        justifyContent="space-between"
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
                        ))}
                    </Accordion>
                </VStack>
            </Container>
        </Box>
    );
};

export default FAQSection;
