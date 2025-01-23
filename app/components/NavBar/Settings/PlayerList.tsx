'use client';
import { getPendingPlayers } from '@/app/hooks/server_actions';
import { Flex, Button, Text, Box, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { GiBootKick } from 'react-icons/gi';

interface PendingPlayer {
    Uuid: string;
    SeatId: string;
}

const truncateString = (text: String) => {
    return text.length > 10 ? text.substring(0, 10) + '...' : text;
};

const PlayerList = () => {
    const [pendingPlayers, setPendingPlayers] = useState<PendingPlayer[]>([]);

    useEffect(() => {
        async function fetchPendingPlayers() {
            try {
                const data = await getPendingPlayers(); // Call the function
                setPendingPlayers(data);
            } catch (error) {
                console.error('Failed to fetch pending players:', error);
            }
        }

        fetchPendingPlayers();
    }, []);

    console.log('AAA', pendingPlayers);

    if (pendingPlayers && pendingPlayers.length > 0) {
        return (
            <VStack gap={5}>
                {pendingPlayers.map((player: PendingPlayer, index: number) => {
                    if (player.Uuid !== '') {
                        return (
                            <Flex
                                key={index}
                                alignItems={'center'}
                                gap={{ base: 0, lg: 10 }}
                                width={{ base: '90vw', md: '70%' }}
                                borderColor={'grey'}
                                borderWidth={2}
                                borderRadius={10}
                                paddingX={{ base: 5, md: 10 }}
                                paddingY={{ base: 2, md: 5 }}
                                direction={{
                                    base: 'column',
                                    lg: 'row',
                                }}
                            >
                                <Flex
                                    flex={3}
                                    justifyContent={'space-around'}
                                    alignItems={'center'}
                                    textAlign={'left'}
                                    gap={40}
                                >
                                    <Flex
                                        gap={{ base: 2, xl: 5 }}
                                        flex={2}
                                        direction={{
                                            base: 'column',
                                            xl: 'row',
                                        }}
                                    >
                                        <Flex
                                            justifyContent={'space-between'}
                                            direction={{
                                                base: 'column',
                                                xl: 'row',
                                            }}
                                            gap={{ base: 2, xl: 5 }}
                                        >
                                            <Flex
                                                gap={{ base: 2, xl: 5 }}
                                                direction={{
                                                    base: 'column',
                                                    xl: 'row',
                                                }}
                                            >
                                                <Text
                                                    fontSize={'xl'}
                                                    fontWeight={'black'}
                                                >
                                                    {player.Uuid}
                                                </Text>
                                                <Box
                                                    bgColor={'charcoal.600'}
                                                    paddingY={1}
                                                    paddingX={2}
                                                    borderRadius={10}
                                                >
                                                    <Text
                                                        fontSize={'small'}
                                                        color={'white'}
                                                    >
                                                        ID:{' '}
                                                        {truncateString(
                                                            player.Uuid
                                                        )}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                            {/* <Text>
                                                Total buy-in:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.totalBuyIn}
                                                </Text>
                                            </Text> */}
                                        </Flex>
                                        <Flex
                                            gap={4}
                                            justifyContent={'space-between'}
                                            direction={{
                                                base: 'column',
                                                xl: 'row',
                                            }}
                                        >
                                            <Text>
                                                Seat:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.SeatId}
                                                </Text>
                                            </Text>
                                            {/* <Text>
                                                Stack:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.stack}
                                                </Text>
                                            </Text> */}
                                        </Flex>
                                    </Flex>
                                </Flex>

                                <Flex
                                    gap={{ base: 5, lg: 10 }}
                                    py={{ base: 5, lg: 0 }}
                                >
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
