'use client';

import { useState, useRef, useCallback } from 'react';
import { UploadSimple, X } from '@phosphor-icons/react';
import cn from 'classnames';
import styles from '@/components/manage/editors/ImageUploadZone.module.css';

export interface ImageWithDescription {
  url: string;
  description: string;
}

interface CharacterImageUploadProps {
  images: ImageWithDescription[];
  onChange: (images: ImageWithDescription[]) => void;
  maxImages?: number;
  label?: string;
}

export default function CharacterImageUpload({
  images,
  onChange,
  maxImages = 50,
  label = 'Drop images here or click to upload',
}: CharacterImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = maxImages - images.length;
      const newItems: ImageWithDescription[] = [];
      const count = Math.min(files.length, remaining);

      for (let i = 0; i < count; i++) {
        const url = URL.createObjectURL(files[i]);
        newItems.push({ url, description: '' });
      }

      onChange([...images, ...newItems]);
    },
    [images, maxImages, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const updated = images.map((item, i) =>
      i === index ? { ...item, description } : item
    );
    onChange(updated);
  };

  return (
    <div>
      <div
        className={cn(styles.zone, dragging && styles.zoneDragging)}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <UploadSimple size={28} className={styles.zoneIcon} />
        <span className={styles.zoneTitle}>{label}</span>
        <span className={styles.zoneSub}>
          Up to {maxImages} images (PNG, JPG, WebP). Add a description for each.
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className={styles.imageGrid} style={{ marginTop: 12 }}>
          {images.map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className={styles.imageGridItem} style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className={styles.imageGridImg} />
                <button
                  className={styles.imageGridRemove}
                  onClick={() => handleRemove(i)}
                >
                  <X size={12} />
                </button>
              </div>
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleDescriptionChange(i, e.target.value)}
                style={{
                  padding: '6px 8px',
                  fontSize: 12,
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 4,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
