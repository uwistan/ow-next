'use client';

import { useState, useRef, useCallback } from 'react';
import { Check } from '@phosphor-icons/react';
import cn from 'classnames';
import styles from './StyleChip.module.css';

/* ── Types ──────────────────────────────────────────────────────────── */

export interface StyleChipProps {
  name: string;
  image: string;
  description?: string;
  previews?: string[];
  isActive: boolean;
  onClick: () => void;
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function StyleChip({
  name,
  image,
  description,
  previews,
  isActive,
  onClick,
}: StyleChipProps) {
  const [showPreview, setShowPreview] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowPreview(true);
      timeoutRef.current = null;
    }, 200);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowPreview(false);
  }, []);

  const hasPreviewContent = (previews && previews.length > 0) || description;

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={cn(styles.chip, isActive && styles.chipActive)}
        onClick={onClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className={styles.thumbnail} />
        {name}
        {isActive && <Check size={12} weight="bold" />}
      </button>

      {showPreview && hasPreviewContent && (
        <div className={styles.previewCard}>
          {previews && previews.length > 0 && (
            <div className={styles.previewImages}>
              {previews.map((url, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={i}
                  src={url}
                  alt=""
                  className={styles.previewImage}
                />
              ))}
            </div>
          )}
          <div className={styles.previewName}>{name}</div>
          {description && (
            <div className={styles.previewDescription}>{description}</div>
          )}
        </div>
      )}
    </div>
  );
}
