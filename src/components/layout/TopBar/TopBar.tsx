'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  GearSix,
  Palette,
  Package,
  UserCircle,
  Megaphone,
  SignOut,
  Swatches,
  Camera,
} from '@phosphor-icons/react';
import Avatar from '@/components/common/Avatar';
import BrandSwitcher from '@/components/layout/BrandSwitcher/BrandSwitcher';
import FlipToggle from '@/components/layout/FlipToggle/FlipToggle';
import { MOCK_USER } from '@/lib/mock-data';
import { useIsAdmin } from '@/lib/permissions';
import { useChat, ManagePanelType } from '@/lib/chat-context';
import styles from './TopBar.module.css';

interface MenuItemDef {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  divider?: boolean;
  danger?: boolean;
  adminOnly?: boolean;
  managePanel?: ManagePanelType;
}

export default function TopBar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = useIsAdmin();
  const { dispatch } = useChat();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9e12a5bc-bcf8-4863-ba85-1864bc6b6f1f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TopBar.tsx:render',message:'TopBar rendered',data:{isAdmin},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const USER_MENU_ITEMS: MenuItemDef[] = useMemo(() => [
    { id: 'account', label: 'Account Settings', icon: <GearSix size={16} /> },
    { id: 'brand', label: 'Brand Settings', icon: <Palette size={16} /> },
    { id: 'divider-1', divider: true, adminOnly: true },
    { id: 'styles', label: 'Manage Styles', icon: <Swatches size={16} />, adminOnly: true, managePanel: 'styles' },
    { id: 'products', label: 'Manage Products', icon: <Package size={16} />, adminOnly: true, managePanel: 'products' },
    { id: 'shots', label: 'Manage Shots', icon: <Camera size={16} />, adminOnly: true, managePanel: 'shots' },
    { id: 'characters', label: 'Manage Characters', icon: <UserCircle size={16} />, adminOnly: true, managePanel: 'characters' },
    { id: 'ads', label: 'Manage Ads', icon: <Megaphone size={16} />, adminOnly: true },
    { id: 'divider-2', divider: true },
    { id: 'logout', label: 'Sign Out', icon: <SignOut size={16} />, danger: true },
  ], []);

  const visibleItems = useMemo(() => {
    return USER_MENU_ITEMS.filter((item) => !item.adminOnly || isAdmin);
  }, [USER_MENU_ITEMS, isAdmin]);

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

  const handleItemClick = (item: MenuItemDef) => {
    setUserMenuOpen(false);
    if (item.managePanel) {
      dispatch({ type: 'SET_MANAGE_PANEL', payload: item.managePanel });
    }
  };

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
              {visibleItems.map((item) =>
                item.divider ? (
                  <div key={item.id} className={styles.menuDivider} />
                ) : (
                  <button
                    key={item.id}
                    className={
                      item.danger
                        ? styles.menuItemDanger
                        : styles.menuItem
                    }
                    onClick={() => handleItemClick(item)}
                  >
                    {item.icon}
                    {item.label}
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
