'use client';

import CustomSelect from '@/components/common/Select';
import {
  DEFAULT_FORMAT_IMAGE_CREATION,
  DEFAULT_FORMAT_IMAGE_ILLUSTRATION,
  DEFAULT_FORMAT_IMAGE_MODIFY,
  IMAGE_FORMATS_IMAGE_CREATION,
  IMAGE_FORMATS_IMAGE_ILLUSTRATION,
  IMAGE_FORMATS_IMAGE_MODIFY,
  type ImageFormat,
} from '@/lib/config/imageFormats';

type AspectRatioSelectorProps = {
  value?: string;
  onChange: (format: ImageFormat) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  type?: 'create' | 'modify' | 'illustration';
};

const FORMAT_CONFIG = {
  create: {
    formats: IMAGE_FORMATS_IMAGE_CREATION,
    default: DEFAULT_FORMAT_IMAGE_CREATION,
  },
  modify: {
    formats: IMAGE_FORMATS_IMAGE_MODIFY,
    default: DEFAULT_FORMAT_IMAGE_MODIFY,
  },
  illustration: {
    formats: IMAGE_FORMATS_IMAGE_ILLUSTRATION,
    default: DEFAULT_FORMAT_IMAGE_ILLUSTRATION,
  },
} as const;

export default function AspectRatioSelector({
  value,
  onChange,
  size = 'sm',
  disabled = false,
  type = 'create',
}: AspectRatioSelectorProps) {
  const { formats: imageFormats } = FORMAT_CONFIG[type];

  const handleValueChange = (selectedValue: string) => {
    const format = imageFormats.find((f) => f.id === selectedValue);
    if (format) {
      onChange(format);
    }
  };

  const options = imageFormats.map((format) => ({
    value: format.id,
    label: format.label,
  }));

  return (
    <CustomSelect
      id="aspect-ratio-selector"
      value={value}
      onValueChange={handleValueChange}
      options={options}
      disabled={disabled}
      size={size}
      placeholder="Select aspect ratio"
    />
  );
}
