'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Heart,
  MagnifyingGlass,
  DotsThree,
  VideoCamera,
  DownloadSimple,
  Trash,
  PencilSimple,
  PaperPlaneRight,
  CaretDown,
  Check,
} from '@phosphor-icons/react';
import cn from 'classnames';
import {
  MOCK_BRAND_STYLES,
  MOCK_LIBRARY_ASSETS,
  MOCK_PRODUCTS,
  MOCK_PRODUCT_STYLES,
  MOCK_CHARACTERS,
  MOCK_CHARACTER_LOCATIONS,
} from '@/lib/mock-data';
import ContextMenu, { type MenuItem } from '@/components/common/ContextMenu/ContextMenu';
import AssetLightbox from '@/components/chat/AssetLightbox/AssetLightbox';
import { useChat } from '@/lib/chat-context';
import styles from './LibraryView.module.css';

// ── Types ───────────────────────────────────────────────────────────────

type StyleFilter = string; // style id, or '' for no filter

// ── Component ───────────────────────────────────────────────────────────

export default function LibraryView() {
  const { dispatch } = useChat();
  const [styleFilter, setStyleFilter] = useState<StyleFilter>(
    () => MOCK_BRAND_STYLES[0]?.id ?? ''
  );
  const [productFilter, setProductFilter] = useState('');
  const [productStyleFilter, setProductStyleFilter] = useState('');
  const [characterFilter, setCharacterFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [filterDropdownRect, setFilterDropdownRect] = useState<DOMRect | null>(null);
  const [search, setSearch] = useState('');
  const filterChipsRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLUListElement | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });
  const actionMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    assetId: string;
  } | null>(null);

  /** When set, show prompt input for Modify from library; on submit we switch to image session */
  const [libraryModify, setLibraryModify] = useState<{
    asset: (typeof filteredAssets)[0];
    position: { x: number; y: number };
  } | null>(null);
  const [libraryModifyPrompt, setLibraryModifyPrompt] = useState('');
  const libraryModifyInputRef = useRef<HTMLInputElement>(null);

  // Liked asset IDs (unliking removes from library view)
  const [likedIds, setLikedIds] = useState<Set<string>>(() =>
    new Set(MOCK_LIBRARY_ASSETS.filter((a) => a.liked).map((a) => a.id))
  );

  const toggleLiked = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation();
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  };

  const handleStyleFilterChange = (styleId: string) => {
    setStyleFilter(styleId);
    setProductFilter('');
    setProductStyleFilter('');
    setCharacterFilter('');
    setLocationFilter('');
    setOpenFilterId(null);
  };

  // Close filter dropdown when clicking outside (chips or dropdown)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inChips = filterChipsRef.current?.contains(target);
      const inDropdown = filterDropdownRef.current?.contains(target);
      if (!inChips && !inDropdown) {
        setOpenFilterId(null);
        setFilterDropdownRect(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openFilterDropdown = (filterId: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFilterDropdownRect(rect);
    setOpenFilterId((prev) => (prev === filterId ? null : filterId));
  };

  const selectFilterOption = (filterId: string, value: string, setter: (v: string) => void) => {
    setter(value);
    setOpenFilterId(null);
    setFilterDropdownRect(null);
  };

  // Filtered assets, sorted by most recent first (only show liked assets)
  const filteredAssets = useMemo(() => {
    let result = [...MOCK_LIBRARY_ASSETS];

    // Only show liked
    result = result.filter((a) => likedIds.has(a.id));

    // Style filter
    if (styleFilter) {
      result = result.filter((a) => a.styleId === styleFilter);
    }

    // Products sub-filters
    if (styleFilter === 'style-3') {
      if (productFilter) {
        result = result.filter((a) => 'productId' in a && a.productId === productFilter);
      }
      if (productStyleFilter) {
        result = result.filter((a) => 'productStyleId' in a && a.productStyleId === productStyleFilter);
      }
    }

    // Characters sub-filters
    if (styleFilter === 'style-4') {
      if (characterFilter) {
        result = result.filter((a) => 'characterId' in a && a.characterId === characterFilter);
      }
      if (locationFilter) {
        result = result.filter((a) => 'locationId' in a && a.locationId === locationFilter);
      }
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q));
    }

    // Sort by createdAt descending (last saved at top)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [styleFilter, search, likedIds, productFilter, productStyleFilter, characterFilter, locationFilter]);

  // Asset count per style (only count liked assets)
  const styleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const asset of MOCK_LIBRARY_ASSETS) {
      if (asset.styleId && likedIds.has(asset.id)) {
        counts[asset.styleId] = (counts[asset.styleId] ?? 0) + 1;
      }
    }
    return counts;
  }, [likedIds]);

  const handleContextMenu = (e: React.MouseEvent, assetId: string) => {
    e.preventDefault();
    setContextMenu({ position: { x: e.clientX, y: e.clientY }, assetId });
  };

  const handleDotsClick = (e: React.MouseEvent, assetId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 200; // matches ContextMenu min-width
    setContextMenu({
      position: { x: rect.right - menuWidth, y: rect.bottom + 4 },
      assetId,
    });
  };

  const getContextItems = (assetId: string): MenuItem[] => {
    const asset = filteredAssets.find((a) => a.id === assetId);
    const isIllustration = asset?.styleId === 'style-2';

    const downloadItems: MenuItem[] = isIllustration
      ? [
          {
            id: 'download-sd',
            label: 'Download (SD)',
            icon: <DownloadSimple size={16} />,
            onAction: () => {},
          },
          {
            id: 'download-svg',
            label: 'Download (SVG)',
            icon: <DownloadSimple size={16} />,
            onAction: () => {},
          },
        ]
      : [
          {
            id: 'download-sd',
            label: 'Download (SD)',
            icon: <DownloadSimple size={16} />,
            onAction: () => {},
          },
          {
            id: 'download-hd',
            label: 'Download (HD)',
            icon: <DownloadSimple size={16} />,
            onAction: () => {},
          },
        ];

    return [
      {
        id: 'modify',
        label: 'Modify',
        icon: <PencilSimple size={16} />,
        onAction: () => {
          if (asset && contextMenu) {
            setLibraryModify({ asset, position: { ...contextMenu.position } });
            setLibraryModifyPrompt('');
            setContextMenu(null);
            setTimeout(() => libraryModifyInputRef.current?.focus(), 100);
          }
        },
      },
      ...downloadItems,
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

  const actionMenuItems: MenuItem[] = [
    {
      id: 'download-all',
      label: 'Download all',
      icon: <DownloadSimple size={16} />,
      onAction: () => {},
    },
    {
      id: 'edit-style',
      label: 'Edit style',
      icon: <PencilSimple size={16} />,
      onAction: () => {},
    },
    {
      id: 'delete-style',
      label: 'Delete style',
      icon: <Trash size={16} />,
      danger: true,
      dividerBefore: true,
      onAction: () => {},
    },
  ];

  const openActionMenu = () => {
    const rect = actionMenuTriggerRef.current?.getBoundingClientRect();
    if (rect) {
      const menuWidth = 200; // matches ContextMenu min-width
      setActionMenuPosition({
        x: rect.right - menuWidth,
        y: rect.bottom + 4,
      });
      setActionMenuOpen(true);
    }
  };

  const submitLibraryModify = () => {
    const prompt = libraryModifyPrompt.trim();
    if (!libraryModify || !prompt) return;
    const { asset } = libraryModify;
    dispatch({
      type: 'OPEN_IMAGINE_FOR_MODIFY',
      payload: {
        asset: {
          id: asset.id,
          url: asset.url,
          prompt: asset.name,
          type: asset.type,
          aspectRatio: asset.aspectRatio,
          savedToLibrary: true,
        },
        modifyPrompt: prompt,
      },
    });
    setLibraryModify(null);
    setLibraryModifyPrompt('');
  };

  return (
    <div className={styles.layout}>
      {/* ── Sidebar (style-based nav) ───────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          {MOCK_BRAND_STYLES.map((style) => (
            <button
              key={style.id}
              className={cn(
                styles.sidebarItem,
                styleFilter === style.id && styles.sidebarItemActive
              )}
              onClick={() => handleStyleFilterChange(style.id)}
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

          {/* Inline filter chips (Products / Characters) */}
          {styleFilter === 'style-3' && (
            <div ref={filterChipsRef} className={styles.filterChips}>
              <div className={styles.filterChipWrap}>
                <button
                  type="button"
                  className={cn(styles.filterChip, productFilter && styles.filterChipActive)}
                  onClick={(e) => openFilterDropdown('product', e)}
                  aria-expanded={openFilterId === 'product'}
                >
                  Product · {productFilter ? MOCK_PRODUCTS.find((p) => p.id === productFilter)?.name ?? 'All' : 'All'}
                  <CaretDown size={12} weight="bold" className={styles.filterChipCaret} />
                </button>
                {openFilterId === 'product' &&
                  filterDropdownRect &&
                  typeof document !== 'undefined' &&
                  createPortal(
                    <ul
                      ref={filterDropdownRef}
                      className={styles.filterDropdown}
                      style={{
                        left: filterDropdownRect.left,
                        top: filterDropdownRect.bottom + 4,
                        minWidth: filterDropdownRect.width,
                      }}
                    >
                      <li>
                        <button
                          type="button"
                          className={cn(styles.filterDropdownItem, !productFilter && styles.filterDropdownItemActive)}
                          onClick={() => selectFilterOption('product', '', setProductFilter)}
                        >
                          <span className={styles.filterDropdownIcon}>{!productFilter && <Check size={14} weight="bold" />}</span>
                          All
                        </button>
                      </li>
                      {MOCK_PRODUCTS.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            className={cn(styles.filterDropdownItem, productFilter === p.id && styles.filterDropdownItemActive)}
                            onClick={() => selectFilterOption('product', p.id, setProductFilter)}
                          >
                            <span className={styles.filterDropdownIcon}>{productFilter === p.id && <Check size={14} weight="bold" />}</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.image} alt="" className={styles.filterDropdownThumb} />
                            {p.name}
                          </button>
                        </li>
                      ))}
                    </ul>,
                    document.body
                  )}
              </div>
              <div className={styles.filterChipWrap}>
                <button
                  type="button"
                  className={cn(styles.filterChip, productStyleFilter && styles.filterChipActive)}
                  onClick={(e) => openFilterDropdown('style', e)}
                  aria-expanded={openFilterId === 'style'}
                >
                  Style · {productStyleFilter ? MOCK_PRODUCT_STYLES.find((s) => s.id === productStyleFilter)?.name ?? 'All' : 'All'}
                  <CaretDown size={12} weight="bold" className={styles.filterChipCaret} />
                </button>
                {openFilterId === 'style' &&
                  filterDropdownRect &&
                  typeof document !== 'undefined' &&
                  createPortal(
                    <ul
                      ref={filterDropdownRef}
                      className={styles.filterDropdown}
                      style={{
                        left: filterDropdownRect.left,
                        top: filterDropdownRect.bottom + 4,
                        minWidth: filterDropdownRect.width,
                      }}
                    >
                      <li>
                        <button
                          type="button"
                          className={cn(styles.filterDropdownItem, !productStyleFilter && styles.filterDropdownItemActive)}
                          onClick={() => selectFilterOption('style', '', setProductStyleFilter)}
                        >
                          <span className={styles.filterDropdownIcon}>{!productStyleFilter && <Check size={14} weight="bold" />}</span>
                          All
                        </button>
                      </li>
                      {MOCK_PRODUCT_STYLES.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            className={cn(styles.filterDropdownItem, productStyleFilter === s.id && styles.filterDropdownItemActive)}
                            onClick={() => selectFilterOption('style', s.id, setProductStyleFilter)}
                          >
                            <span className={styles.filterDropdownIcon}>{productStyleFilter === s.id && <Check size={14} weight="bold" />}</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={s.image} alt="" className={styles.filterDropdownThumb} />
                            {s.name}
                          </button>
                        </li>
                      ))}
                    </ul>,
                    document.body
                  )}
              </div>
            </div>
          )}
          {styleFilter === 'style-4' && (
            <div ref={filterChipsRef} className={styles.filterChips}>
              <div className={styles.filterChipWrap}>
                <button
                  type="button"
                  className={cn(styles.filterChip, characterFilter && styles.filterChipActive)}
                  onClick={(e) => openFilterDropdown('character', e)}
                  aria-expanded={openFilterId === 'character'}
                >
                  Character · {characterFilter ? MOCK_CHARACTERS.find((c) => c.id === characterFilter)?.name ?? 'All' : 'All'}
                  <CaretDown size={12} weight="bold" className={styles.filterChipCaret} />
                </button>
                {openFilterId === 'character' &&
                  filterDropdownRect &&
                  typeof document !== 'undefined' &&
                  createPortal(
                    <ul
                      ref={filterDropdownRef}
                      className={styles.filterDropdown}
                      style={{
                        left: filterDropdownRect.left,
                        top: filterDropdownRect.bottom + 4,
                        minWidth: filterDropdownRect.width,
                      }}
                    >
                      <li>
                        <button
                          type="button"
                          className={cn(styles.filterDropdownItem, !characterFilter && styles.filterDropdownItemActive)}
                          onClick={() => selectFilterOption('character', '', setCharacterFilter)}
                        >
                          <span className={styles.filterDropdownIcon}>{!characterFilter && <Check size={14} weight="bold" />}</span>
                          All
                        </button>
                      </li>
                      {MOCK_CHARACTERS.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            className={cn(styles.filterDropdownItem, characterFilter === c.id && styles.filterDropdownItemActive)}
                            onClick={() => selectFilterOption('character', c.id, setCharacterFilter)}
                          >
                            <span className={styles.filterDropdownIcon}>{characterFilter === c.id && <Check size={14} weight="bold" />}</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={c.image} alt="" className={styles.filterDropdownThumb} />
                            {c.name}
                          </button>
                        </li>
                      ))}
                    </ul>,
                    document.body
                  )}
              </div>
              <div className={styles.filterChipWrap}>
                <button
                  type="button"
                  className={cn(styles.filterChip, locationFilter && styles.filterChipActive)}
                  onClick={(e) => openFilterDropdown('location', e)}
                  aria-expanded={openFilterId === 'location'}
                >
                  Location · {locationFilter ? MOCK_CHARACTER_LOCATIONS.find((l) => l.id === locationFilter)?.name ?? 'All' : 'All'}
                  <CaretDown size={12} weight="bold" className={styles.filterChipCaret} />
                </button>
                {openFilterId === 'location' &&
                  filterDropdownRect &&
                  typeof document !== 'undefined' &&
                  createPortal(
                    <ul
                      ref={filterDropdownRef}
                      className={styles.filterDropdown}
                      style={{
                        left: filterDropdownRect.left,
                        top: filterDropdownRect.bottom + 4,
                        minWidth: filterDropdownRect.width,
                      }}
                    >
                      <li>
                        <button
                          type="button"
                          className={cn(styles.filterDropdownItem, !locationFilter && styles.filterDropdownItemActive)}
                          onClick={() => selectFilterOption('location', '', setLocationFilter)}
                        >
                          <span className={styles.filterDropdownIcon}>{!locationFilter && <Check size={14} weight="bold" />}</span>
                          All
                        </button>
                      </li>
                      {MOCK_CHARACTER_LOCATIONS.map((loc) => (
                        <li key={loc.id}>
                          <button
                            type="button"
                            className={cn(styles.filterDropdownItem, locationFilter === loc.id && styles.filterDropdownItemActive)}
                            onClick={() => selectFilterOption('location', loc.id, setLocationFilter)}
                          >
                            <span className={styles.filterDropdownIcon}>{locationFilter === loc.id && <Check size={14} weight="bold" />}</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={loc.image} alt="" className={styles.filterDropdownThumb} />
                            {loc.name}
                          </button>
                        </li>
                      ))}
                    </ul>,
                    document.body
                  )}
              </div>
            </div>
          )}

          {/* Action menu */}
          <div className={styles.actionMenuWrap}>
            <button
              ref={actionMenuTriggerRef}
              type="button"
              className={styles.actionMenuBtn}
              onClick={openActionMenu}
              aria-label="Style actions"
              aria-expanded={actionMenuOpen}
            >
              <DotsThree size={20} weight="bold" />
            </button>
            {typeof document !== 'undefined' &&
              actionMenuOpen &&
              createPortal(
                <AnimatePresence>
                  <ContextMenu
                    items={actionMenuItems}
                    position={actionMenuPosition}
                    onClose={() => setActionMenuOpen(false)}
                  />
                </AnimatePresence>,
                document.body
              )}
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
              className={styles.masonry}
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
                          likedIds.has(asset.id) && styles.heartBtnLiked
                        )}
                        onClick={(e) => toggleLiked(e, asset.id)}
                        aria-label={likedIds.has(asset.id) ? 'Unlike' : 'Like'}
                      >
                        <Heart
                          size={14}
                          weight={likedIds.has(asset.id) ? 'fill' : 'regular'}
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

      {/* Context Menu (portaled so it positions next to the trigger) */}
      {typeof document !== 'undefined' &&
        contextMenu &&
        createPortal(
          <AnimatePresence>
            <ContextMenu
              items={getContextItems(contextMenu.assetId)}
              position={contextMenu.position}
              onClose={() => setContextMenu(null)}
            />
          </AnimatePresence>,
          document.body
        )}

      {/* Modify prompt popover (library): enter prompt then switch to image session */}
      {typeof document !== 'undefined' &&
        libraryModify &&
        createPortal(
          <motion.div
            className={styles.modifyPopover}
            style={{
              left: libraryModify.position.x,
              top: libraryModify.position.y,
            }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className={styles.modifyInputRow}>
              <input
                ref={libraryModifyInputRef}
                type="text"
                className={styles.modifyInput}
                value={libraryModifyPrompt}
                onChange={(e) => setLibraryModifyPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitLibraryModify();
                  if (e.key === 'Escape') setLibraryModify(null);
                }}
                placeholder="Describe changes..."
                autoFocus
              />
              <button
                type="button"
                className={styles.modifySubmitBtn}
                onClick={submitLibraryModify}
                disabled={!libraryModifyPrompt.trim()}
                aria-label="Apply and open session"
              >
                <PaperPlaneRight size={16} weight="fill" />
              </button>
            </div>
          </motion.div>,
          document.body
        )}

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
