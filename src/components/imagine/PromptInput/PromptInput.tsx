'use client';

import cn from 'classnames';
import { Sparkle, Image as ImageIcon, VideoCamera } from '@phosphor-icons/react';
import { useState } from 'react';
import { Button } from '@/components/common/Button';
import styles from './PromptInput.module.css';

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3'] as const;
type AspectRatio = (typeof ASPECT_RATIOS)[number];
type OutputType = 'image' | 'video';

interface PromptInputProps {
  onGenerate?: (prompt: string, aspectRatio: AspectRatio, outputType: OutputType) => void;
}

export default function PromptInput({ onGenerate }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [outputType, setOutputType] = useState<OutputType>('image');

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate?.(prompt, aspectRatio, outputType);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <textarea
          className={styles.textarea}
          placeholder="Describe the image you want to create..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          {/* Aspect Ratio */}
          <div className={styles.pillGroup}>
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio}
                className={cn(styles.pill, aspectRatio === ratio && styles.pillActive)}
                onClick={() => setAspectRatio(ratio)}
              >
                {ratio}
              </button>
            ))}
          </div>

          {/* Output Type */}
          <div className={styles.pillGroup}>
            <button
              className={cn(styles.pill, styles.pillIcon, outputType === 'image' && styles.pillActive)}
              onClick={() => setOutputType('image')}
              title="Image"
            >
              <ImageIcon size={16} />
              <span>Image</span>
            </button>
            <button
              className={cn(styles.pill, styles.pillIcon, outputType === 'video' && styles.pillActive)}
              onClick={() => setOutputType('video')}
              title="Video"
            >
              <VideoCamera size={16} />
              <span>Video</span>
            </button>
          </div>
        </div>

        <Button
          size="sm"
          disabled={!prompt.trim()}
          onClick={handleGenerate}
          icon={<Sparkle size={16} weight="fill" />}
        >
          Generate
        </Button>
      </div>
    </div>
  );
}
