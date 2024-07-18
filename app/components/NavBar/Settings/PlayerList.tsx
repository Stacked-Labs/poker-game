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
            <VStack gap={5}>
                {players.map((player: Player, index: number) => {
                    if (player.username !== '') {
                        return (
                            <Flex
                                key={index}
                                alignItems={'center'}
                                gap={20}
                                width={'70%'}
                                borderColor={'grey'}
                                borderWidth={2}
                                borderRadius={10}
                                paddingX={10}
                                paddingY={5}
                            >
                                <Flex
                                    flex={3}
                                    justifyContent={'space-around'}
                                    alignItems={'center'}
                                    textAlign={'left'}
                                    gap={40}
                                >
                                    <Box flex={2}>
                                        <Flex justifyContent={'space-between'}>
                                            <Flex gap={2}>
                                                <Text
                                                    fontSize={'xl'}
                                                    fontWeight={'black'}
                                                >
                                                    {player.username}
                                                </Text>
                                                <Box
                                                    bgColor={'charcoal.600'}
                                                    paddingY={1}
                                                    paddingX={2}
                                                    borderRadius={10}
                                                >
                                                    <Text fontSize={'small'}>
                                                        ID: {player.uuid}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                            <Text>
                                                Total buy-in:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.totalBuyIn}
                                                </Text>
                                            </Text>
                                        </Flex>
                                        <Flex
                                            gap={4}
                                            justifyContent={'space-between'}
                                        >
                                            <Text>
                                                Seat:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.seatID}
                                                </Text>
                                            </Text>
                                            <Text>
                                                Stack:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.stack}
                                                </Text>
                                            </Text>
                                        </Flex>
                                    </Box>
                                </Flex>

                                <Flex gap={10}>
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
