'use client';

import React from 'react';
import { Flex } from '@chakra-ui/react';
import GameSettingLeftSide from '../components/CreateGame/GameSettingLeftSide';
import { AutoConnect } from 'thirdweb/react';
import { client } from '../client';

const CreateGamePage: React.FC = () => {

    return (
        <>
        <AutoConnect client={client} />
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
