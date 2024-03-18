'use client';
import React, { useEffect, useState } from 'react';
import { Button, Icon, Text } from '@chakra-ui/react';
import { FaWallet } from 'react-icons/fa';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useWeb3ModalState } from '@web3modal/wagmi/react';

const Web3Button = () => {
    const { open } = useWeb3Modal();
    const { address, isConnecting } = useAccount();
    const { open: isOpen } = useWeb3ModalState();
    const [buttonText, setButtonText] = useState('Connect');

    useEffect(() => {
        if (isConnecting || (isOpen && !address)) {
            setButtonText('Connecting...');
        } else if (address) {
            setButtonText(
                `${address.substring(0, 4)}...${address.substring(
                    address.length - 4
                )}`
            );
        } else {
            setButtonText('Connect');
        }
    }, [address, isConnecting, isOpen]);

    const handleOpen = () => {
        open();
    };

    return (
        <Button
            size="lg"
            w={'80%'}
            h={12}
            leftIcon={<Icon as={FaWallet} color="white" />}
            bg="green.500"
            color="white"
            _hover={{
                borderColor: 'white',
                borderWidth: '2px',
            }}
            type="submit"
            onClick={() => handleOpen()}
        >
            {buttonText}
        </Button>
    );
};

export default Web3Button;
