'use client';

import React, { useEffect, useState } from 'react';
import { Button, ButtonProps, Icon } from '@chakra-ui/react';
import { FaWallet } from 'react-icons/fa';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';

interface Web3ButtonProps extends ButtonProps {}

const Web3Button: React.FC<Web3ButtonProps> = (props) => {
    const { open } = useWeb3Modal();
    const { address, isConnecting, isConnected } = useAccount();
    const [buttonText, setButtonText] = useState('Connect');

    useEffect(() => {
        if (isConnecting) {
            setButtonText('Connecting...');
        } else if (isConnected && address) {
            setButtonText(
                `${address.substring(0, 4)}...${address.substring(
                    address.length - 4
                )}`
            );
        } else {
            setButtonText('Connect');
        }
    }, [address, isConnecting, isConnected]);

    const handleOpen = () => {
        open();
    };

    return (
        <Button
            variant={'homeSectionButton'}
            border={0}
            leftIcon={<Icon as={FaWallet} color="white" />}
            bg={'#2D2D2D'}
            _hover={{
                borderColor: 'white',
                borderWidth: '2px',
                bg: '#202020',
            }}
            onClick={handleOpen}
            {...props}
        >
            {buttonText}
        </Button>
    );
};

export default Web3Button;
