# @react-barcode-scanner/hooks

A set of React hooks for using a webcam as a barcode scanner.

Created as part of a project for making a UPC reader for board games, the
scanner is not 100% reliable with modern smartphones. The presence of multiple
cameras and the inability to easily choose the correct camera forces several
compromises.

## Barcode Detection

The built-in `BarcodeDetector` API is used when available. When it is not
available, the `@undecaf/barcode-detector-polyfill` is used instead.

## Usage

Reference the Storybook stories
([demo site](https://react-barcode-scanner.github.io/hooks))
for an example of implementation, as well as the companion package
[`@react-barcode-scanner/components`](https://github.com/react-barcode-scanner/components).

## API

The primary hook `useBarcodeScanner` should have a relatively self-documenting
API, but here are the available options:

- `zoom`: an integer providing the amount of zoom to apply, defaults to `1`
- `onDevices`: a callback function to execute when the list of devices is
  available. This can be useful if you want to allow the user to select a device
- `onScan`: a callback function to execute when the scanner detects a barcode.
  Will contain the logic to interface with your code.
- `shouldPlay`: determines whether or not the video element will automatically
  begin playing after permission to use the camera is granted. When set to false
  you will need to manually start the scanner's video element playing. Defaults
  to `true`.

There are many lower level hooks used by the primary hook which can also
be explored separately.

### Scanning a still image

`useScanImage` reads barcodes from a still image instead of the webcam. Pass
the image as a data URI string or a `Blob` (a `File` from an
`<input type="file">` works as-is):

```tsx
const { barcode, barcodes, isScanning, error } = useScanImage({ image });
```

- `image`: a data URI or `Blob`. The image is scanned whenever this changes.
  Pass `null`/`undefined` to clear the result.
- `onScan`: optional callback invoked with each detected barcode value.
- `barcodeDetectorOptions`: same as `useBarcodeScanner`; defaults to UPC-A and
  EAN-13.

It returns `barcode` (the first value found, or `undefined`), `barcodes` (every
`DetectedBarcode`), `isScanning` and `error`. The non-hook `scanImage(image)`
function is also exported for use outside React.
