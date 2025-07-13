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

const cancelDelayedExecution = (id: number) => {
    // cancelAnimationFrame(id);
    window.clearTimeout(id);
}

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

    const delayExecution = (callback: () => void) => {
        // return requestAnimationFrame(callback);
        return window.setTimeout(callback, timeoutDelay);
    };

    const [context, setContext] = useState<CanvasRenderingContext2D | null>();
    const [hasListener, setHasListener] = useState<boolean>(false);

    const [delayId, setDelayId] = useState<number>();

    useEffect(() => {
        setContext(null);
    }, [
        zoom,
        webcamVideo?.width,
        webcamVideo?.height,
        canvas?.width,
        canvas?.height,
    ]);

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

                if (delayId) {
                    cancelDelayedExecution(delayId);
                }
                if (context) {
                    setDelayId(delayExecution(streamToCanvas));
                }
            };

            return streamToCanvas;
    },
        [bounds, onDraw, webcamVideo, shouldDraw, context],
    );

    useEffect(() => {
        if (!bounds) {
            return;
        }
        if (!context && canvas) {
            if (webcamVideo) {
                webcamVideo.removeEventListener('play', streamToCanvas);
            }
            setHasListener(false);
            const canvasContext = canvas?.getContext('2d', { willReadFrequently: true });
            if (!canvasContext) {
                return;
            }
            setContext(canvasContext);
            return;
        }

        if (hasPermission && context && webcamVideo) {
            if (!hasListener) {
                webcamVideo.addEventListener('play', streamToCanvas);
                if (shouldPlay) {
                    playWithRetry(webcamVideo).then(onPlay);
                }
                setHasListener(true);
            }
        }
    }, [
        bounds,
        canvas,
        webcamVideo,
        hasListener,
        onPlay,
        shouldPlay,
        streamToCanvas,
        hasPermission,
        context,
    ]);
};
