import { FAQ } from '@/app/interfaces';
import { FAQs } from '@/app/utils/FAQsData';
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    VStack,
} from '@chakra-ui/react';
import React from 'react';
import TitleText from '../TitleText';

const FAQsSection = () => {
    return (
        <VStack flex={1}>
            <TitleText text={'Got Questions?'} />
            <Accordion width={'100%'} allowToggle>
                {FAQs.map((faq: FAQ, index: number) => {
                    return (
                        <AccordionItem key={index}>
                            <h2>
                                <AccordionButton
                                    _expanded={{
                                        bg: 'green.500',
                                        color: 'white',
                                    }}
                                >
                                    <Box as="span" flex="1" textAlign="left">
                                        {faq.question}
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>{faq.answer}</AccordionPanel>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </VStack>
    );
};

export default FAQsSection;
