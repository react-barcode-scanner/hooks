import { useEffect, useMemo, useRef, useState } from 'react';
import {
    DeviceChoiceOptions,
    useDeviceStream,
    useGetDeviceList,
    useHasCameraPermission,
} from './camera';

const defaultDeviceChoiceOptions: DeviceChoiceOptions = {
    matchers: [/back ultra/i, /back/i],
    facingMode: 'environment',
};

export type UseWebcamOptions = {
    deviceChoiceOptions?: DeviceChoiceOptions;
    onDevices?: (deviceList: MediaDeviceInfo[]) => void;
};

export const useWebcam = (options: UseWebcamOptions = {}) => {
    const { deviceChoiceOptions, onDevices } = options;

    const { hasPermission } = useHasCameraPermission();

    const webcamVideoRef = useRef<HTMLVideoElement>(null);
    const [webcamVideo, setWebcamVideo] = useState<HTMLVideoElement>();

    useEffect(() => {
        if (!(hasPermission && webcamVideoRef.current)) {
            return;
        }
        setWebcamVideo(webcamVideoRef.current);
    }, [hasPermission, webcamVideoRef]);

    const { deviceList } = useGetDeviceList(hasPermission, onDevices);

    const combinedDeviceChoiceOptions = useMemo(() => {
        return Object.assign(
            { width: webcamVideo?.width ?? 640, height: webcamVideo?.height ?? 480 },
            deviceChoiceOptions ?? defaultDeviceChoiceOptions,
        );
    }, [hasPermission, webcamVideo, deviceChoiceOptions]);

    const { stream, trackSettings } = useDeviceStream(hasPermission, deviceList, combinedDeviceChoiceOptions);
    if (trackSettings) {
        window.alert(JSON.stringify(trackSettings, undefined, 2));
    }
    useStreamToVideoElement(webcamVideo, stream);

    return {
        webcamVideo,
        webcamVideoRef,
        deviceList,
        hasPermission,
        stream,
        trackSettings,
    };
};

const useStreamToVideoElement = (
    videoElement: HTMLVideoElement | undefined,
    stream: MediaStream | undefined,
) => {
    useEffect(() => {
        if (videoElement && stream) {
            videoElement.srcObject = stream;
        }
    }, [stream, videoElement]);
};
