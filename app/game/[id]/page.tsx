'use client';

import { Flex, Grid, GridItem, useBreakpointValue } from '@chakra-ui/react';
import EmptySeatButton from '@/app/components/EmptySeatButton';
import { useContext } from 'react';
import { MetaStateContext } from '@/app/state';
import TakenSeatButton from '@/app/components/TakenSeatButton';
import CommunityCards from '@/app/components/CommunityCards/CommunityCards';
import { useCurrentUser } from '@/app/contexts/CurrentUserProvider';

const seatIndices = [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'current',
];

const templateGridLarge = `"a one two three b"
                          "four cards cards cards five"
                          "six cards cards cards seven"
                          "c eight current nine d"`;

const templateGridSmall = `"a one b"
                          "two c three"
                          "four d five"
                          "cards cards cards"
                          "six e seven"
                          "eight current nine"`;

const MainGamePage = () => {
    const { User, isUserSitting } = useContext(MetaStateContext);
    const shouldRotate = useBreakpointValue({ base: true, xl: false }) ?? false;
    const currentUser = useCurrentUser();
    console.log('SEATID', currentUser.currentUser.seatId);
    return (
        <Flex w={'100%'} h={'100%'}>
            <Flex
                mx={'auto'}
                position="relative"
                justifyContent={'center'}
                alignItems={'center'}
                aspectRatio={shouldRotate ? '9 / 12' : '16 / 9'}
                backgroundImage={
                    !shouldRotate
                        ? '/table-horizontal.png'
                        : '/table-vertical.png'
                }
                backgroundRepeat="no-repeat"
                backgroundPosition="center"
                backgroundSize={'contain'}
            >
                <Grid
                    templateAreas={
                        !shouldRotate ? templateGridLarge : templateGridSmall
                    }
                    gridTemplateRows={
                        !shouldRotate ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)'
                    }
                    gridTemplateColumns={
                        !shouldRotate ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)'
                    }
                    gap={4}
                    h={'100%'}
                    w={['90%', '100%']}
                    placeItems="center"
                    justifyContent={'center'}
                    position={'absolute'}
                >
                    {seatIndices
                        .filter(
                            (gridIndex) =>
                                !(
                                    gridIndex === 'current' &&
                                    currentUser.currentUser.seatId
                                )
                        )
                        .map((gridIndex: string, index: number) => (
                            <GridItem
                                key={index}
                                area={gridIndex}
                                width={'100%'}
                                display={'flex'}
                                alignItems={'center'}
                                height={'100%'}
                            >
                                <EmptySeatButton
                                    seatId={index}
                                    disabled={isUserSitting}
                                />
                            </GridItem>
                        ))}
                    {currentUser.currentUser.seatId && (
                        <GridItem
                            area={'current'}
                            width={'100%'}
                            display={'flex'}
                            alignItems={'center'}
                            height={'100%'}
                        >
                            <TakenSeatButton player={User} seatId={currentUser.currentUser.seatId} />
                        </GridItem>
                    )}
                    <GridItem
                        height={'fit-content'}
                        width={'100%'}
                        area={'cards'}
                    >
                        <CommunityCards />
                    </GridItem>
                </Grid>
            </Flex>
        </Flex>
    );
};

export default MainGamePage;
