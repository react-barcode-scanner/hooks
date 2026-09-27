import { useCallback, useEffect, useRef, useState } from 'react';
import { BarcodeDetectorOptions, DetectedBarcode } from '../types';
import { defaultBarcodeDetectorOptions, getBarcodeDetector } from './detector';

type DetectedBarcodes = string[];

type UseScanCanvasOptions = {
    hasPermission: boolean;
    onScan?: (code: string) => void;
    barcodeDetectorOptions?: BarcodeDetectorOptions;
};

export const useScanCanvas = (options: UseScanCanvasOptions) => {
    const { hasPermission, onScan, barcodeDetectorOptions = defaultBarcodeDetectorOptions } = options;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();

    useEffect(() => {
        if (!(hasPermission && canvasRef.current)) {
            return;
        }
        setCanvas(canvasRef.current);
    }, [hasPermission]);

    const detectedBarcodesRef = useRef<DetectedBarcodes>([]);
    const [canDetect, setCanDetect] = useState<boolean>(true);

    const onDraw = useCallback(async (video?: HTMLVideoElement) => {
        if (!(canvas && canDetect)) {
            return undefined;
        }

        try {
            const barcodeDetector = await getBarcodeDetector(barcodeDetectorOptions);

            if (!canvas) {
                return undefined;
            }

            const detectionSource = video ?? await createImageBitmap(canvas);
            const detectedBarcodes = detectedBarcodesRef.current;

            try {
                const barcodes = await barcodeDetector?.detect(detectionSource);

                if (
                    barcodes.length > 0 &&
                    barcodes.filter((code: DetectedBarcode) => !detectedBarcodes.includes(code.rawValue))
                        .length > 0
                ) {
                    barcodes.forEach((barcode: DetectedBarcode) => {
                        if (detectedBarcodes.includes(barcode.rawValue)) {
                            return;
                        }
                        detectedBarcodes.push(barcode.rawValue);
                        onScan?.(barcode.rawValue);
                    });
                }
            } catch (error) {
                console.log('unable to detect', error);
            } finally {
                if (detectionSource instanceof ImageBitmap) {
                    detectionSource.close();
                }
            }
        } catch (error) {
            console.error('setting can detect to false', error);
            setCanDetect(false);
        }
    }, [canvas]);

    return { onDraw, canDetect, canvas, canvasRef, detectedBarcodesRef };
};
