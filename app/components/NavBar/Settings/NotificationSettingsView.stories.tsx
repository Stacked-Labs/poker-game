import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import NotificationSettingsView from './NotificationSettingsView';

const noop = () => {};

const meta: Meta<typeof NotificationSettingsView> = {
    title: 'Settings/NotificationSettings',
    component: NotificationSettingsView,
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <Box bg="bg.default" p={{ base: 4, md: 8 }} maxW="440px" mx="auto">
                <Story />
            </Box>
        ),
    ],
    args: {
        isSupported: true,
        isIOSNonPWA: false,
        permission: 'granted',
        pushOn: true,
        remindersOn: true,
        pushBusy: false,
        savingReminders: false,
        prefsLoading: false,
        onPushToggle: noop,
        onRemindersToggle: noop,
    },
};
export default meta;
type Story = StoryObj<typeof NotificationSettingsView>;

export const AllOn: Story = {};
export const PushOff: Story = { args: { pushOn: false } };
export const Unsupported: Story = { args: { isSupported: false, pushOn: false } };
export const IOSNeedsPWA: Story = { args: { isIOSNonPWA: true, pushOn: false } };
