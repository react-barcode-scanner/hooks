import { BarcodeDetector, BarcodeDetectorOptions, BarcodeFormat } from '../types';

declare let window: Window &
    typeof globalThis & {
        BarcodeDetector: BarcodeDetector;
    };

let barcodeDetector: BarcodeDetector;
export const defaultBarcodeDetectorOptions = {
    useNative: false,
    formats: [BarcodeFormat.EAN_13, BarcodeFormat.UPC_A],
};

export const getBarcodeDetector = async (options: BarcodeDetectorOptions) => {
    if (barcodeDetector) {
        return barcodeDetector;
    }
    const useNative = options.useNative && 'BarcodeDetector' in window;
    if (!useNative) {
        await import('@undecaf/barcode-detector-polyfill').then(BCD => {
            const { BarcodeDetectorPolyfill } = BCD;
            window.BarcodeDetector = BarcodeDetectorPolyfill as unknown as BarcodeDetector;
        });
    }
    return window.BarcodeDetector.getSupportedFormats().then((formats: BarcodeFormat[]) => {
        if (formats.length === 0) {
            return Promise.reject('No barcode detection');
        }
        barcodeDetector = new window.BarcodeDetector(options) as unknown as BarcodeDetector;
        return Promise.resolve(barcodeDetector);
    });
};
