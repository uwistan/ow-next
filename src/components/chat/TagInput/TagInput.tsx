'use client';

import { useState, useRef, useEffect } from 'react';
import { X, MagnifyingGlass } from '@phosphor-icons/react';
import styles from './TagInput.module.css';

export interface TagItem {
  id: string;
  name: string;
  image?: string;
  subtitle?: string;
}

interface TagInputProps {
  items: TagItem[];
  selectedItems: TagItem[];
  onSelect: (item: TagItem) => void;
  onRemove: (id: string) => void;
  placeholder?: string;
  label?: string;
}

export default function TagInput({
  items,
  selectedItems,
  onSelect,
  onRemove,
  placeholder = 'Search...',
  label,
}: TagInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = items.filter(
    (item) =>
      !selectedItems.some((s) => s.id === item.id) &&
      item.name.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.inputRow}>
        {selectedItems.map((item) => (
          <span key={item.id} className={styles.tag}>
            {item.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt="" className={styles.tagImage} />
            )}
            {item.name}
            <button className={styles.tagRemove} onClick={() => onRemove(item.id)}>
              <X size={10} />
            </button>
          </span>
        ))}
        <div className={styles.searchWrap}>
          <MagnifyingGlass size={14} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
          />
        </div>
      </div>

      {open && filtered.length > 0 && (
        <div className={styles.dropdown}>
          {filtered.map((item) => (
            <button
              key={item.id}
              className={styles.dropdownItem}
              onClick={() => {
                onSelect(item);
                setQuery('');
              }}
            >
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className={styles.itemImage} />
              )}
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                {item.subtitle && <span className={styles.itemSubtitle}>{item.subtitle}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
