'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';
import FloatingDecor from '@/app/components/HomePage/FloatingDecor';
import Footer from '@/app/components/HomePage/Footer';
import CardsReference from '@/app/components/CardsReference/CardsReference';

const CardsPage: React.FC = () => (
    <Box
        minH="100vh"
        bg="bg.default"
        pt={{ base: 24, md: 28 }}
        px={{ base: 4, md: 6 }}
        position="relative"
        overflow="hidden"
    >
        <FloatingDecor density="light" />

        <Box position="relative" zIndex={1}>
            <CardsReference />
        </Box>

        <Box position="relative" zIndex={1} mt={{ base: 12, md: 16 }}>
            <Footer />
        </Box>
    </Box>
);

export default CardsPage;
