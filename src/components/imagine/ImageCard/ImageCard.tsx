'use client';

import cn from 'classnames';
import {
  Heart,
  FolderSimplePlus,
  VideoCamera,
  PencilSimple,
} from '@phosphor-icons/react';
import IconButton from '@/components/common/IconButton';
import styles from './ImageCard.module.css';

interface ImageCardProps {
  src: string;
  prompt: string;
  liked?: boolean;
  onLike?: () => void;
  onSaveToLibrary?: () => void;
  onGenerateVideo?: () => void;
  onModify?: () => void;
}

export default function ImageCard({
  src,
  prompt,
  liked = false,
  onLike,
  onSaveToLibrary,
  onGenerateVideo,
  onModify,
}: ImageCardProps) {
  return (
    <div className={styles.card}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={prompt} className={styles.image} loading="lazy" />

      <div className={styles.overlay}>
        <div className={styles.topActions}>
          <IconButton
            size="sm"
            className={cn(styles.actionBtn, liked && styles.liked)}
            onClick={onLike}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={16} weight={liked ? 'fill' : 'regular'} />
          </IconButton>
        </div>

        <div className={styles.bottomActions}>
          <button className={styles.overlayBtn} onClick={onSaveToLibrary} title="Save to Library">
            <FolderSimplePlus size={16} />
            <span>Library</span>
          </button>
          <button className={styles.overlayBtn} onClick={onGenerateVideo} title="Generate Video">
            <VideoCamera size={16} />
            <span>Video</span>
          </button>
          <button className={styles.overlayBtn} onClick={onModify} title="Modify Image">
            <PencilSimple size={16} />
            <span>Modify</span>
          </button>
        </div>

        <p className={styles.prompt}>{prompt}</p>
      </div>
    </div>
  );
}
