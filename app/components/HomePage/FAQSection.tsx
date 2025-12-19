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
    VStack,
} from '@chakra-ui/react';
import { FAQs } from '../../utils/FAQsData';

const FAQSection = () => {
    return (
        <Box
            as="section"
            py={{ base: 16, md: 24 }}
            bg="brand.lightGray"
            w="100%"
        >
            <Container maxW="container.lg">
                <VStack spacing={12} align="stretch">
                    <Heading
                        as="h2"
                        size="2xl"
                        textAlign="left"
                        color="brand.darkNavy"
                        fontWeight="extrabold"
                    >
                        Frequently Asked Questions
                    </Heading>

                    <Accordion allowMultiple>
                        {FAQs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                border="none"
                                mb={4}
                                bg="white"
                                borderRadius="xl"
                                boxShadow="sm"
                                overflow="hidden"
                            >
                                <h2>
                                    <AccordionButton
                                        py={6}
                                        px={8}
                                        _hover={{ bg: 'gray.50' }}
                                        display="flex"
                                        justifyContent="space-between"
                                    >
                                        <Box
                                            flex="1"
                                            textAlign="left"
                                            fontWeight="bold"
                                            fontSize="xl"
                                            color="brand.darkNavy"
                                        >
                                            {faq.question}
                                        </Box>
                                        <AccordionIcon
                                            color="brand.navy"
                                            fontSize="24px"
                                        />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel
                                    pb={8}
                                    px={8}
                                    color="brand.navy"
                                    fontSize="lg"
                                    lineHeight="tall"
                                >
                                    {faq.answer}
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
