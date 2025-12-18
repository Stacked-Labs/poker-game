'use client';

import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import GameSettingLeftSide from '../components/CreateGame/GameSettingLeftSide';
import Head from 'next/head';

const CreateGamePage: React.FC = () => {
    return (
        <>
            <Head>
                <link
                    rel="preconnect"
                    href="https://challenges.cloudflare.com"
                />
                <link
                    rel="dns-prefetch"
                    href="https://challenges.cloudflare.com"
                />
            </Head>
            <Box
                minHeight="var(--full-vh)"
                position="relative"
                overflow="hidden"
                bg="bg.default"
            >
                {/* Main Content */}
                <Flex
                    flex="1"
                    justifyContent="center"
                    position="relative"
                    zIndex={1}
                    minHeight="var(--full-vh)"
                >
                    <GameSettingLeftSide />
                </Flex>
            </Box>
        </>
    );
};

export default CreateGamePage;
