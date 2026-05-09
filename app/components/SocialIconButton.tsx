'use client';

import {
    Button,
    ButtonProps,
    IconButton,
    IconButtonProps,
} from '@chakra-ui/react';
import { ReactElement, forwardRef } from 'react';
import { RiTwitterXLine } from 'react-icons/ri';
import { FaDiscord, FaTelegram } from 'react-icons/fa';

export type SocialTone = 'x' | 'discord' | 'telegram';

const TONES: Record<
    SocialTone,
    { bg: string; edge: string; pressBg: string; label: string; icon: ReactElement }
> = {
    x: {
        bg: '#0F1419',
        edge: '#000000',
        pressBg: '#000000',
        label: 'X',
        icon: <RiTwitterXLine />,
    },
    discord: {
        bg: '#5865F2',
        edge: '#3F4ABF',
        pressBg: '#4752D6',
        label: 'Discord',
        icon: <FaDiscord />,
    },
    telegram: {
        bg: '#0088CC',
        edge: '#006A9D',
        pressBg: '#0077B5',
        label: 'Telegram',
        icon: <FaTelegram />,
    },
};

const DIMS = { sm: 36, md: 40, lg: 44 };

type ChipSize = keyof typeof DIMS;

type CommonProps = {
    tone: SocialTone;
    chipSize?: ChipSize;
};

type IconOnlyProps = CommonProps &
    Omit<IconButtonProps, 'aria-label' | 'icon'> & {
        label?: undefined;
        'aria-label'?: string;
    };

type LabeledProps = CommonProps &
    Omit<ButtonProps, 'leftIcon' | 'children'> & {
        label: string;
    };

export type SocialIconButtonProps = IconOnlyProps | LabeledProps;

function tactileStyle(tone: SocialTone) {
    const t = TONES[tone];
    return {
        bg: t.bg,
        color: 'white',
        border: 'none',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 0 ${t.edge}`,
        transition:
            'transform 80ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 80ms ease, background-color 80ms ease',
        _hover: { bg: t.bg },
        _active: {
            bg: t.pressBg,
            transform: 'translateY(2px)',
            boxShadow: `inset 0 2px 4px rgba(0,0,0,0.20), 0 0 0 ${t.edge}`,
        },
    } as const;
}

export const SocialIconButton = forwardRef<HTMLButtonElement, SocialIconButtonProps>(
    function SocialIconButton(props, ref) {
        const { tone, chipSize = 'md', ...rest } = props as SocialIconButtonProps & {
            chipSize?: ChipSize;
        };
        const t = TONES[tone];
        const dim = DIMS[chipSize];
        const tactile = tactileStyle(tone);

        if ('label' in rest && rest.label) {
            const { label, ...buttonRest } = rest as LabeledProps;
            return (
                <Button
                    ref={ref}
                    leftIcon={t.icon}
                    fontWeight={700}
                    letterSpacing="0.02em"
                    borderRadius="10px"
                    height={`${dim - 4}px`}
                    px={4}
                    {...tactile}
                    {...buttonRest}
                >
                    {label}
                </Button>
            );
        }

        const iconRest = rest as Omit<IconOnlyProps, 'tone' | 'chipSize'>;
        const ariaLabel = iconRest['aria-label'] ?? t.label;
        return (
            <IconButton
                ref={ref}
                aria-label={ariaLabel}
                icon={t.icon}
                borderRadius="10px"
                w={`${dim}px`}
                h={`${dim}px`}
                minW={`${dim}px`}
                {...tactile}
                {...iconRest}
            />
        );
    },
);
