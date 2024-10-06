// hooks/useToastHelper.ts
import { useToast } from '@chakra-ui/react';
import {
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
} from '../utils/toastConfig';

const useToastHelper = () => {
    const toast = useToast();

    const success = (
        title: string,
        description?: string,
        duration?: number
    ) => {
        showSuccessToast(toast, title, description, duration);
    };

    const error = (title: string, description?: string, duration?: number) => {
        showErrorToast(toast, title, description, duration);
    };

    const warning = (
        title: string,
        description?: string,
        duration?: number
    ) => {
        showWarningToast(toast, title, description, duration);
    };

    const info = (title: string, description?: string, duration?: number) => {
        showInfoToast(toast, title, description, duration);
    };

    return { success, error, warning, info };
};

export default useToastHelper;
