import React, { ChangeEvent, useEffect, useMemo, useRef } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useBarcodeScanner } from '../../../hooks';

import './CombinedHook.css';

type CombinedHookStoriesProps = {
    canvasWidth?: number;
    canvasHeight?: number;
    videoWidth?: number;
    videoHeight?: number;
    videoCropWidth?: number;
    videoCropHeight?: number;
    zoom?: number;
};

const CombinedHookStories = (props: CombinedHookStoriesProps) => {
    const {
        canvasWidth = 640,
        canvasHeight = 480,
        videoWidth = 640,
        videoHeight = 480,
        videoCropWidth = 640,
        videoCropHeight = 376,
        zoom = 1,
    } = props;

    const [codes, setCodes] = useState<string[]>([]);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [deviceId, setDeviceId] = useState<string>();

    const deviceChoiceOptions = useMemo(() => {
        if (!deviceId) {
            return undefined;
        }
        return { deviceId: { exact: deviceId } };
    }, [deviceId]);

    void devices;

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
        deviceChoiceOptions,
    });

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        containerRef.current?.style.setProperty('--video-width', `${videoWidth}px`);
        containerRef.current?.style.setProperty('--video-height', `${videoHeight}px`);
        containerRef.current?.style.setProperty('--canvas-width', `${canvasWidth}px`);
        containerRef.current?.style.setProperty('--canvas-height', `${canvasHeight}px`);
        containerRef.current?.style.setProperty('--video-crop-width', `${videoCropWidth}px`);
        containerRef.current?.style.setProperty('--video-crop-height', `${videoCropHeight}px`);
    }, [
        containerRef.current,
        videoWidth,
        videoHeight,
        canvasWidth,
        canvasHeight,
        videoCropWidth,
        videoCropHeight
    ]);

    const handleCameraChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setDeviceId(event.currentTarget.value);
    };

    return (
        <div>
            {hasPermission ? (
                <div ref={containerRef} className={'react-barcode-scanner-container'}>
                    <video
                        ref={webcamVideoRef}
                        width={videoWidth}
                        height={videoHeight}
                        playsInline={true}
                    />
                    <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
                </div>
            ) : null}
            {devices.length > 0 && <div className="devices-container">
                <select onChange={handleCameraChange}>
                    {devices.map((device: MediaDeviceInfo) => {
                        return <option key={device.deviceId} value={device.deviceId}>
                            {device.label} ({device.deviceId.slice(0, 8)}...)
                        </option>;
                    })}
                </select>
            </div>}
            <div className={'scanned-codes'}>
                <textarea rows={10} cols={100} readOnly={true} value={codes.join('\n')} />
            </div>
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
        zoom: 1,
        canvasWidth: 480,
        canvasHeight: 376,
        videoWidth: 480,
        videoHeight: 376,
        videoCropWidth: 288,
        videoCropHeight: 188,
    },
};
