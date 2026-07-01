'use client';

import NextLink from 'next/link';
import { Tooltip, IconButton, Icon } from '@chakra-ui/react';
import { FiHome } from 'react-icons/fi';

// The consistent "back to the lobby" affordance for /table pages (cash AND
// tournament). Deliberately distinct from LeaveButton — that one cashes out your
// seat (a money/settlement action); this is pure navigation to the public games
// list, so it's a link, styled like the Settings chip and pinned top-left.
const HomeButton = () => {
    return (
        <Tooltip label="Back to lobby">
            <IconButton
                as={NextLink}
                href="/public-games"
                data-testid="home-btn"
                icon={<Icon as={FiHome} boxSize={{ base: 4, md: 5 }} />}
                aria-label="Back to lobby"
                variant="tactileChromeSolid"
                size="md"
                px={2}
                py={2}
                width={{ base: '40px', sm: '40px', md: '48px' }}
                height={{ base: '40px', sm: '40px', md: '48px' }}
            />
        </Tooltip>
    );
};

export default HomeButton;
