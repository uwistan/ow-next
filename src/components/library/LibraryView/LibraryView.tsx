'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  FolderSimple,
  Heart,
  MagnifyingGlass,
  Plus,
  DotsThree,
  VideoCamera,
  CaretDown,
  SquaresFour,
  Rows,
  DownloadSimple,
  FolderSimplePlus,
  ArrowSquareOut,
  Trash,
  ShareNetwork,
} from '@phosphor-icons/react';
import cn from 'classnames';
import { MOCK_FOLDERS, MOCK_LIBRARY_ASSETS } from '@/lib/mock-data';
import ContextMenu, { type MenuItem } from '@/components/common/ContextMenu/ContextMenu';
import AssetLightbox from '@/components/chat/AssetLightbox/AssetLightbox';
import styles from './LibraryView.module.css';

// ── Types ───────────────────────────────────────────────────────────────

type TypeFilter = 'all' | 'image' | 'video';
type ModeFilter = 'all' | 'imagine' | 'product' | 'character' | 'create';
type FolderFilter = 'all' | 'liked' | string; // string = folder id
type GridDensity = 'small' | 'large';

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
];

const MODE_OPTIONS: { value: ModeFilter; label: string }[] = [
  { value: 'all', label: 'All Modes' },
  { value: 'imagine', label: 'Imagine' },
  { value: 'product', label: 'Product' },
  { value: 'character', label: 'Character' },
  { value: 'create', label: 'Create' },
];

// ── Helpers ─────────────────────────────────────────────────────────────

function groupByDate(
  assets: typeof MOCK_LIBRARY_ASSETS
): { date: string; assets: typeof MOCK_LIBRARY_ASSETS }[] {
  const groups = new Map<string, typeof MOCK_LIBRARY_ASSETS>();
  for (const asset of assets) {
    const d = new Date(asset.createdAt);
    const key = d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(asset);
  }
  return Array.from(groups.entries()).map(([date, assets]) => ({ date, assets }));
}

// ── Component ───────────────────────────────────────────────────────────

export default function LibraryView() {
  const [folderFilter, setFolderFilter] = useState<FolderFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [search, setSearch] = useState('');
  const [gridDensity, setGridDensity] = useState<GridDensity>('small');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    assetId: string;
  } | null>(null);
  const [newFolderInput, setNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);

  // Filtered assets
  const filteredAssets = useMemo(() => {
    let result = [...MOCK_LIBRARY_ASSETS];

    // Folder filter
    if (folderFilter === 'liked') {
      result = result.filter((a) => a.liked);
    } else if (folderFilter !== 'all') {
      result = result.filter((a) => a.folderId === folderFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((a) => a.type === typeFilter);
    }

    // Mode filter
    if (modeFilter !== 'all') {
      result = result.filter((a) => a.creativeMode === modeFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q));
    }

    return result;
  }, [folderFilter, typeFilter, modeFilter, search]);

  const dateGroups = useMemo(() => groupByDate(filteredAssets), [filteredAssets]);
  const likedCount = MOCK_LIBRARY_ASSETS.filter((a) => a.liked).length;

  const handleContextMenu = (e: React.MouseEvent, assetId: string) => {
    e.preventDefault();
    setContextMenu({ position: { x: e.clientX, y: e.clientY }, assetId });
  };

  const handleDotsClick = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({ position: { x: rect.right, y: rect.bottom + 4 }, assetId });
  };

  const getContextItems = (assetId: string): MenuItem[] => {
    const folderSubmenu: MenuItem[] = [
      ...MOCK_FOLDERS.map((f) => ({
        id: f.id,
        label: f.name,
        checked: MOCK_LIBRARY_ASSETS.find((a) => a.id === assetId)?.folderId === f.id,
        onAction: () => {},
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
          const idx = filteredAssets.findIndex((a) => a.id === assetId);
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
  };

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
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <button
            className={cn(styles.sidebarItem, folderFilter === 'all' && styles.sidebarItemActive)}
            onClick={() => setFolderFilter('all')}
          >
            <SquaresFour size={16} weight="fill" />
            <span className={styles.sidebarLabel}>All</span>
            <span className={styles.sidebarCount}>{MOCK_LIBRARY_ASSETS.length}</span>
          </button>
          <button
            className={cn(styles.sidebarItem, folderFilter === 'liked' && styles.sidebarItemActive)}
            onClick={() => setFolderFilter('liked')}
          >
            <Heart size={16} weight="fill" />
            <span className={styles.sidebarLabel}>Liked</span>
            <span className={styles.sidebarCount}>{likedCount}</span>
          </button>
        </div>

        <div className={styles.sidebarDivider} />

        <div className={styles.sidebarSection}>
          <span className={styles.sidebarHeading}>Folders</span>
          {MOCK_FOLDERS.map((folder) => (
            <button
              key={folder.id}
              className={cn(
                styles.sidebarItem,
                folderFilter === folder.id && styles.sidebarItemActive
              )}
              onClick={() => setFolderFilter(folder.id)}
            >
              <FolderSimple size={16} weight="fill" style={{ color: folder.color }} />
              <span className={styles.sidebarLabel}>{folder.name}</span>
              <span className={styles.sidebarCount}>{folder.count}</span>
            </button>
          ))}

          {newFolderInput ? (
            <form
              className={styles.newFolderForm}
              onSubmit={(e) => {
                e.preventDefault();
                // In a real app, dispatch to create folder
                setNewFolderInput(false);
                setNewFolderName('');
              }}
            >
              <input
                className={styles.newFolderInput}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                autoFocus
                onBlur={() => {
                  setNewFolderInput(false);
                  setNewFolderName('');
                }}
              />
            </form>
          ) : (
            <button
              className={styles.newFolderBtn}
              onClick={() => setNewFolderInput(true)}
            >
              <Plus size={14} />
              <span>New folder</span>
            </button>
          )}
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

          {/* Type filter */}
          <div className={styles.filterWrap}>
            <button
              className={styles.filterBtn}
              onClick={() => {
                setTypeDropdownOpen(!typeDropdownOpen);
                setModeDropdownOpen(false);
              }}
            >
              {TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label}
              <CaretDown size={12} />
            </button>
            {typeDropdownOpen && (
              <div className={styles.filterDropdown}>
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={cn(
                      styles.filterOption,
                      typeFilter === opt.value && styles.filterOptionActive
                    )}
                    onClick={() => {
                      setTypeFilter(opt.value);
                      setTypeDropdownOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode filter */}
          <div className={styles.filterWrap}>
            <button
              className={styles.filterBtn}
              onClick={() => {
                setModeDropdownOpen(!modeDropdownOpen);
                setTypeDropdownOpen(false);
              }}
            >
              {MODE_OPTIONS.find((o) => o.value === modeFilter)?.label}
              <CaretDown size={12} />
            </button>
            {modeDropdownOpen && (
              <div className={styles.filterDropdown}>
                {MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={cn(
                      styles.filterOption,
                      modeFilter === opt.value && styles.filterOptionActive
                    )}
                    onClick={() => {
                      setModeFilter(opt.value);
                      setModeDropdownOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
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

        {/* Asset Grid with Date Groups */}
        <div className={styles.gridArea}>
          {filteredAssets.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No assets found</p>
            </div>
          ) : (
            dateGroups.map((group) => (
              <div key={group.date} className={styles.dateGroup}>
                <div className={styles.dateHeader}>{group.date}</div>
                <div
                  className={cn(
                    styles.masonry,
                    gridDensity === 'large' && styles.masonryLarge
                  )}
                >
                  {group.assets.map((asset) => (
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
              </div>
            ))
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
