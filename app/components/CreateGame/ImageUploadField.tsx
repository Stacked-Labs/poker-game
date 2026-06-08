'use client';

import { useRef, useState } from 'react';
import {
    Box,
    Flex,
    Icon,
    IconButton,
    Image,
    Text,
    useColorModeValue,
} from '@chakra-ui/react';
import { FiUploadCloud, FiX } from 'react-icons/fi';

const MAX_SIZE_MB = 5;

export interface ImageUploadFieldProps {
    label: string;
    hint?: string;
    /** Current preview URL (object URL or remote), or null when empty. */
    value: string | null;
    onChange: (url: string | null) => void;
    /** logo = compact square; banner = full-width wide strip. */
    variant?: 'logo' | 'banner';
}

/**
 * Frontend-only image picker: reads a chosen file into an object URL for live
 * preview and hands it back via onChange. No upload happens here — the backend
 * wiring (multipart/pre-signed upload + persisted URL) is a follow-up; this just
 * captures the host's pick so the create form, lobby card, and detail page can
 * show it. Supports click + drag-drop, replace, and remove.
 */
export default function ImageUploadField({
    label,
    hint,
    value,
    onChange,
    variant = 'logo',
}: ImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const isBanner = variant === 'banner';

    const border = useColorModeValue(
        'rgba(11, 20, 48, 0.18)',
        'rgba(255, 255, 255, 0.20)'
    );
    const idleBg = useColorModeValue(
        'rgba(11, 20, 48, 0.03)',
        'rgba(255, 255, 255, 0.04)'
    );
    const hoverBorder = useColorModeValue('brand.greenDark', 'brand.green');
    const errorColor = useColorModeValue('red.600', 'red.300');
    const [error, setError] = useState<string | null>(null);

    const setFromFile = (file?: File | null) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please choose an image file.');
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`Image must be under ${MAX_SIZE_MB} MB.`);
            return;
        }
        setError(null);
        if (value?.startsWith('blob:')) URL.revokeObjectURL(value);
        onChange(URL.createObjectURL(file));
    };

    const clear = () => {
        if (value?.startsWith('blob:')) URL.revokeObjectURL(value);
        onChange(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const frame = isBanner
        ? { w: 'full', h: '120px' }
        : { boxSize: '104px' };

    return (
        <Box>
            <Text
                fontSize="sm"
                fontWeight="semibold"
                color="text.secondary"
                mb={1.5}
            >
                {label}
                <Text as="span" color="text.muted" fontWeight="normal" ml={1}>
                    (optional)
                </Text>
            </Text>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setFromFile(e.target.files?.[0])}
            />

            {value ? (
                <Box
                    position="relative"
                    {...frame}
                    borderRadius="12px"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={border}
                >
                    <Image
                        src={value}
                        alt={`${label} preview`}
                        w="full"
                        h="full"
                        objectFit="cover"
                    />
                    <IconButton
                        aria-label={`Remove ${label.toLowerCase()}`}
                        icon={<Icon as={FiX} boxSize="14px" />}
                        size="xs"
                        position="absolute"
                        top={1.5}
                        right={1.5}
                        borderRadius="full"
                        bg="rgba(11, 20, 48, 0.7)"
                        color="white"
                        _hover={{ bg: 'rgba(11, 20, 48, 0.9)' }}
                        onClick={clear}
                    />
                    <Box
                        as="button"
                        type="button"
                        position="absolute"
                        bottom={1.5}
                        right={1.5}
                        px={2}
                        py="2px"
                        borderRadius="full"
                        fontSize="2xs"
                        fontWeight="bold"
                        bg="rgba(11, 20, 48, 0.7)"
                        color="white"
                        _hover={{ bg: 'rgba(11, 20, 48, 0.9)' }}
                        _focusVisible={{
                            outline: '2px solid white',
                            outlineOffset: '-3px',
                        }}
                        onClick={() => inputRef.current?.click()}
                    >
                        Replace
                    </Box>
                </Box>
            ) : (
                <Flex
                    as="button"
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        setFromFile(e.dataTransfer.files?.[0]);
                    }}
                    direction="column"
                    align="center"
                    justify="center"
                    gap={1}
                    {...frame}
                    borderWidth="1.5px"
                    borderStyle="dashed"
                    borderColor={border}
                    borderRadius="12px"
                    bg={idleBg}
                    color="text.muted"
                    textAlign="center"
                    px={3}
                    transition="border-color 140ms ease, color 140ms ease"
                    _hover={{ borderColor: hoverBorder, color: 'text.secondary' }}
                    _focusVisible={{
                        outline: '2px solid',
                        outlineColor: hoverBorder,
                        outlineOffset: '2px',
                    }}
                >
                    <Icon as={FiUploadCloud} boxSize="20px" />
                    <Text fontSize="xs" fontWeight="semibold">
                        Upload {label.toLowerCase()}
                    </Text>
                    {hint && (
                        <Text fontSize="2xs" color="text.muted" lineHeight={1.3}>
                            {hint}
                        </Text>
                    )}
                </Flex>
            )}
            {error && (
                <Text fontSize="2xs" color={errorColor} mt={1.5}>
                    {error}
                </Text>
            )}
        </Box>
    );
}
