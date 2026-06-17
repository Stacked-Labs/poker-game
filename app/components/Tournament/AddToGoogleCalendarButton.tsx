'use client';

import { Button, Icon } from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import type { Tournament } from '../../hooks/server_actions';
import { generateGoogleCalendarUrl } from '../../lib/calendarExport';

interface AddToGoogleCalendarButtonProps {
    tournament: Tournament;
}

// Quiet secondary on the registration confirmation surface, and the fallback
// for players without web push (notably web-only iOS). One straightforward
// action: drop the start on Google Calendar. No menu, no format choices.
export default function AddToGoogleCalendarButton({
    tournament,
}: AddToGoogleCalendarButtonProps) {
    const calendarUrl = generateGoogleCalendarUrl(tournament);

    // No usable start instant: skip the action rather than offer a broken one.
    if (!calendarUrl) return null;

    const openCalendar = () => {
        window.open(calendarUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <Button
            variant="tactileNeutral"
            w="full"
            minH="44px"
            leftIcon={<Icon as={FiCalendar} boxSize={4} aria-hidden />}
            _focusVisible={{ boxShadow: 'outline' }}
            onClick={openCalendar}
        >
            Add to Google Calendar
        </Button>
    );
}
