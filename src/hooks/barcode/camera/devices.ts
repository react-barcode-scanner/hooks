import { useEffect, useState } from 'react';
import { getUserMediaConstraints } from './constants';
import { removeStreamTracks } from './stream';

export const useGetDeviceList = (
    onDevices?: (deviceList: MediaDeviceInfo[]) => void,
): { deviceList: MediaDeviceInfo[], hasPermission: boolean } => {
    const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
    const [hasPermission, setHasPermission] = useState<boolean>(false);

    useEffect(() => {
        let active = true;

        listDevices().then((deviceList: MediaDeviceInfo[]) => {
            if (!active) {
                return;
            }
            setHasPermission(!!deviceList?.length);
            setDeviceList(deviceList);
            onDevices?.(deviceList);
        });

        return () => {
            active = false;
        };
    }, []);

    return { deviceList, hasPermission };
};

const listDevices = async (): Promise<MediaDeviceInfo[]> => {
    try {
        const devices = await navigator.mediaDevices?.getUserMedia(getUserMediaConstraints)
            .then(async (stream) => {
                const devices = await navigator.mediaDevices?.enumerateDevices?.();
                removeStreamTracks(stream);
                return devices;
            });
        return devices?.filter(device => device.kind === 'videoinput') ?? [];
    } catch (e) {
        if ((e as Object).toString().includes('videoinput failed')) {
            window.alert(`You may have more than one application or window using your camera.`);
        }
        return [];
    }
};
