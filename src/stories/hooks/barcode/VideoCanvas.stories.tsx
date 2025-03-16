import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { useVideoCanvas, useWebcam } from '../../../hooks';

const VideoCanvasStories = () => {
    const { webcamVideo, webcamVideoRef, hasPermission } = useWebcam();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useVideoCanvas({
        webcamVideo,
        canvas: canvasRef.current,
        hasPermission,
        shouldPlay: true,
    });

    return (
        <div>
            {hasPermission ? (
                <div className={'video-canvas-container'}>
                    <div className={'video-canvas-video'}>
                        <video ref={webcamVideoRef} width={640} height={480} />
                    </div>
                    <div className={'video-canvas'}>
                        <canvas ref={canvasRef} width={320} height={240} />
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const meta: Meta<typeof VideoCanvasStories> = {
    component: VideoCanvasStories,
    title: 'Video/Video Canvas',
};

export default meta;
type Story = StoryObj<typeof VideoCanvasStories>;

export const Primary: Story = {
    args: {},
};
