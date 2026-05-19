'use client';

import { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import ActionButton from './ActionButton';
import SeatRequestStatusBadge from './SeatRequestStatusBadge';
import { HOTKEY_SHOW_CARDS } from './constants';

type ShowCardsFooterProps = {
    onShowCards: () => void;
    isDisabled: boolean;
};

const ShowCardsFooter = ({ onShowCards, isDisabled }: ShowCardsFooterProps) => {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() !== HOTKEY_SHOW_CARDS) return;
            const active = document.activeElement as HTMLElement | null;
            const isEditableElement =
                active &&
                (active.tagName === 'INPUT' ||
                    active.tagName === 'TEXTAREA' ||
                    active.isContentEditable);
            if (isEditableElement || isDisabled) return;
            onShowCards();
            e.preventDefault();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onShowCards, isDisabled]);

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
                hotkey={HOTKEY_SHOW_CARDS}
            />
            <SeatRequestStatusBadge />
        </Flex>
    );
};

export default ShowCardsFooter;

