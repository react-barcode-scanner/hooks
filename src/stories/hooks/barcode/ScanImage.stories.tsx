import React, { ChangeEvent, useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useScanImage } from '../../../hooks';

type ScanImageProps = {
    asDataUri?: boolean;
};

const readAsDataUri = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

const ScanImageStories = (props: ScanImageProps) => {
    const { asDataUri = false } = props;

    const [image, setImage] = useState<string | Blob | null>(null);
    const [preview, setPreview] = useState<string>();

    const { barcode, barcodes, isScanning, error } = useScanImage({ image });

    const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        const dataUri = await readAsDataUri(file);
        setPreview(dataUri);
        setImage(asDataUri ? dataUri : file);
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={onChange} />
            {preview ? (
                <div>
                    <img src={preview} alt="" style={{ maxWidth: 480, marginTop: 16 }} />
                </div>
            ) : null}
            <p>
                {isScanning
                    ? 'Scanning…'
                    : error
                      ? `Error: ${String(error)}`
                      : image
                        ? barcode
                            ? `UPC: ${barcode}`
                            : 'No barcode found'
                        : 'Choose an image'}
            </p>
            {barcodes.length > 1 ? (
                <ul>
                    {barcodes.map(({ rawValue, format }) => (
                        <li key={`${format}-${rawValue}`}>
                            {rawValue} ({format})
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
};

const meta: Meta<typeof ScanImageStories> = {
    component: ScanImageStories,
    title: 'Scanner/Scan Image',
};

export default meta;
type Story = StoryObj<typeof ScanImageStories>;

export const FromBlob: Story = {
    args: { asDataUri: false },
};

export const FromDataUri: Story = {
    args: { asDataUri: true },
};
