import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useWebcam } from '../../../hooks';

const WebcamStories = (props: any) => {
    const { webcamVideoRef, hasPermission } = useWebcam({});

    return (
        <div>{hasPermission ? <video ref={webcamVideoRef} width={640} height={480} autoPlay={true} /> : null}</div>
    );
};

const meta: Meta<typeof WebcamStories> = {
    component: WebcamStories,
    title: 'Video/Webcam',
};

export default meta;
type Story = StoryObj<typeof WebcamStories>;

export const Primary: Story = {
    args: {},
};
