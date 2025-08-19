import { PendingPlayer } from '@/app/interfaces';
import { Flex, Box, Button, Text, Tooltip, VStack } from '@chakra-ui/react';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { GiBootKick } from 'react-icons/gi';

const PlayerCard = ({
    index,
    player,
    isOwner,
    type,
    isKicking,
    handleAcceptPlayer,
    handleDenyPlayer,
    confirmKick,
}: {
    index: number;
    player: PendingPlayer;
    isOwner: boolean;
    type: 'accepted' | 'pending';
    isKicking: boolean | null;
    handleAcceptPlayer?: ((uuid: string) => void) | null;
    handleDenyPlayer?: ((uuid: string) => void) | null;
    confirmKick?: ((player: PendingPlayer) => void) | null;
}) => {
    return (
        <Flex
            key={index}
            alignItems={'center'}
            justifyContent={'space-between'}
            width={{ base: '90vw', md: '70%' }}
            borderColor={'grey'}
            borderWidth={2}
            borderRadius={10}
            paddingX={{ base: 5, md: 10 }}
            paddingY={{ base: 2, md: 5 }}
        >
            <VStack
                flex={1}
                justifyContent={{ base: 'center', lg: 'space-around' }}
                alignItems={'start'}
                textAlign={'left'}
                gap={2}
            >
                <Text
                    color={'white'}
                    fontWeight={'bold'}
                    fontSize={{ base: 'xl', lg: '2xl' }}
                >
                    {player.username}
                </Text>
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
                                <Text fontSize={'small'} color={'white'}>
                                    ID: {player.uuid.substring(0, 8)}
                                </Text>
                            </Box>
                        </Flex>
                        <Text color={'white'}>
                            Total buy-in:{' '}
                            <Text as={'span'} fontWeight={'bold'}>
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
                            <Text as={'span'} fontWeight={'bold'}>
                                {player.seatId}
                            </Text>
                        </Text>
                    </Flex>
                </Flex>
            </VStack>

            {isOwner &&
                type == 'pending' &&
                handleAcceptPlayer &&
                handleDenyPlayer && (
                    <Flex gap={{ base: 2, lg: 3 }} py={{ base: 3, lg: 0 }}>
                        <Button
                            variant={'settingsSmallButton'}
                            bg={'green.500'}
                            _hover={{ background: 'green' }}
                            onClick={() => handleAcceptPlayer(player.uuid)}
                        >
                            <FaCircleCheck />
                        </Button>
                        <Button
                            variant={'settingsSmallButton'}
                            bg={'red.500'}
                            _hover={{ background: 'red' }}
                            onClick={() => handleDenyPlayer(player.uuid)}
                        >
                            <FaCircleXmark />
                        </Button>
                    </Flex>
                )}

            {isOwner &&
                type == 'accepted' &&
                isKicking !== null &&
                confirmKick && (
                    <Tooltip label="Kick Player" placement="top">
                        <Button
                            variant={'settingsSmallButton'}
                            bg={'red.500'}
                            _hover={{
                                background: 'red.600',
                            }}
                            onClick={() => confirmKick(player)}
                            isLoading={isKicking}
                            loadingText="Kicking..."
                            color="white"
                            my={{ base: 3, lg: 6 }}
                        >
                            <GiBootKick size={20} />
                        </Button>
                    </Tooltip>
                )}
        </Flex>
    );
};

export default PlayerCard;
