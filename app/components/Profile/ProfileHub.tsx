'use client';

import { type ReactNode } from 'react';
import { Container, Flex, Grid, GridItem, Link, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';

interface Tile {
    key: string;
    node: ReactNode;
    span: number;
}

export interface ProfileHubProps {
    isOwn: boolean;
    hero: ReactNode;
    recruit: ReactNode;
    /** Player search, rendered top-right above the hero (mirrors the leaderboard). */
    search?: ReactNode | null;
    quests?: ReactNode | null;
    referral?: ReactNode | null;
    recent?: ReactNode | null;
    hosting?: ReactNode | null;
}

// Pair two tiles into one 12-col row; if only one is present it spans the full width so the
// grid never strands whitespace (the bento tessellation that answers the "empty page" note).
function pair(
    a: ReactNode | null | undefined,
    aKey: string,
    b: ReactNode | null | undefined,
    bKey: string,
    sa: number,
    sb: number
): Tile[] {
    if (a && b) return [{ key: aKey, node: a, span: sa }, { key: bKey, node: b, span: sb }];
    if (a) return [{ key: aKey, node: a, span: 12 }];
    if (b) return [{ key: bKey, node: b, span: 12 }];
    return [];
}

// Pure 12-column bento assembly. One full-width hero, then tessellating tiles per the colSpan
// decision table. Single column on base/md; spans apply at lg. The container supplies the tiles.
export default function ProfileHub({
    isOwn,
    hero,
    recruit,
    search,
    quests,
    referral,
    recent,
    hosting,
}: ProfileHubProps) {
    const tiles: Tile[] = [];
    if (isOwn) {
        tiles.push(...pair(quests, 'quests', referral, 'referral', 6, 6));
        if (hosting) tiles.push({ key: 'hosting', node: hosting, span: 12 });
        if (recent) tiles.push({ key: 'recent', node: recent, span: 12 });
        tiles.push({ key: 'recruit', node: recruit, span: 12 });
    } else {
        tiles.push({ key: 'recruit', node: recruit, span: 12 });
        if (hosting) tiles.push({ key: 'hosting', node: hosting, span: 12 });
        if (recent) tiles.push({ key: 'recent', node: recent, span: 12 });
    }

    return (
        <Container maxW="container.xl" pt={{ base: 24, md: 28 }} pb={{ base: 10, md: 16 }}>
            <VStack align="stretch" spacing={4}>
                {search && (
                    <Flex justify={{ base: 'stretch', sm: 'flex-end' }}>
                        {search}
                    </Flex>
                )}
                {hero}
                <Grid templateColumns="repeat(12, 1fr)" gap={4}>
                    {tiles.map((t) => (
                        <GridItem key={t.key} colSpan={{ base: 12, lg: t.span }} alignSelf="start">
                            {t.node}
                        </GridItem>
                    ))}
                </Grid>
                <Flex justify="center" pt={1}>
                    <Link
                        as={NextLink}
                        href="/leaderboard"
                        color="text.secondary"
                        fontSize="sm"
                        fontWeight={600}
                        _hover={{ color: 'brand.green', textDecoration: 'underline' }}
                    >
                        View the leaderboard
                    </Link>
                </Flex>
            </VStack>
        </Container>
    );
}
