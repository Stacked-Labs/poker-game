'use client';

import React, { useEffect, useState } from 'react';
import { Button, Icon, ButtonProps } from '@chakra-ui/react';
import { FaWallet } from 'react-icons/fa';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useWeb3ModalState } from '@web3modal/wagmi/react';

interface Web3ButtonProps extends ButtonProps {}

const Web3Button: React.FC<Web3ButtonProps> = (props) => {
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
            leftIcon={<Icon as={FaWallet} color="white" />}
            bg="green.500"
            color="white"
            _hover={{
                borderColor: 'white',
                borderWidth: '2px',
            }}
            type="submit"
            onClick={() => handleOpen()}
            {...props}
        >
            {buttonText}
        </Button>
    );
};

export default Web3Button;
