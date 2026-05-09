'use client';

import { Icon, Link, LinkProps } from '@chakra-ui/react';
import { FiExternalLink } from 'react-icons/fi';

interface ExternalLinkProps extends Omit<LinkProps, 'href' | 'isExternal'> {
    href: string;
    iconSize?: string;
}

/**
 * ExternalLink — standardized external linkout for Settings (and beyond).
 * Quiet at rest, brand.green on hover, with a trailing FiExternalLink hint.
 */
const ExternalLink = ({
    href,
    children,
    iconSize = '11px',
    ...props
}: ExternalLinkProps) => {
    return (
        <Link
            href={href}
            isExternal
            display="inline-flex"
            alignItems="center"
            gap="3px"
            color="brand.navy"
            _dark={{ color: 'brand.lightGray' }}
            transition="color 80ms ease"
            _hover={{
                color: 'brand.green',
                textDecoration: 'underline',
                textDecorationThickness: '1.5px',
                textUnderlineOffset: '3px',
                '& .external-icon': { opacity: 1 },
            }}
            sx={{
                '& .external-icon': {
                    opacity: 0.6,
                    transition: 'opacity 80ms ease',
                },
            }}
            {...props}
        >
            {children}
            <Icon
                as={FiExternalLink}
                className="external-icon"
                boxSize={iconSize}
                aria-hidden
            />
        </Link>
    );
};

export default ExternalLink;
