import { useEffect, useMemo, useState } from 'react';

export type DeviceChoiceOptions = {
    matchers?: RegExp[];
    deviceId?: {
        exact: string;
    };
    facingMode?: 'user' | 'environment';
    width?: number;
    height?: number;
};

export const useDeviceStream = (
    hasPermission: boolean,
    deviceList: MediaDeviceInfo[],
    deviceChoiceOptions: DeviceChoiceOptions,
) => {
    const [stream, setStream] = useState<MediaStream>();
    const [trackSettings, setTrackSettings] = useState<MediaTrackSettings>();

    const setStreamAndSettings = (stream: MediaStream) => {
        setStream(stream);
        setTrackSettings(stream.getVideoTracks()?.[0].getSettings());
    };

    const constraints = useMemo(
        () => getMediaConstraintsForDeviceChoiceOptions(deviceList, deviceChoiceOptions),
        [deviceList, deviceChoiceOptions],
    );

    useEffect(() => {
        let active = true;

        if (hasPermission && constraints) {
            if (stream) {
                removeStreamTracks(stream);
            }
            getUserMedia(constraints)
                .then((stream: MediaStream) => {
                    if (!active) {
                        removeStreamTracks(stream);
                        return;
                    }
                    setStreamAndSettings(stream)
                })
                .catch(error => {
                    console.log(`requested device not available`, constraints, error);
                    return getUserMedia(
                        { video: { facingMode: 'environment' } }
                    )
                        .then(setStreamAndSettings)
                        .catch(error => {
                            console.log('no environment-facing camera available', error);
                            return getUserMedia({ video: true })
                                .then(setStreamAndSettings);
                        });
                });
        }

        return () => {
            active = false;
        };
    }, [hasPermission, constraints]);

    return { stream, trackSettings };
};

const getMediaConstraintsForDeviceChoiceOptions = (
    deviceList: MediaDeviceInfo[],
    deviceChoiceOptions: DeviceChoiceOptions,
) => {
    const constraints: MediaStreamConstraints = { audio: false, video: true };

    if (deviceList.length === 0) {
        return undefined;
    }

    if (deviceList.length === 1) {
        return constraints;
    }

    let advancedConstraints: MediaTrackConstraintSet[] = [];
    let { deviceId } = deviceChoiceOptions;
    const { matchers, facingMode, width, height } = deviceChoiceOptions;

    constraints.video = { width, height };

    if (deviceId) {
        constraints.video.deviceId = deviceId;
        return constraints;
    }
    if (!deviceId && matchers?.length) {
        for (const matcher of matchers) {
            const matched = deviceList.filter(deviceInfo => {
                return matcher.test(deviceInfo.label);
            });
            if (matched.length === 1) {
                constraints.video.deviceId = matched[0].deviceId;
                break;
            }
            if (matched.length > 1) {
                advancedConstraints = advancedConstraints.concat(
                    matched.map(matchingDevice => {
                        return { deviceId: matchingDevice.deviceId };
                    }),
                );
                break;
            }
        }
    }
    if (!(deviceId || matchers?.length) && facingMode) {
        advancedConstraints.push({ facingMode });
    }

    if (advancedConstraints.length > 0) {
        constraints.video = { width, height, advanced: advancedConstraints };
    }

    return constraints;
};

/* uncomment all the things here if you're having trouble getting media */
// let useMediaAttempts = 0;
// let useMediaSuccesses = 0;

export const getUserMedia = async (constraints: MediaStreamConstraints) => {
    // const attempts = ++useMediaAttempts;
    // console.log(`use media attempts: ${attempts} (${context})`, constraints);
    // const successes = useMediaSuccesses;
    return await navigator.mediaDevices.getUserMedia(constraints);
};

export const removeStreamTracks = (stream: MediaStream): void => {
    stream.getTracks().forEach(track => {
        track.enabled = false;
        track.stop();
        stream.removeTrack(track);
    });
};
