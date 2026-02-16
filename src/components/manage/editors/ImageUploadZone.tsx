'use client';

import { useState, useRef, useCallback } from 'react';
import { UploadSimple, X } from '@phosphor-icons/react';
import cn from 'classnames';
import styles from './ImageUploadZone.module.css';

interface ImageUploadZoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  sublabel?: string;
}

export default function ImageUploadZone({
  images,
  onChange,
  maxImages = 15,
  label = 'Drop images here or click to upload',
  sublabel,
}: ImageUploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = maxImages - images.length;
      const newImages: string[] = [];
      const count = Math.min(files.length, remaining);

      for (let i = 0; i < count; i++) {
        // In a real app, we'd upload to a server.
        // For mock purposes, create object URLs.
        const url = URL.createObjectURL(files[i]);
        newImages.push(url);
      }

      onChange([...images, ...newImages]);
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
          {sublabel ?? `Up to ${maxImages} images (PNG, JPG, WebP)`}
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
        <div className={styles.imageGrid}>
          {images.map((url, i) => (
            <div key={i} className={styles.imageGridItem}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className={styles.imageGridImg} />
              <button
                className={styles.imageGridRemove}
                onClick={() => handleRemove(i)}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
