import { useEffect, useRef, useState } from 'react';
import { BarcodeDetector, BarcodeDetectorOptions, BarcodeFormat, DetectedBarcode } from '../types';

declare let window: Window & typeof globalThis & {
    BarcodeDetector: BarcodeDetector;
};

type DetectedBarcodes = Map<string, ImageBitmap>;

let barcodeDetector: BarcodeDetector;
const barcodeDetectorOptions = { formats: [BarcodeFormat.EAN_13, BarcodeFormat.UPC_A] };

const getBarcodeDetector = async (options: BarcodeDetectorOptions) => {
    if (barcodeDetector) {
        return barcodeDetector;
    }
    const hasNative = 'BarcodeDetector' in window;
    if (!hasNative) {
        await import('@undecaf/barcode-detector-polyfill').then((BCD) => {
            const { BarcodeDetectorPolyfill } = BCD;
            window.BarcodeDetector = (
                BarcodeDetectorPolyfill as unknown
            ) as BarcodeDetector;
        });
    }
    return window.BarcodeDetector.getSupportedFormats().then((formats: BarcodeFormat[]) => {
        if (formats.length === 0) {
            return Promise.reject('No barcode detection');
        }
        barcodeDetector = (new window.BarcodeDetector(options) as unknown) as BarcodeDetector;
        return Promise.resolve(barcodeDetector);
    });
};

type UseScanCanvasOptions = {
    hasPermission: boolean;
    onScan?: (code: string) => void;
};

export const useScanCanvas = (options: UseScanCanvasOptions) => {
    const { hasPermission, onScan } = options;

    const canvasRef = useRef<HTMLCanvasElement>();
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();

    useEffect(() => {
        if (!(hasPermission && canvasRef.current)) {
            return;
        }
        setCanvas(canvasRef.current);
    }, [hasPermission]);

    const detectedBarcodesRef = useRef<DetectedBarcodes>(new Map());
    const [canDetect, setCanDetect] = useState<boolean>(true);

    const onDraw = async () => {
        if (!(canvas && canDetect)) {
            return undefined;
        }
        try {
            const barcodeDetector = await getBarcodeDetector(barcodeDetectorOptions);

            if (!canvas) {
                return undefined;
            }

            const bitmap = await createImageBitmap(canvas);
            const detectedBarcodes = detectedBarcodesRef.current;

            try {
                const barcodes = await barcodeDetector?.detect(bitmap);

                if (
                    barcodes.length > 0 && barcodes.filter((code: DetectedBarcode) => !detectedBarcodes.has(code.rawValue)).length > 0
                ) {
                    barcodes.forEach((barcode: DetectedBarcode) => {
                        if (detectedBarcodes.has(barcode.rawValue)) {
                            return;
                        }
                        detectedBarcodes.set(barcode.rawValue, bitmap);
                        onScan?.(barcode.rawValue);
                    });
                }
            } catch (error) {
                console.log('unable to detect', error);
            }
        } catch (error) {
            console.error('setting can detect to false');
            setCanDetect(false);
        }
    };

    return { onDraw, canDetect, canvas, canvasRef, detectedBarcodesRef };
};