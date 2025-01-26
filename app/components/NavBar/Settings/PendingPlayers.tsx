import { PendingPlayer } from '@/app/utils/fetchPlayers';
import { Flex, Box, Button, Text } from '@chakra-ui/react';
import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

interface Props {
    pendingPlayers: PendingPlayer[];
    handleAcceptPlayer: (uuid: string) => void;
    handleDenyPlayer: (uuid: string) => void;
}

const PendingPlayers = ({
    pendingPlayers,
    handleAcceptPlayer,
    handleDenyPlayer,
}: Props) => {
    if (pendingPlayers && pendingPlayers.length > 0) {
        return (
            <>
                <Text color={'white'}>Pending</Text>
                {pendingPlayers.map((player: PendingPlayer, index: number) => {
                    if (player && !player.isAccepted) {
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
                                                        {player.uuid.substring(
                                                            0,
                                                            8
                                                        )}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                            <Text color={'white'}>
                                                Total buy-in:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.buyIn}
                                                </Text>
                                            </Text>
                                        </Flex>
                                        <Flex
                                            gap={4}
                                            justifyContent={'space-between'}
                                            direction={{
                                                base: 'column',
                                                xl: 'row',
                                            }}
                                        >
                                            <Text color={'white'}>
                                                Seat:{' '}
                                                <Text
                                                    as={'span'}
                                                    fontWeight={'bold'}
                                                >
                                                    {player.seatId}
                                                </Text>
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Flex>

                                <Flex
                                    gap={{ base: 5, lg: 10 }}
                                    py={{ base: 5, lg: 0 }}
                                    width={'20%'}
                                >
                                    <Button
                                        flex={1}
                                        gap={3}
                                        bg={'green.500'}
                                        border={0}
                                        alignItems={'center'}
                                        _hover={{ background: 'green' }}
                                        onClick={() =>
                                            handleAcceptPlayer(player.uuid)
                                        }
                                    >
                                        <FaCheck />
                                    </Button>
                                    <Button
                                        flex={1}
                                        gap={3}
                                        bg={'red.500'}
                                        border={0}
                                        alignItems={'center'}
                                        _hover={{ background: 'red' }}
                                        onClick={() =>
                                            handleDenyPlayer(player.uuid)
                                        }
                                    >
                                        <IoClose size={25} />
                                    </Button>
                                </Flex>
                            </Flex>
                        );
                    }
                })}
            </>
        );
    }
};

export default PendingPlayers;
