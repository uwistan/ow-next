'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  SquaresFour,
  Heart,
  MagnifyingGlass,
  DotsThree,
  VideoCamera,
  Rows,
  DownloadSimple,
  ArrowSquareOut,
  Trash,
  ShareNetwork,
} from '@phosphor-icons/react';
import cn from 'classnames';
import { MOCK_BRAND_STYLES, MOCK_LIBRARY_ASSETS } from '@/lib/mock-data';
import ContextMenu, { type MenuItem } from '@/components/common/ContextMenu/ContextMenu';
import AssetLightbox from '@/components/chat/AssetLightbox/AssetLightbox';
import styles from './LibraryView.module.css';

// ── Types ───────────────────────────────────────────────────────────────

type StyleFilter = 'all' | string; // string = style id
type GridDensity = 'small' | 'large';

// ── Component ───────────────────────────────────────────────────────────

export default function LibraryView() {
  const [styleFilter, setStyleFilter] = useState<StyleFilter>('all');
  const [search, setSearch] = useState('');
  const [gridDensity, setGridDensity] = useState<GridDensity>('small');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    assetId: string;
  } | null>(null);

  // Filtered assets, sorted by most recent first
  const filteredAssets = useMemo(() => {
    let result = [...MOCK_LIBRARY_ASSETS];

    // Style filter
    if (styleFilter !== 'all') {
      result = result.filter((a) => a.styleId === styleFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q));
    }

    // Sort by createdAt descending (last saved at top)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [styleFilter, search]);

  // Asset count per style
  const styleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const asset of MOCK_LIBRARY_ASSETS) {
      if (asset.styleId) {
        counts[asset.styleId] = (counts[asset.styleId] ?? 0) + 1;
      }
    }
    return counts;
  }, []);

  const handleContextMenu = (e: React.MouseEvent, assetId: string) => {
    e.preventDefault();
    setContextMenu({ position: { x: e.clientX, y: e.clientY }, assetId });
  };

  const handleDotsClick = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({ position: { x: rect.right, y: rect.bottom + 4 }, assetId });
  };

  const getContextItems = (assetId: string): MenuItem[] => [
    {
      id: 'open',
      label: 'Open',
      icon: <ArrowSquareOut size={16} />,
      onAction: () => {
        const idx = filteredAssets.findIndex((a) => a.id === assetId);
        if (idx >= 0) setLightboxIndex(idx);
      },
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
      onAction: () => {},
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash size={16} />,
      danger: true,
      dividerBefore: true,
      onAction: () => {},
    },
  ];

  // Lightbox asset mapping
  const lightboxAssets = filteredAssets.map((a) => ({
    id: a.id,
    url: a.url,
    prompt: a.name,
    type: a.type,
    savedToLibrary: true,
  }));

  return (
    <div className={styles.layout}>
      {/* ── Sidebar (style-based nav) ───────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <button
            className={cn(styles.sidebarItem, styleFilter === 'all' && styles.sidebarItemActive)}
            onClick={() => setStyleFilter('all')}
          >
            <SquaresFour size={16} weight="fill" />
            <span className={styles.sidebarLabel}>All</span>
            <span className={styles.sidebarCount}>{MOCK_LIBRARY_ASSETS.length}</span>
          </button>
          {MOCK_BRAND_STYLES.map((style) => (
            <button
              key={style.id}
              className={cn(
                styles.sidebarItem,
                styleFilter === style.id && styles.sidebarItemActive
              )}
              onClick={() => setStyleFilter(style.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={style.image} alt="" className={styles.sidebarThumb} />
              <span className={styles.sidebarLabel}>{style.name}</span>
              <span className={styles.sidebarCount}>{styleCounts[style.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.mainHeader}>
          <div className={styles.searchWrap}>
            <MagnifyingGlass size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Grid density */}
          <div className={styles.densityToggle}>
            <button
              className={cn(styles.densityBtn, gridDensity === 'small' && styles.densityBtnActive)}
              onClick={() => setGridDensity('small')}
              title="Small grid"
            >
              <SquaresFour size={16} />
            </button>
            <button
              className={cn(styles.densityBtn, gridDensity === 'large' && styles.densityBtnActive)}
              onClick={() => setGridDensity('large')}
              title="Large grid"
            >
              <Rows size={16} />
            </button>
          </div>
        </div>

        {/* Asset Grid (most recent at top) */}
        <div className={styles.gridArea}>
          {filteredAssets.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No assets found</p>
            </div>
          ) : (
            <div
              className={cn(
                styles.masonry,
                gridDensity === 'large' && styles.masonryLarge
              )}
            >
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={styles.masonryItem}
                  onClick={() => {
                    const idx = filteredAssets.findIndex((a) => a.id === asset.id);
                    if (idx >= 0) setLightboxIndex(idx);
                  }}
                  onContextMenu={(e) => handleContextMenu(e, asset.id)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className={styles.masonryImage}
                    loading="lazy"
                  />
                  <div className={styles.masonryOverlay}>
                    <div className={styles.masonryTopRow}>
                      {asset.type === 'video' && (
                        <span className={styles.typeBadge}>
                          <VideoCamera size={11} weight="fill" />
                          Video
                        </span>
                      )}
                      <button
                        className={cn(
                          styles.heartBtn,
                          asset.liked && styles.heartBtnLiked
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Heart
                          size={14}
                          weight={asset.liked ? 'fill' : 'regular'}
                        />
                      </button>
                    </div>
                    <button
                      className={styles.masonryDotsBtn}
                      onClick={(e) => handleDotsClick(e, asset.id)}
                    >
                      <DotsThree size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            items={getContextItems(contextMenu.assetId)}
            position={contextMenu.position}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && lightboxAssets.length > 0 && (
          <AssetLightbox
            assets={lightboxAssets}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onModify={() => {}}
            onSaveToLibrary={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
