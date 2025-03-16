import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useHasCameraPermission } from '../../../../hooks';

const CameraPermissionExample = (props: any) => {
    const { Component, ...rest } = props;
    return <Component {...rest} />;
};

const HasCameraPermissionExample = () => {
    const { hasPermission } = useHasCameraPermission();
    return <div>Has Camera Permission: {hasPermission.toString()}</div>;
};

const meta: Meta<typeof CameraPermissionExample> = {
    component: CameraPermissionExample,
    title: 'Camera/Permission',
};

export default meta;
type Story = StoryObj<typeof WebcamStories>;

export const Primary: Story = {
    args: {
        Component: HasCameraPermissionExample,
    },
};
