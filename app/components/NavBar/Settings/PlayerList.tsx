'use client';
import { AppContext } from '@/app/contexts/AppStoreProvider';
import { Player } from '@/app/interfaces';
import {
    Flex,
    Button,
    Text,
    Box,
    CloseButton,
    HStack,
    VStack,
} from '@chakra-ui/react';
import React, { useContext } from 'react';
import { FaCheck } from 'react-icons/fa';
import { GiBootKick } from 'react-icons/gi';

const PlayerList = () => {
    const { appState } = useContext(AppContext);
    const players = appState.game?.players;

    if (players && players.length > 0) {
        return (
            <VStack>
                {players.map((player: Player, index: number) => {
                    if (player.username !== '') {
                        return (
                            <Flex
                                key={index}
                                alignItems={'center'}
                                marginY={8}
                                gap={20}
                                width={'70%'}
                            >
                                <Flex
                                    flex={2}
                                    justifyContent={'space-around'}
                                    alignItems={'center'}
                                    textAlign={'left'}
                                    gap={40}
                                >
                                    <Box flex={2}>
                                        <Text
                                            fontSize={'xl'}
                                            fontWeight={'bold'}
                                        >
                                            {player.username}
                                        </Text>
                                        <Flex justifyContent={'space-between'}>
                                            <Text>
                                                Seated at: {player.seatID}
                                            </Text>
                                            <Text>Stack: {player.stack}</Text>
                                        </Flex>
                                    </Box>
                                    <Box
                                        bgColor={'charcoal.600'}
                                        flex={1}
                                        paddingY={2}
                                        paddingX={5}
                                        borderRadius={4}
                                        borderWidth={1}
                                        borderColor={'grey'}
                                        textAlign={'left'}
                                    >
                                        <Text>ID: {player.address}</Text>
                                    </Box>
                                </Flex>
                                <Flex flex={1} gap={50}>
                                    <Button
                                        flex={1}
                                        gap={3}
                                        bg={'green.500'}
                                        border={0}
                                        alignItems={'center'}
                                        _hover={{ background: 'green' }}
                                    >
                                        Accept
                                        <FaCheck />
                                    </Button>
                                    <Button
                                        flex={1}
                                        gap={3}
                                        bg={'red.500'}
                                        border={0}
                                        alignItems={'center'}
                                        _hover={{ background: 'red' }}
                                    >
                                        Kick
                                        <GiBootKick size={25} />
                                    </Button>
                                </Flex>
                            </Flex>
                        );
                    }
                })}
            </VStack>
        );
    }
};

export default PlayerList;
