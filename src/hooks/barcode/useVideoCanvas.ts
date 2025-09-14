import { useEffect, useMemo, useState } from 'react';

type DrawImageBounds = [number, number, number, number, number, number, number, number];

export type UseVideoCanvasOptions = {
    onDraw?: (video?: HTMLVideoElement) => void;
    onPlay?: () => void;
    webcamVideo?: HTMLVideoElement;
    trackSettings?: MediaTrackSettings;
    shouldDraw?: boolean;
    canvas?: HTMLCanvasElement | null;
    hasPermission?: boolean;
    shouldPlay?: boolean;
    timeoutDelay?: number;
    zoom?: number;
};

const playWithRetry = async (videoElement: HTMLVideoElement): Promise<any> => {
    try {
        videoElement.pause();
        return await videoElement.play();
    } catch (error) {
        console.log(error);
        return new Promise(resolve => {
            setTimeout(() => resolve(playWithRetry(videoElement)), 100);
        });
    }
};

export const useVideoCanvas = (options: UseVideoCanvasOptions) => {
    const {
        onDraw,
        onPlay,
        webcamVideo,
        trackSettings,
        shouldDraw = true,
        canvas,
        hasPermission = true,
        shouldPlay,
        timeoutDelay = 17,
        zoom = 1,
    } = options;

    const [context, setContext] = useState<CanvasRenderingContext2D | null>();
    const [hasListener, setHasListener] = useState<boolean>(false);
    const [intervalIds, setIntervalIds] = useState<number[]>([]);

    const addIntervalId = (intervalId: number) =>
        setIntervalIds([...intervalIds, intervalId]);

    useEffect(() => {
        setContext(null);
    }, [
        zoom,
        // webcamVideo?.srcObject,
        webcamVideo?.width,
        webcamVideo?.height,
        canvas?.width,
        canvas?.height,
    ]);

    useEffect(() => {
        if (!context && canvas) {
            setHasListener(false);
            const canvasContext = canvas?.getContext('2d', { willReadFrequently: true });
            if (!canvasContext) {
                return;
            }
            setContext(canvasContext);
            return;
        }
    }, [context, canvas]);

    const bounds: DrawImageBounds | undefined = useMemo(() => {
        if (!(webcamVideo && trackSettings && canvas)) {
            return;
        }

        const effectiveZoom = Math.pow(zoom, 2);

        const trackWidth = trackSettings.width ?? webcamVideo.width;
        const trackHeight = trackSettings.height ?? webcamVideo.height;

        const centerX = trackWidth / 2;
        const centerY = trackHeight / 2;
        const originX = centerX - centerX / effectiveZoom;
        const originY = centerY - centerY / effectiveZoom;
        const sourceWidth = trackWidth / effectiveZoom;
        const sourceHeight = trackHeight / effectiveZoom;

        return [
            originX,
            originY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            canvas.width,
            canvas.height,
        ];
    }, [canvas, webcamVideo, trackSettings, zoom]);

    const streamToCanvas = useMemo(
        () => {
            const streamToCanvas = () => {
                if (!bounds) {
                    return;
                }
                if (!(
                    context && webcamVideo
                )) {
                    return;
                }

                context.drawImage(webcamVideo, ...bounds);
                if (shouldDraw) {
                    onDraw?.(webcamVideo);
                }
            };

            return streamToCanvas;
    },
        [bounds, onDraw, trackSettings, webcamVideo, shouldDraw, context],
    );

    useEffect(() => {
        if (!bounds) {
            return;
        }
        if (hasPermission && context && webcamVideo) {
            if (!hasListener) {
                webcamVideo.addEventListener('play', () => {
                    intervalIds.forEach(window.clearInterval);
                    streamToCanvas();
                    addIntervalId(window.setInterval(streamToCanvas, timeoutDelay));
                }, { once: true });
                if (shouldPlay) {
                    playWithRetry(webcamVideo).then(onPlay);
                }
                setHasListener(true);
            } else {
                intervalIds.forEach(window.clearInterval);
                streamToCanvas();
                addIntervalId(window.setInterval(streamToCanvas, timeoutDelay));
                playWithRetry(webcamVideo).then(onPlay);
            }
        }
    }, [
        bounds,
        canvas,
        webcamVideo,
        onPlay,
        shouldPlay,
        streamToCanvas,
        hasPermission,
        context,
    ]);
};
