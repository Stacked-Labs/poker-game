import { Button, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';
import { IconType } from 'react-icons/lib';

const SocialsBox = ({
    logo,
    text,
    link,
}: {
    logo: IconType;
    text: string;
    link: string;
}) => {
    return (
        <VStack flex={1} gap={10}>
            <Link href={link}>
                <Button
                    as={logo} boxSize={230}
                    variant={'social'}
                    size={{ base: 'md', md: 'lg' }}
                />
            </Link>
            <Text textAlign={'justify'}>{text}</Text>
        </VStack>
    );
};

export default SocialsBox;
