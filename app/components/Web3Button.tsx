'use client';

import React, { useState } from 'react';
import { Button, ButtonProps, Icon, Spinner } from '@chakra-ui/react';
import { FaWallet } from 'react-icons/fa';
import {
    useActiveAccount,
    useActiveWallet,
    useConnectModal,
    useDisconnect,
} from 'thirdweb/react';
import { client } from '../client';
import { useDisconnectWallet } from '../hooks/disconnectWallet';

interface Web3ButtonProps extends ButtonProps {}

const Web3Button: React.FC<Web3ButtonProps> = (props) => {
    const { connect, isConnecting } = useConnectModal();
    const accountAddress = useActiveAccount()?.address;
    const [isHovered, setIsHovered] = useState(false);
    const handleDisconnectWallet = useDisconnectWallet();

    const handleConnect = async () => {
        await connect({ client });
    };

    const handleDisconnect = () => {
        handleDisconnectWallet();
    };

    return (
        <Button
            variant={'homeSectionButton'}
            border={0}
            leftIcon={
                <Icon
                    as={FaWallet}
                    color="white"
                    boxSize={{ base: 4, md: 6 }}
                />
            }
            bg={'#2D2D2D'}
            _hover={{
                borderColor: 'white',
                borderWidth: '2px',
                bg: '#202020',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={accountAddress ? handleDisconnect : handleConnect}
            fontSize={{ base: 'sm', md: 'md' }}
            px={{ base: 2, md: 3 }}
            py={{ base: '1.5rem', md: '2rem' }}
            {...props}
        >
            {isConnecting ? (
                <Spinner />
            ) : accountAddress ? (
                isHovered ? (
                    'Disconnect'
                ) : (
                    `${accountAddress.substring(0, 4)}...${accountAddress.substring(
                        accountAddress.length - 4
                    )}`
                )
            ) : (
                'Connect'
            )}
        </Button>
    );
};

export default Web3Button;
