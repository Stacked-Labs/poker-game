'use client';

import React from 'react';
import { Flex } from '@chakra-ui/react';
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
            <Flex minHeight="var(--full-vh)" bg="gray.200">
                {/* Left Side Content */}
                <Flex flex="1" p={4} justifyContent="center">
                    <GameSettingLeftSide />
                </Flex>
            </Flex>
        </>
    );
};

export default CreateGamePage;
