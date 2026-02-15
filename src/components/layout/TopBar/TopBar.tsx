'use client';

import { useState, useRef, useEffect } from 'react';
import {
  GearSix,
  Palette,
  Package,
  UserCircle,
  Megaphone,
  SignOut,
} from '@phosphor-icons/react';
import Avatar from '@/components/common/Avatar';
import BrandSwitcher from '@/components/layout/BrandSwitcher/BrandSwitcher';
import FlipToggle from '@/components/layout/FlipToggle/FlipToggle';
import { MOCK_USER } from '@/lib/mock-data';
import styles from './TopBar.module.css';

const USER_MENU_ITEMS = [
  { id: 'account', label: 'Account Settings', icon: <GearSix size={16} /> },
  { id: 'brand', label: 'Brand Settings', icon: <Palette size={16} /> },
  { id: 'divider-1', divider: true },
  { id: 'products', label: 'Manage Products', icon: <Package size={16} /> },
  { id: 'characters', label: 'Manage Characters', icon: <UserCircle size={16} /> },
  { id: 'ads', label: 'Manage Ads', icon: <Megaphone size={16} /> },
  { id: 'divider-2', divider: true },
  { id: 'logout', label: 'Sign Out', icon: <SignOut size={16} />, danger: true },
] as const;

export default function TopBar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <BrandSwitcher />
      </div>

      <div className={styles.center}>
        <FlipToggle />
      </div>

      <div className={styles.right}>
        <div className={styles.avatarWrap} ref={menuRef}>
          <button
            className={styles.avatarButton}
            onClick={() => setUserMenuOpen((o) => !o)}
          >
            <Avatar src={MOCK_USER.avatarUrl} name={MOCK_USER.name} size="sm" />
          </button>

          {userMenuOpen && (
            <div className={styles.userMenu}>
              <div className={styles.menuHeader}>
                <Avatar src={MOCK_USER.avatarUrl} name={MOCK_USER.name} size="sm" />
                <div className={styles.menuHeaderInfo}>
                  <span className={styles.menuHeaderName}>{MOCK_USER.name}</span>
                  <span className={styles.menuHeaderEmail}>{MOCK_USER.email}</span>
                </div>
              </div>
              {USER_MENU_ITEMS.map((item) =>
                'divider' in item && item.divider ? (
                  <div key={item.id} className={styles.menuDivider} />
                ) : (
                  <button
                    key={item.id}
                    className={
                      'danger' in item && item.danger
                        ? styles.menuItemDanger
                        : styles.menuItem
                    }
                    onClick={() => setUserMenuOpen(false)}
                  >
                    {'icon' in item && item.icon}
                    {'label' in item && item.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
