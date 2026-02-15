'use client';

import cn from 'classnames';
import { CaretUpDown } from '@phosphor-icons/react';
import { useState } from 'react';
import styles from './BrandSwitcher.module.css';

const BRANDS = [
  { id: 'brand-1', name: 'Acme Studio', initials: 'AS', color: '#6466ff' },
  { id: 'brand-2', name: 'Nova Labs', initials: 'NL', color: '#24ff78' },
];

interface BrandSwitcherProps {
  collapsed?: boolean;
}

export default function BrandSwitcher({ collapsed }: BrandSwitcherProps) {
  const [activeBrand, setActiveBrand] = useState(BRANDS[0]);
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
          {BRANDS.map((brand) => (
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
