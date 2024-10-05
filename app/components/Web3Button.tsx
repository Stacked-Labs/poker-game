'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button, ButtonProps, Icon } from '@chakra-ui/react';
import { FaWallet } from 'react-icons/fa';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useSignMessage } from 'wagmi';
import { useWeb3ModalState } from '@web3modal/wagmi/react';
import { authenticateUser } from '@/app/hooks/server_actions';

interface Web3ButtonProps extends ButtonProps {}

const Web3Button: React.FC<Web3ButtonProps> = (props) => {
    const { open } = useWeb3Modal();
    const { address, isConnecting, isConnected } = useAccount();
    const { open: isOpen } = useWeb3ModalState();
    const [buttonText, setButtonText] = useState('Connect');
    const { signMessageAsync } = useSignMessage();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const hasRequestedSignature = useRef(false); // Ref to track signature request

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

    const requestSignature = useCallback(async () => {
        if (!isConnected || !address || hasRequestedSignature.current) return;
        if (localStorage.getItem('authToken')) return;

        setIsAuthenticating(true);
        hasRequestedSignature.current = true; // Prevent multiple requests
        console.log('Requesting signature...');
        try {
            const message = `I agree to the following terms and conditions:

1. Stacked is not responsible for any funds used on this platform.
2. This is a testing phase and the platform may contain bugs or errors.
3. I am using this platform at my own risk.

Signing Address: ${address}
Timestamp: ${Date.now()}`;

            console.log('Signing message...');
            const signature = await signMessageAsync({ message });
            console.log('Message signed, authenticating...');
            const token = await authenticateUser(address, signature, message);
            localStorage.setItem('authToken', token);
            console.log('Authentication complete');
            window.dispatchEvent(new Event('authenticationComplete'));
        } catch (error) {
            console.error('Authentication failed:', error);
            hasRequestedSignature.current = false; // Reset on failure
        } finally {
            setIsAuthenticating(false);
        }
    }, [signMessageAsync, isConnected, address]);

    useEffect(() => {
        if (!address || !isConnected) return;

        const handleAuthentication = async () => {
            if (localStorage.getItem('authToken')) {
                console.log('Auth token found, skipping authentication');
                window.dispatchEvent(
                    new Event('authenticationComplete', { bubbles: true })
                );
                return;
            }

            await requestSignature();
        };

        handleAuthentication();
    }, [requestSignature, address, isConnected]);

    const handleOpen = () => {
        console.log('here');
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
            type="submit"
            onClick={handleOpen}
            {...props}
        >
            {buttonText}
        </Button>
    );
};

export default Web3Button;
