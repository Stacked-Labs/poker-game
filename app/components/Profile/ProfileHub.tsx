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
    connectX?: ReactNode | null;
    quests?: ReactNode | null;
    referral?: ReactNode | null;
    record?: ReactNode | null;
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
    connectX,
    quests,
    referral,
    record,
    recent,
    hosting,
}: ProfileHubProps) {
    const tiles: Tile[] = [];
    if (isOwn) {
        if (connectX) tiles.push({ key: 'connectX', node: connectX, span: 12 });
        tiles.push(...pair(quests, 'quests', referral, 'referral', 6, 6));
        tiles.push(...pair(record, 'record', hosting, 'hosting', 8, 4));
        if (recent) tiles.push({ key: 'recent', node: recent, span: 12 });
        tiles.push({ key: 'recruit', node: recruit, span: 12 });
    } else {
        tiles.push({ key: 'recruit', node: recruit, span: 12 });
        tiles.push(...pair(record, 'record', hosting, 'hosting', 8, 4));
        if (recent) tiles.push({ key: 'recent', node: recent, span: 12 });
    }

    return (
        <Container maxW="container.xl" py={{ base: 5, md: 8 }}>
            <VStack align="stretch" spacing={4}>
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
