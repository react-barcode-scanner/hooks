import { DeviceChoiceOptions, useScanCanvas, useVideoCanvas, useWebcam } from './barcode';
import { BarcodeDetectorOptions } from './types';

export type UseBarcodeScannerOptions = {
    zoom?: number;
    onScan: (barcode: string) => void;
    onDevices?: (deviceList: MediaDeviceInfo[]) => void;
    barcodeDetectorOptions?: BarcodeDetectorOptions;
    deviceChoiceOptions?: DeviceChoiceOptions;
    shouldPlay?: boolean;
};

export const useBarcodeScanner = (options: UseBarcodeScannerOptions) => {
    const {
        zoom = 1,
        barcodeDetectorOptions,
        deviceChoiceOptions,
        onScan,
        onDevices,
        shouldPlay = true,
    } = options;

    const {
        webcamVideo,
        webcamVideoRef,
        hasPermission,
        stream,
        trackSettings,
    } = useWebcam({
        deviceChoiceOptions,
        onDevices,
    });
    const { onDraw, canDetect, canvas, canvasRef, detectedBarcodesRef } = useScanCanvas({
        barcodeDetectorOptions,
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
        trackVideoWidth: trackSettings?.width,
        trackVideoHeight: trackSettings?.height,
        detectedBarcodes: detectedBarcodesRef.current,
        hasPermission,
    };
};
