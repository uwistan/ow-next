'use client';

import cn from 'classnames';
import { CaretUpDown } from '@phosphor-icons/react';
import { useState } from 'react';
import { useBrand } from '@/lib/brand-context';
import { MOCK_BRANDS } from '@/lib/mock-data';
import styles from './BrandSwitcher.module.css';

interface BrandSwitcherProps {
  collapsed?: boolean;
}

export default function BrandSwitcher({ collapsed }: BrandSwitcherProps) {
  const { activeBrand, setActiveBrand } = useBrand();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        className={cn(styles.trigger, collapsed && styles.collapsed)}
        onClick={() => setOpen((o) => !o)}
        title={collapsed ? activeBrand.name : undefined}
      >
        <span
          className={styles.brandLogo}
          style={{ backgroundColor: activeBrand.color }}
        >
          {activeBrand.initials}
        </span>
        {!collapsed && (
          <>
            <span className={styles.brandName}>{activeBrand.name}</span>
            <CaretUpDown size={14} className={styles.caret} />
          </>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          {MOCK_BRANDS.map((brand) => (
            <button
              key={brand.id}
              className={cn(
                styles.dropdownItem,
                brand.id === activeBrand.id && styles.activeItem
              )}
              onClick={() => {
                setActiveBrand(brand);
                setOpen(false);
              }}
            >
              <span
                className={styles.brandLogo}
                style={{ backgroundColor: brand.color }}
              >
                {brand.initials}
              </span>
              <span className={styles.brandName}>{brand.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
