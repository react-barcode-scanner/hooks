import { useEffect, useMemo, useState } from 'react';

type DrawImageBounds = [number, number, number, number, number, number, number, number];

export type UseVideoCanvasOptions = {
    onDraw?: () => void;
    onPlay?: () => void;
    webcamVideo?: HTMLVideoElement;
    shouldDraw?: boolean;
    canvas?: HTMLCanvasElement | null;
    hasPermission?: boolean;
    shouldPlay?: boolean;
    timeoutDelay?: number;
    zoom?: number;
};

const playWithRetry = async (videoElement: HTMLVideoElement): Promise<any> => {
    try {
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
        shouldDraw = true,
        canvas,
        hasPermission = true,
        shouldPlay,
        timeoutDelay = 17,
        zoom = 1,
    } = options;

    const [context, setContext] = useState<CanvasRenderingContext2D | null>();
    const [hasListener, setHasListener] = useState<boolean>(false);

    const bounds: DrawImageBounds = useMemo(() => {
        if (!(webcamVideo && canvas)) {
            return [0, 0, 0, 0, 0, 0, 0, 0];
        }
        
        const effectiveZoom = Math.pow(zoom, 2);

        const centerX = webcamVideo.width / 2;
        const centerY = webcamVideo.height / 2;
        const originX = centerX - centerX / effectiveZoom;
        const originY = centerY - centerY / effectiveZoom;

        return [
            originX,
            originY,
            webcamVideo.width / effectiveZoom,
            webcamVideo.height / effectiveZoom,
            0,
            0,
            canvas.width,
            canvas.height,
        ];
    }, [canvas, webcamVideo, zoom]);

    const streamToCanvas = useMemo(
        () => () => {
            if (!(context && webcamVideo)) {
                setTimeout(streamToCanvas, 100);
                return;
            }

            context.drawImage(webcamVideo, ...bounds);
            if (shouldDraw) {
                onDraw?.();
            }

            window.setTimeout(streamToCanvas, timeoutDelay);
        },
        [bounds, onDraw, timeoutDelay, webcamVideo, shouldDraw, context],
    );

    useEffect(() => {
        if (!context && canvas) {
            const canvasContext = canvas?.getContext('2d');
            if (!canvasContext) {
                return;
            }
            canvasContext.filter = 'grayscale(1) contrast(1)';
            setContext(canvasContext);
            return;
        }

        if (hasPermission && context && webcamVideo) {
            if (!hasListener) {
                webcamVideo.addEventListener('play', () => {
                    streamToCanvas();
                });
                if (shouldPlay) {
                    playWithRetry(webcamVideo).then(onPlay);
                }
                setHasListener(true);
            }
        }
    }, [
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
