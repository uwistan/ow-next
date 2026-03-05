'use client';

import cn from 'classnames';
import { Sparkle, Image as ImageIcon, VideoCamera } from '@phosphor-icons/react';
import { useState } from 'react';
import AspectRatioSelector from '@/components/common/AspectRatioSelector';
import Box from '@/components/common/Box';
import { Button } from '@/components/common/Button';
import QuantityControl from '@/components/common/QuantityControl';
import Textarea from '@/components/common/Textarea';
import type { ImageFormat } from '@/lib/config/imageFormats';
import { DEFAULT_FORMAT_IMAGE_CREATION } from '@/lib/config/imageFormats';
import styles from './PromptInput.module.css';

type OutputType = 'image' | 'video';

interface PromptInputProps {
  onGenerate?: (
    prompt: string,
    aspectRatio: string,
    outputType: OutputType,
    quantity: number
  ) => void;
}

export default function PromptInput({ onGenerate }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<ImageFormat>(
    DEFAULT_FORMAT_IMAGE_CREATION
  );
  const [quantity, setQuantity] = useState(1);
  const [outputType, setOutputType] = useState<OutputType>('image');

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate?.(
        prompt,
        selectedFormat.aspectRatio,
        outputType,
        quantity
      );
    }
  };

  return (
    <Box variant="white" className={styles.wrapper}>
      <Textarea
        id="prompt-input"
        value={prompt}
        rows={2}
        onChange={(e) => setPrompt(e.target.value)}
        className={styles.textarea}
        autoResize
        placeholder="Describe the image you want to generate…"
        onEnterPress={handleGenerate}
      />

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <AspectRatioSelector
            value={selectedFormat.id}
            onChange={setSelectedFormat}
            type="create"
            size="sm"
          />

          <QuantityControl
            min={1}
            max={10}
            value={quantity}
            onChange={setQuantity}
            className={styles.quantityControl}
            suffix="Variants"
          />

          {/* Output Type */}
          <div className={styles.pillGroup}>
            <button
              type="button"
              className={cn(
                styles.pill,
                styles.pillIcon,
                outputType === 'image' && styles.pillActive
              )}
              onClick={() => setOutputType('image')}
              title="Image"
            >
              <ImageIcon size={16} />
              <span>Image</span>
            </button>
            <button
              type="button"
              className={cn(
                styles.pill,
                styles.pillIcon,
                outputType === 'video' && styles.pillActive
              )}
              onClick={() => setOutputType('video')}
              title="Video"
            >
              <VideoCamera size={16} />
              <span>Video</span>
            </button>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={!prompt.trim()}
          onClick={handleGenerate}
          icon={<Sparkle size={16} />}
        >
          Create Image
        </Button>
      </div>
    </Box>
  );
}
