'use client';

import React from 'react';
import { Flex } from '@chakra-ui/react';
import GameSettingLeftSide from '../components/CreateGame/GameSettingLeftSide';

const CreateGamePage: React.FC = () => {
    return (
        <>
            <Flex minHeight="100vh" bg="gray.200">
                {/* Left Side Content */}
                <Flex flex="1" p={4} justifyContent="center">
                    <GameSettingLeftSide />
                </Flex>
            </Flex>
        </>
    );
};

export default CreateGamePage;
