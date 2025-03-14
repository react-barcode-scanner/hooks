import { useEffect, useMemo, useRef, useState } from 'react';
import {
    DeviceChoiceOptions,
    useDeviceStream,
    useGetDeviceList,
    useHasCameraPermission
} from './camera';

const defaultDeviceChoiceOptions: DeviceChoiceOptions = {
    matcher: /back/i,
    facingMode: 'environment',
};

export type UseWebcamOptions = {
    deviceChoiceOptions?: DeviceChoiceOptions;
    onDevices?: (deviceList: MediaDeviceInfo[]) => void
    shouldPlay?: boolean;
}

export const useWebcam = (options: UseWebcamOptions = {}) => {
    const { deviceChoiceOptions, onDevices, shouldPlay } = options;

    const { hasPermission } = useHasCameraPermission();

    const webcamVideoRef = useRef<HTMLVideoElement>();
    const [webcamVideo, setWebcamVideo] = useState<HTMLVideoElement>();

    useEffect(() => {
        if (!(hasPermission && webcamVideoRef.current)) {
            return;
        }

        setWebcamVideo(webcamVideoRef.current);
    }, [hasPermission]);


    const { deviceList } = useGetDeviceList(hasPermission, onDevices);

    const combinedDeviceChoiceOptions = useMemo(() => {
        return Object.assign(
            { width: webcamVideo?.width ?? 640, height: webcamVideo?.height ?? 480 },
            deviceChoiceOptions ?? defaultDeviceChoiceOptions,
            );
    }, [webcamVideo, deviceChoiceOptions]);

    const { stream } = useDeviceStream(hasPermission, deviceList, combinedDeviceChoiceOptions);
    const { isStreaming } = useStreamToVideoElement(webcamVideo, stream, shouldPlay);

    return {
        webcamVideo,
        webcamVideoRef,
        deviceList,
        hasPermission,
        stream,
        isStreaming,
    };
};

const useStreamToVideoElement = (
    videoElement: HTMLVideoElement | undefined,
    stream: MediaStream | undefined,
    shouldPlay?: boolean,
) => {
    const [isStreaming, setIsStreaming] = useState<boolean>(false);

    useEffect(() => {
        let active = true;

        if (!isStreaming && videoElement && stream) {
            videoElement.srcObject = stream;
            if (shouldPlay) {
                videoElement.play()
                    .then(() => {
                        if (!active) {
                            return;
                        }
                        setIsStreaming(true);
                    })
                    .catch(() => {
                        if (!active) {
                            return;
                        }
                        setIsStreaming(false);
                    });
            }
        }

        return () => { active = false; };
    }, [stream, videoElement, isStreaming, shouldPlay]);

    return { isStreaming };
};
