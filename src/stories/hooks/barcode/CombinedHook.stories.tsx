import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useBarcodeScanner } from '../../../hooks';

import './CombinedHook.css';

type CombinedHookStoriesProps = {
    canvasWidth?: number;
    canvasHeight?: number;
    videoWidth?: number;
    videoHeight?: number;
    zoom?: number;
};

const CombinedHookStories = (props: CombinedHookStoriesProps) => {
    const {
        canvasWidth = 640,
        canvasHeight = 480,
        videoWidth = 640,
        videoHeight = 480,
        zoom = 1,
    } = props;

    const [codes, setCodes] = useState<string[]>([]);
    const [devices, setDevices] = useState<any[]>([]);

    const onScan = (code: string) => {
        setCodes(codes.concat(code));
    };

    const onDevices = (devices: any[]) => {
        setDevices(devices);
    };

    const { webcamVideoRef, canvasRef, hasPermission } = useBarcodeScanner({
        zoom,
        onDevices,
        onScan,
    });

    return (
        <div>
            {hasPermission ? (
                <div className={'scan-canvas-container'}>
                    <div className={'scan-canvas-video'}>
                        <video
                            ref={webcamVideoRef}
                            width={videoWidth}
                            height={videoHeight}
                            playsInline={true}
                        />
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

const meta: Meta<typeof CombinedHookStories> = {
    component: CombinedHookStories,
    title: 'Scanner/Combined Hook',
};

export default meta;
type Story = StoryObj<typeof CombinedHookStories>;

export const Primary: Story = {
    args: {
        zoom: 2,
        canvasWidth: 512,
        canvasHeight: 384,
        videoWidth: 640,
        videoHeight: 480,
    },
};
