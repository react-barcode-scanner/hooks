import { DeviceChoiceOptions, useScanCanvas, useVideoCanvas, useWebcam } from './barcode';

export type UseBarcodeScannerOptions = {
    zoom?: number;
    onScan: (barcode: string) => void;
    onDevices?: (deviceList: MediaDeviceInfo[]) => void;
    deviceChoiceOptions?: DeviceChoiceOptions;
    shouldPlay?: boolean;
};

export const useBarcodeScanner = (options: UseBarcodeScannerOptions) => {
    const { zoom = 1, deviceChoiceOptions, onScan, onDevices, shouldPlay = true } = options;
    const {
        webcamVideo,
        webcamVideoRef,
        hasPermission,
        isStreaming,
        stream,
        trackSettings,
    } = useWebcam({
        deviceChoiceOptions,
        onDevices,
    });
    const { onDraw, canDetect, canvas, canvasRef, detectedBarcodesRef } = useScanCanvas({
        hasPermission,
        onScan,
    });

    useVideoCanvas({
        onDraw,
        webcamVideo,
        trackSettings,
        shouldDraw: canDetect,
        canvas,
        hasPermission,
        shouldPlay,
        zoom,
    });

    return {
        webcamVideoRef,
        canvasRef,
        stream,
        detectedBarcodes: detectedBarcodesRef.current,
        hasPermission,
        isStreaming,
    };
};
