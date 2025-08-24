import { useEffect, useState } from 'react';

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
        const devices = await navigator.mediaDevices?.getUserMedia(
                {
                    video: { facingMode: 'environment' }
                }
            )
            .then(async () => {
                return await navigator.mediaDevices?.enumerateDevices?.();
            });
        return devices?.filter(device => device.kind === 'videoinput') ?? [];
    } catch (e) {
        if ((e as Object).toString().includes('videoinput failed')) {
            window.alert(`You may have more than one application or window using your camera.`);
        } else {
            console.log(e);
        }
        return [];
    }
};
