'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, DownloadSimple, PencilSimple, FolderSimplePlus, PaperPlaneRight } from '@phosphor-icons/react';
import { useChat } from '@/lib/chat-context';
import { MOCK_FOLDERS } from '@/lib/mock-data';
import styles from './EditCanvas.module.css';

interface EditCanvasProps {
  embedded?: boolean;
}

export default function EditCanvas({ embedded }: EditCanvasProps = {}) {
  const { state, dispatch } = useChat();
  const [modifyAssetId, setModifyAssetId] = useState<string | null>(null);
  const [modifyPrompt, setModifyPrompt] = useState('');
  const [modifyAnchor, setModifyAnchor] = useState<{ top: number; left: number } | null>(null);
  const modifyPopoverRef = useRef<HTMLDivElement>(null);

  /** Convert aspect ratio string like "16:9" to CSS value like "16/9" */
  const getAspectCss = (ratio?: string) => {
    if (!ratio) return '1';
    const [w, h] = ratio.split(':');
    return `${w}/${h}`;
  };

  const handleModify = useCallback(
    (assetId: string, prompt: string) => {
      const original = state.currentSession?.generatedAssets.find((a) => a.id === assetId);
      dispatch({
        type: 'ADD_GENERATED_ASSET',
        payload: {
          id: `asset-mod-${Date.now()}`,
          url: `https://picsum.photos/seed/mod${Date.now()}/600/600`,
          prompt: `Modified: ${prompt}`,
          type: 'image',
          aspectRatio: original?.aspectRatio,
          savedToLibrary: false,
        },
      });
      setModifyAssetId(null);
      setModifyPrompt('');
      setModifyAnchor(null);
    },
    [dispatch, state.currentSession]
  );

  const handleSaveToLibrary = useCallback(
    (assetId: string) => {
      dispatch({
        type: 'SAVE_ASSET_TO_LIBRARY',
        payload: { assetId, folderId: MOCK_FOLDERS[0].id },
      });
    },
    [dispatch]
  );

  const handleDownload = useCallback((asset: { url: string; id: string }) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = `asset-${asset.id}`;
    link.click();
  }, []);

  const openModifyPopover = (asset: { id: string; prompt: string }, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setModifyAssetId(asset.id);
    setModifyPrompt(asset.prompt);
    setModifyAnchor({ top: rect.bottom + 6, left: rect.left });
  };

  useEffect(() => {
    if (!modifyAssetId) return;
    const handleClickOutside = (ev: MouseEvent) => {
      if (
        modifyPopoverRef.current?.contains(ev.target as Node) ||
        (ev.target as HTMLElement).closest?.('[data-modify-trigger]')
      ) {
        return;
      }
      setModifyAssetId(null);
      setModifyPrompt('');
      setModifyAnchor(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modifyAssetId]);

  const submitModify = () => {
    if (modifyAssetId && modifyPrompt.trim()) {
      handleModify(modifyAssetId, modifyPrompt.trim());
    }
  };

  if (!state.currentSession) return null;

  const assets = state.currentSession.generatedAssets;
  const isGenerating = state.isGeneratingImages;
  const skeletonCount = isGenerating ? 4 : 0;

  return (
    <motion.div
      className={embedded ? `${styles.canvas} ${styles.canvasEmbedded}` : styles.canvas}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>Imagine Session</h3>
        <span className={styles.count}>
          {isGenerating
            ? `Generating... ${assets.length}/4`
            : `${assets.length} ${assets.length === 1 ? 'asset' : 'assets'}`}
        </span>
        <button
          className={styles.closeChatButton}
          onClick={() => dispatch({ type: 'EXIT_MODE' })}
          aria-label="Close and return to start"
        >
          <X size={14} />
          Close
        </button>
      </div>

      <div className={styles.dotGrid}>
        {assets.length === 0 && !isGenerating ? (
          <div className={styles.empty}>
            <p>Generated assets will appear here</p>
          </div>
        ) : (
          <div className={styles.assetGrid}>
            {assets.map((asset, i) => (
              <motion.div
                key={asset.id}
                className={styles.assetThumb}
                style={{ aspectRatio: getAspectCss(asset.aspectRatio) }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                  delay: i * 0.05,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.prompt} className={styles.thumbImage} />
                <div className={styles.thumbOverlay}>
                  <div className={styles.actionBar}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(asset);
                      }}
                    >
                      <DownloadSimple size={14} />
                      Download
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveToLibrary(asset.id);
                      }}
                    >
                      <FolderSimplePlus size={14} />
                      Save to Library
                    </button>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      data-modify-trigger
                      onClick={(e) => {
                        e.stopPropagation();
                        openModifyPopover(asset, e);
                      }}
                    >
                      <PencilSimple size={14} />
                      Modify
                    </button>
                  </div>
                </div>
                {asset.savedToLibrary && <div className={styles.savedBadge} />}
              </motion.div>
            ))}
            {isGenerating &&
              Array.from({ length: skeletonCount }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  className={styles.assetThumb}
                  style={{ aspectRatio: getAspectCss(state.imagineOptions.aspectRatio) }}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.skeleton}>
                    <div className={styles.skeletonShimmer} />
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </div>

      {/* Modify popover - appears next to Modify button */}
      {modifyAssetId && modifyAnchor && typeof document !== 'undefined' &&
        createPortal(
          <motion.div
            ref={modifyPopoverRef}
            className={styles.modifyPopover}
            style={{ top: modifyAnchor.top, left: modifyAnchor.left }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className={styles.modifyInputRow}>
              <input
                type="text"
                className={styles.modifyInput}
                value={modifyPrompt}
                onChange={(e) => setModifyPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitModify();
                  if (e.key === 'Escape') {
                    setModifyAssetId(null);
                    setModifyPrompt('');
                    setModifyAnchor(null);
                  }
                }}
                placeholder="Describe changes..."
                autoFocus
              />
              <button
                type="button"
                className={styles.modifySubmitBtn}
                onClick={submitModify}
                disabled={!modifyPrompt.trim()}
                aria-label="Apply"
              >
                <PaperPlaneRight size={16} weight="fill" />
              </button>
            </div>
          </motion.div>,
          document.body
        )}
    </motion.div>
  );
}
