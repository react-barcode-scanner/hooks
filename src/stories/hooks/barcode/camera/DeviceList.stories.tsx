import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useGetDeviceList } from '../../../../hooks';

const DeviceListStories = (props: any) => {
    const { deviceList } = useGetDeviceList();

    return (
        <div>
            Device List:{' '}
            <textarea
                readOnly={true}
                rows={10}
                cols={100}
                value={JSON.stringify(deviceList, undefined, 2)}
            />
        </div>
    );
};

const meta: Meta<typeof DeviceListStories> = {
    component: DeviceListStories,
    title: 'Camera/Device List',
};

export default meta;

type Story = StoryObj<typeof DeviceListStories>;

export const Primary: Story = {
    args: {
        hasPermission: true,
    },
};
