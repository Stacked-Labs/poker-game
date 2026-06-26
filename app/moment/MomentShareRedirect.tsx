'use client';

import { useEffect } from 'react';
import { Flex, Spinner } from '@chakra-ui/react';

// Client bounce for the moment share page. Crawlers (Twitterbot/Telegram) read the server-rendered
// <meta> tags for the unfurl card; real visitors are sent on into the loop (the tournament for
// event moments, the player's profile/leaderboard for status moments). Mirrors RankShareRedirect.
export default function MomentShareRedirect({ destination }: { destination: string }) {
    useEffect(() => {
        const t = setTimeout(() => {
            window.location.replace(destination);
        }, 50);
        return () => clearTimeout(t);
    }, [destination]);

    return (
        <Flex minH="100vh" align="center" justify="center" bg="card.lightGray">
            <Spinner size="xl" color="brand.green" />
        </Flex>
    );
}
