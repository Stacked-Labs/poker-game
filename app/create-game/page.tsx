'use client';

import React, { useState } from 'react';
import {
    Flex,
    Input,
    FormControl,
    FormLabel,
    VStack,
    Text,
    SimpleGrid,
} from '@chakra-ui/react';
import PlayTypeToggle from '../components/CreateGame/PlayTypeToggle';
import OptionCard from '../components/CreateGame/OptionCard';
import gameData from './gameOptions.json';

const CreateGamePage: React.FC = () => {
    const [playType, setPlayType] = useState<'Free' | 'Crypto'>('Crypto');
    const [selectedGameMode, setSelectedGameMode] = useState<string | null>(
        null
    );
    const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

    const { gameModes, networks } = gameData;

    return (
        <Flex minHeight="100vh" bg="gray.200">
            <Flex flex="1" p={4} justifyContent="center">
                <VStack
                    spacing={4}
                    alignItems="center"
                    justifyContent="center"
                    width="100%"
                    maxWidth="800px"
                >
                    <Text
                        fontSize="5xl"
                        fontWeight="bold"
                        fontFamily="Poppins"
                        mb={4}
                    >
                        Game Settings
                    </Text>
                    <PlayTypeToggle />

                    <Flex width="50%" justifyContent="space-between">
                        <FormControl flex="1" mr={2}>
                            <FormLabel>Small Blind</FormLabel>
                            <Input
                                type="number"
                                placeholder="Enter small blind"
                                borderColor="white"
                                focusBorderColor="red.500"
                            />
                        </FormControl>

                        <FormControl flex="1" ml={2}>
                            <FormLabel>Big Blind</FormLabel>
                            <Input
                                type="number"
                                placeholder="Enter big blind"
                                borderColor="white"
                                focusBorderColor="red.500"
                            />
                        </FormControl>
                    </Flex>

                    <FormControl
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        width="100%"
                    >
                        <FormLabel>Game Mode</FormLabel>
                        <SimpleGrid
                            columns={2}
                            spacing={2}
                            justifyItems="center"
                            width="auto"
                            maxWidth="100%"
                        >
                            {gameModes.map((mode) => (
                                <OptionCard
                                    key={mode.name}
                                    name={mode.name}
                                    description={mode.description}
                                    isSelected={selectedGameMode === mode.name}
                                    onClick={() =>
                                        setSelectedGameMode(mode.name)
                                    }
                                    disabled={mode.disabled}
                                />
                            ))}
                        </SimpleGrid>
                    </FormControl>

                    {playType === 'Crypto' && (
                        <FormControl
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            width="100%"
                        >
                            <FormLabel>Network</FormLabel>
                            <SimpleGrid
                                columns={3}
                                spacing={2}
                                justifyItems="center"
                                width="auto"
                                maxWidth="100%"
                            >
                                {networks.map((network) => (
                                    <OptionCard
                                        key={network.name}
                                        name={network.name}
                                        image={network.image}
                                        isSelected={
                                            selectedNetwork === network.name
                                        }
                                        onClick={() =>
                                            setSelectedNetwork(network.name)
                                        }
                                        disabled={network.disabled}
                                    />
                                ))}
                            </SimpleGrid>
                        </FormControl>
                    )}
                </VStack>
            </Flex>
            <Flex
                flex="1"
                p={4}
                justifyContent="center"
                alignItems="flex-start"
            >
                {/* Right side content can be added here */}
            </Flex>
        </Flex>
    );
};

export default CreateGamePage;
