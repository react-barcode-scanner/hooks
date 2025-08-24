import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useScanCanvas, useVideoCanvas, useWebcam } from '../../../hooks';

import './CombinedHook.css';

type SeparateHooksProps = {
    canvasWidth?: number;
    canvasHeight?: number;
    videoWidth?: number;
    videoHeight?: number;
    zoom?: number;
};

const SeparateHooksStories = (props: SeparateHooksProps) => {
    const {
        canvasWidth = 320,
        canvasHeight = 240,
        videoWidth = 640,
        videoHeight = 480,
        zoom = 1,
    } = props;

    const [codes, setCodes] = useState<string[]>([]);

    const onScan = (code: string) => {
        setCodes(codes.concat(code));
    };

    const { webcamVideo, webcamVideoRef, hasPermission } = useWebcam({});
    const { onDraw, canDetect, canvas, canvasRef } = useScanCanvas({ hasPermission, onScan });

    useVideoCanvas({
        onDraw,
        webcamVideo,
        shouldDraw: canDetect,
        canvas,
        hasPermission,
        zoom,
    });

    return (
        <div>
            {hasPermission ? (
                <div className={'scan-canvas-container'}>
                    <div className={'scan-canvas-video'}>
                        <video ref={webcamVideoRef} width={videoWidth} height={videoHeight} />
                    </div>
                    <div className={'scan-canvas'}>
                        <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
                    </div>
                    <div className={'scanned-codes'}>
                        <textarea rows={10} cols={100} readOnly={true} value={codes.join('\n')} />
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const meta: Meta<typeof SeparateHooksStories> = {
    component: SeparateHooksStories,
    title: 'Scanner/Separate Hooks',
};

export default meta;
type Story = StoryObj<typeof SeparateHooksStories>;

export const Primary: Story = {
    args: {
        zoom: 2,
        canvasWidth: 320,
        canvasHeight: 240,
        videoWidth: 640,
        videoHeight: 480,
    },
};
