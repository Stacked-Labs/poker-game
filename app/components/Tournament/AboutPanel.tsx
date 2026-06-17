'use client';

import { useState } from 'react';
import {
    Box,
    Button,
    Flex,
    HStack,
    Icon,
    IconButton,
    Text,
    Textarea,
    VStack,
} from '@chakra-ui/react';
import { FiEdit2 } from 'react-icons/fi';

const MAX_DESCRIPTION = 2000;

export interface AboutPanelProps {
    value: string;
    canEdit: boolean;
    onSave: (text: string) => void;
    cardBg: string;
    border: string;
}

// "About this tournament" — a dedicated body card for the Host's description.
// A tall-over-wide reading column that preserves the Host's paragraphs and
// blank lines (whiteSpace pre-line + blank-line paragraph splitting) at a capped
// measure for legibility. The Host edits in place (no drawer), consistent with
// the rest of the detail page. Frontend skeleton: the backend persists the
// plain string later.
export default function AboutPanel({
    value,
    canEdit,
    onSave,
    cardBg,
    border,
}: AboutPanelProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const begin = () => {
        setDraft(value);
        setEditing(true);
    };
    const save = () => {
        onSave(draft.trim());
        setEditing(false);
    };

    const hasContent = value.trim().length > 0;
    // Blank-line-separated blocks become real vertical gaps; single newlines
    // inside a block stay as soft line breaks via whiteSpace: pre-line.
    const paragraphs = value.split(/\n{2,}/).map((p) => p.replace(/\s+$/, ''));

    return (
        <Box
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="14px"
            boxShadow="card.lift"
            p={{ base: 4, md: 6 }}
            overflow="hidden"
            role="group"
        >
            <Flex justify="space-between" align="center" gap={3} mb={3}>
                <Text
                    fontSize="2xs"
                    color="text.muted"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    fontWeight="semibold"
                >
                    About this tournament
                </Text>
                {canEdit && !editing && hasContent && (
                    <IconButton
                        aria-label="Edit description"
                        icon={<Icon as={FiEdit2} boxSize="13px" />}
                        size="xs"
                        variant="tactileGhost"
                        color="text.muted"
                        flexShrink={0}
                        opacity={{ base: 1, md: 0 }}
                        _groupHover={{ opacity: 1 }}
                        onClick={begin}
                    />
                )}
            </Flex>

            {editing ? (
                <Box>
                    <Textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        maxLength={MAX_DESCRIPTION}
                        rows={6}
                        minH="200px"
                        resize="vertical"
                        autoFocus
                        fontSize="sm"
                        lineHeight={1.6}
                        placeholder="Tell players what to expect. Leave a blank line between paragraphs for sections like Additional prizes or House rules."
                    />
                    <HStack justify="space-between" mt={2}>
                        <HStack spacing={2}>
                            <Button
                                size="xs"
                                variant="tactilePrimary"
                                onClick={save}
                            >
                                Save
                            </Button>
                            <Button
                                size="xs"
                                variant="tactileGhost"
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </Button>
                        </HStack>
                        <Text fontSize="2xs" color="text.muted">
                            {draft.length} / {MAX_DESCRIPTION}
                        </Text>
                    </HStack>
                </Box>
            ) : hasContent ? (
                <VStack
                    align="stretch"
                    spacing={3}
                    maxW={{ base: 'full', md: '62ch' }}
                >
                    {paragraphs.map((p, i) => (
                        <Text
                            key={i}
                            color="text.secondary"
                            fontSize={{ base: 'sm', md: 'md' }}
                            lineHeight={1.6}
                            whiteSpace="pre-line"
                            overflowWrap="anywhere"
                        >
                            {p}
                        </Text>
                    ))}
                </VStack>
            ) : canEdit ? (
                <Button
                    size="sm"
                    variant="tactileGhost"
                    leftIcon={<Icon as={FiEdit2} boxSize="13px" />}
                    onClick={begin}
                    color="text.muted"
                >
                    Add details for your players
                </Button>
            ) : null}
        </Box>
    );
}
