'use client';

import { useRef, useEffect } from 'react';
import { Package, UserCircle } from '@phosphor-icons/react';
import cn from 'classnames';
import styles from './ChatInput.module.css';

export interface MentionProduct {
  type: 'product';
  id: string;
  name: string;
  image: string;
}

export interface MentionCharacter {
  type: 'character';
  id: string;
  name: string;
  image: string;
}

export type MentionItem = MentionProduct | MentionCharacter;

interface MentionPopoverProps {
  items: MentionItem[];
  selectedIndex: number;
  onSelect: (item: MentionItem) => void;
  onClose: () => void;
  position: { top: number; left: number };
  query: string;
  onQueryChange: (q: string) => void;
  /** When true, show search input (e.g. for Add button popover) */
  showSearch?: boolean;
  /** Called for ArrowUp/ArrowDown/Enter - parent can handle keyboard nav */
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export default function MentionPopover({
  items,
  selectedIndex,
  onSelect,
  onClose,
  position,
  query,
  onQueryChange,
  showSearch = true,
  onKeyDown,
}: MentionPopoverProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const selected = el.querySelector(`[data-index="${selectedIndex}"]`);
    selected?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={styles.mentionPopover}
      style={{ top: position.top, left: position.left }}
      role="listbox"
    >
      {showSearch && (
        <div className={styles.mentionPopoverSearch}>
          <input
            ref={searchInputRef}
            type="text"
            className={styles.mentionPopoverInput}
            placeholder="Search products and characters..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && items.length > 0) {
                e.preventDefault();
                onSelect(items[selectedIndex]);
              } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && items.length > 0) {
                e.preventDefault();
                onKeyDown?.(e);
              }
            }}
          />
        </div>
      )}
      <div ref={listRef} className={styles.mentionPopoverList}>
        {items.length === 0 ? (
          <div className={styles.mentionPopoverEmpty}>No results</div>
        ) : (
          items.map((item, i) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              className={cn(
                styles.mentionPopoverItem,
                i === selectedIndex && styles.mentionPopoverItemActive
              )}
              data-index={i}
              onClick={() => onSelect(item)}
              role="option"
              aria-selected={i === selectedIndex}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" className={styles.mentionPopoverItemImage} />
              <span className={styles.mentionPopoverItemName}>{item.name}</span>
              <span
                className={cn(
                  styles.mentionPopoverItemBadge,
                  item.type === 'product' ? styles.mentionPopoverItemBadgeProduct : styles.mentionPopoverItemBadgeCharacter
                )}
              >
                {item.type === 'product' ? (
                  <Package size={10} />
                ) : (
                  <UserCircle size={10} />
                )}
                {item.type === 'product' ? 'Product' : 'Character'}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
