import { useEffect, useRef, useState } from 'react';
import { BarcodeDetectorOptions, DetectedBarcode } from '../types';
import { defaultBarcodeDetectorOptions, getBarcodeDetector } from './detector';

export type ScanImageSource = string | Blob;

export type UseScanImageOptions = {
    image?: ScanImageSource | null;
    onScan?: (code: string) => void;
    barcodeDetectorOptions?: BarcodeDetectorOptions;
};

// decode the data uri directly rather than via fetch() so a restrictive
// connect-src content security policy doesn't block it
const dataUriToBlob = (dataUri: string): Blob => {
    const match = /^data:([^,]*?)(;base64)?,(.*)$/s.exec(dataUri);
    if (!match) {
        throw new Error('image must be a data uri');
    }
    const [, mimeType, isBase64, payload] = match;
    if (!isBase64) {
        return new Blob([decodeURIComponent(payload)], { type: mimeType });
    }
    const binary = atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
};

export const scanImage = async (
    image: ScanImageSource,
    barcodeDetectorOptions: BarcodeDetectorOptions = defaultBarcodeDetectorOptions,
): Promise<DetectedBarcode[]> => {
    const blob = typeof image === 'string' ? dataUriToBlob(image) : image;
    const [barcodeDetector, bitmap] = await Promise.all([
        getBarcodeDetector(barcodeDetectorOptions),
        createImageBitmap(blob),
    ]);
    try {
        return await barcodeDetector.detect(bitmap);
    } finally {
        bitmap.close();
    }
};

export const useScanImage = (options: UseScanImageOptions) => {
    const { image, onScan, barcodeDetectorOptions = defaultBarcodeDetectorOptions } = options;

    const [barcodes, setBarcodes] = useState<DetectedBarcode[]>([]);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const onScanRef = useRef(onScan);
    onScanRef.current = onScan;

    useEffect(() => {
        setBarcodes([]);
        setError(undefined);
        if (!image) {
            setIsScanning(false);
            return;
        }

        let isCurrent = true;
        setIsScanning(true);
        scanImage(image, barcodeDetectorOptions)
            .then(detected => {
                if (!isCurrent) {
                    return;
                }
                setBarcodes(detected);
                detected.forEach(barcode => onScanRef.current?.(barcode.rawValue));
            })
            .catch(scanError => {
                if (isCurrent) {
                    setError(scanError);
                }
            })
            .finally(() => {
                if (isCurrent) {
                    setIsScanning(false);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, [image]);

    return {
        barcode: barcodes[0]?.rawValue,
        barcodes,
        isScanning,
        error,
    };
};
