'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  DotsThree,
  DownloadSimple,
  FolderSimplePlus,
  ArrowSquareOut,
  Trash,
  ShareNetwork,
  Plus,
} from '@phosphor-icons/react';
import { useChat, GeneratedAsset } from '@/lib/chat-context';
import { MOCK_FOLDERS } from '@/lib/mock-data';
import ContextMenu, { type MenuItem } from '@/components/common/ContextMenu/ContextMenu';
import AssetLightbox from '@/components/chat/AssetLightbox/AssetLightbox';
import styles from './EditCanvas.module.css';

export default function EditCanvas() {
  const { state, dispatch } = useChat();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    assetId: string;
  } | null>(null);

  const handleModify = useCallback(
    (assetId: string, prompt: string) => {
      dispatch({
        type: 'ADD_GENERATED_ASSET',
        payload: {
          id: `asset-mod-${Date.now()}`,
          url: `https://picsum.photos/seed/mod${Date.now()}/600/600`,
          prompt: `Modified: ${prompt}`,
          type: 'image',
          savedToLibrary: false,
        },
      });
    },
    [dispatch]
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

  const handleDelete = useCallback(
    (assetId: string) => {
      dispatch({ type: 'DELETE_ASSET', payload: assetId });
      setLightboxIndex(null);
    },
    [dispatch]
  );

  if (!state.currentSession) return null;

  const assets = state.currentSession.generatedAssets;

  const handleContextMenu = (e: React.MouseEvent, assetId: string) => {
    e.preventDefault();
    setContextMenu({ position: { x: e.clientX, y: e.clientY }, assetId });
  };

  const handleDotsClick = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({ position: { x: rect.right, y: rect.bottom + 4 }, assetId });
  };

  const getMenuItems = (asset: GeneratedAsset): MenuItem[] => {
    const folderSubmenu: MenuItem[] = [
      ...MOCK_FOLDERS.map((f) => ({
        id: f.id,
        label: f.name,
        checked: (asset.folderIds ?? []).includes(f.id),
        onAction: () => {
          if ((asset.folderIds ?? []).includes(f.id)) {
            dispatch({
              type: 'REMOVE_ASSET_FROM_FOLDER',
              payload: { assetId: asset.id, folderId: f.id },
            });
          } else {
            dispatch({
              type: 'SAVE_ASSET_TO_LIBRARY',
              payload: { assetId: asset.id, folderId: f.id },
            });
          }
        },
      })),
      {
        id: 'new-folder',
        label: 'Create new folder',
        icon: <Plus size={14} />,
        dividerBefore: true,
        onAction: () => {},
      },
    ];

    return [
      {
        id: 'open',
        label: 'Open',
        icon: <ArrowSquareOut size={16} />,
        onAction: () => {
          const idx = assets.findIndex((a) => a.id === asset.id);
          if (idx >= 0) setLightboxIndex(idx);
        },
      },
      {
        id: 'add-to-folder',
        label: 'Add to folder',
        icon: <FolderSimplePlus size={16} />,
        submenu: folderSubmenu,
      },
      {
        id: 'share',
        label: 'Share',
        icon: <ShareNetwork size={16} />,
        onAction: () => {},
      },
      {
        id: 'download',
        label: 'Download',
        icon: <DownloadSimple size={16} />,
        onAction: () => {
          const link = document.createElement('a');
          link.href = asset.url;
          link.download = `asset-${asset.id}`;
          link.click();
        },
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash size={16} />,
        danger: true,
        dividerBefore: true,
        onAction: () => dispatch({ type: 'DELETE_ASSET', payload: asset.id }),
      },
    ];
  };

  return (
    <motion.div
      className={styles.canvas}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>Canvas</h3>
        <span className={styles.count}>
          {assets.length} {assets.length === 1 ? 'asset' : 'assets'}
        </span>
        <button
          className={styles.closeButton}
          onClick={() => dispatch({ type: 'EXIT_MODE' })}
        >
          <X size={16} />
        </button>
      </div>

      <div className={styles.dotGrid}>
        {assets.length === 0 ? (
          <div className={styles.empty}>
            <p>Generated assets will appear here</p>
          </div>
        ) : (
          <div className={styles.assetGrid}>
            {assets.map((asset, i) => (
              <motion.div
                key={asset.id}
                className={styles.assetThumb}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                  delay: i * 0.05,
                }}
                onClick={() => setLightboxIndex(i)}
                onContextMenu={(e) => handleContextMenu(e, asset.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.prompt} className={styles.thumbImage} />
                <div className={styles.thumbOverlay}>
                  <button
                    className={styles.dotsButton}
                    onClick={(e) => handleDotsClick(e, asset.id)}
                  >
                    <DotsThree size={18} weight="bold" />
                  </button>
                </div>
                {asset.savedToLibrary && <div className={styles.savedBadge} />}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            items={getMenuItems(
              assets.find((a) => a.id === contextMenu.assetId)!
            )}
            position={contextMenu.position}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && assets.length > 0 && (
          <AssetLightbox
            assets={assets}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onModify={handleModify}
            onSaveToLibrary={handleSaveToLibrary}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
