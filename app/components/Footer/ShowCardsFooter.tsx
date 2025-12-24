'use client';

import { Flex } from '@chakra-ui/react';
import ActionButton from './ActionButton';
import SeatRequestStatusBadge from './SeatRequestStatusBadge';

type ShowCardsFooterProps = {
    onShowCards: () => void;
    isDisabled: boolean;
};

const ShowCardsFooter = ({ onShowCards, isDisabled }: ShowCardsFooterProps) => {
    return (
        <Flex
            className="footer-show-cards"
            overflow="visible"
            alignItems="center"
            bg="transparent"
            width="100%"
            position="relative"
            sx={{
                '@media (orientation: portrait)': {
                    justifyContent: 'space-between',
                    gap: '1%',
                    padding: '1%',
                    height: '100%',
                    maxHeight: '70px',
                    minHeight: '50px',
                },
                '@media (orientation: landscape)': {
                    justifyContent: 'flex-end',
                    gap: '0.8%',
                    height: '100%',
                },
            }}
        >
            <ActionButton
                text="Show Cards"
                color="green"
                clickHandler={onShowCards}
                isDisabled={isDisabled}
                hotkey=""
            />
            <SeatRequestStatusBadge />
        </Flex>
    );
};

export default ShowCardsFooter;

