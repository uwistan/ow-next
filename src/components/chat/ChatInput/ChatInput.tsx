'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperPlaneRight,
  X,
  CaretDown,
  Sparkle,
  Package,
  UserCircle,
  PaintBrush,
  ChatCircle,
  Image as ImageIcon,
  VideoCamera,
  MagnifyingGlass,
  Check,
  Plus,
} from '@phosphor-icons/react';
import cn from 'classnames';
import { useChat, CreativeMode } from '@/lib/chat-context';
import { useIsAdmin } from '@/lib/permissions';
import {
  MOCK_BRAND_STYLES,
  MOCK_PRODUCT_STYLES,
  MOCK_PRODUCTS,
  MOCK_CHARACTERS,
  MOCK_AD_TEMPLATES,
} from '@/lib/mock-data';
import StyleChip from '@/components/chat/StyleChip/StyleChip';
import styles from './ChatInput.module.css';

/* ── Types ──────────────────────────────────────────────────────────── */

interface ChatInputProps {
  className?: string;
  onSend?: (message: string) => boolean | void;
}

interface InlineTag {
  id: string;
  label: string;
  image?: string;
  category: 'product' | 'character' | 'style' | 'format';
  onRemove: () => void;
}

/* ── Constants ──────────────────────────────────────────────────────── */

const MODE_META: Record<CreativeMode, { icon: React.ReactNode; label: string; color: string }> = {
  idle: { icon: null, label: '', color: '' },
  imagine: { icon: <Sparkle size={14} weight="fill" />, label: 'Imagine', color: 'var(--color-purplish-blue)' },
  product: { icon: <Package size={14} weight="fill" />, label: 'Product', color: '#e67e22' },
  character: { icon: <UserCircle size={14} weight="fill" />, label: 'Character', color: '#2ecc71' },
  create: { icon: <PaintBrush size={14} weight="fill" />, label: 'Create', color: '#e74c3c' },
  assistant: { icon: <ChatCircle size={14} weight="fill" />, label: 'Chat', color: '#9b59b6' },
};

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3'] as const;
const VIDEO_DURATIONS = [5, 10, 15] as const;

/* ── Main Component ─────────────────────────────────────────────────── */

export default function ChatInput({ className, onSend }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { state, dispatch } = useChat();
  const mode = state.mode;
  const hasMessages = state.currentSession && state.currentSession.messages.length > 0;
  const inImagineSessionView = mode === 'imagine' && hasMessages;
  const lastUserMessage = state.currentSession?.messages
    ?.filter((m) => m.role === 'user')
    .pop();

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value]);

  useEffect(() => {
    if (inImagineSessionView && lastUserMessage?.content) {
      setValue(lastUserMessage.content);
    }
  }, [inImagineSessionView, state.currentSession?.id]);

  const canSendImagine = mode !== 'imagine' || !!state.imagineOptions.brandStyle;
  const canSend = value.trim() && canSendImagine;

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (mode === 'imagine' && !state.imagineOptions.brandStyle) return;
    const accepted = onSend?.(trimmed);
    if (accepted !== false) setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Derive inline tags from current state (styles excluded – active state only in picker) */
  const inlineTags: InlineTag[] = [];

  if (mode === 'product') {
    for (const p of state.productOptions.selectedProducts) {
      inlineTags.push({
        id: `prod-${p.id}`,
        label: p.name,
        image: p.image,
        category: 'product',
        onRemove: () =>
          dispatch({
            type: 'SET_PRODUCT_OPTIONS',
            payload: {
              selectedProducts: state.productOptions.selectedProducts.filter((x) => x.id !== p.id),
            },
          }),
      });
    }
  }

  if (mode === 'character') {
    for (const c of state.characterOptions.selectedCharacters) {
      inlineTags.push({
        id: `char-${c.id}`,
        label: c.name,
        image: c.image,
        category: 'character',
        onRemove: () =>
          dispatch({
            type: 'SET_CHARACTER_OPTIONS',
            payload: {
              selectedCharacters: state.characterOptions.selectedCharacters.filter(
                (x) => x.id !== c.id
              ),
            },
          }),
      });
    }
  }

  if (mode === 'create') {
    if (state.createOptions.adFormat) {
      const t = MOCK_AD_TEMPLATES.find((x) => x.id === state.createOptions.adFormat);
      if (t) {
        inlineTags.push({
          id: `fmt-${t.id}`,
          label: t.name,
          category: 'format',
          onRemove: () => dispatch({ type: 'SET_CREATE_OPTIONS', payload: { adFormat: '' } }),
        });
      }
    }
  }

  const placeholder =
    mode === 'idle'
      ? 'Ask anything...'
      : mode === 'imagine'
        ? state.imagineOptions.brandStyle
          ? 'Describe the image you want to create...'
          : 'Select a style first, then describe the image...'
        : mode === 'product'
          ? 'Describe the product shot...'
          : mode === 'character'
            ? 'Describe the scene with your characters...'
            : mode === 'assistant'
              ? 'Ask your brand assistant anything...'
              : 'Describe the ad you want to create...';

  return (
    <div className={cn(styles.wrapper, className)}>
      {/* Input area: inline tags + textarea */}
      <div className={styles.inputArea}>
        {inlineTags.length > 0 && (
          <div className={styles.tagsRow}>
            {inlineTags.map((tag) => (
              <span key={tag.id} className={cn(styles.inlineTag, styles[`tag_${tag.category}`])}>
                {tag.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={tag.image} alt="" className={styles.inlineTagImage} />
                )}
                {tag.label}
                <button className={styles.inlineTagRemove} onClick={tag.onRemove}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className={styles.textRow}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className={cn(
              styles.sendButton,
              mode === 'imagine' && styles.sendButtonText,
              canSend && styles.sendButtonActive
            )}
            onClick={handleSend}
            disabled={!canSend}
          >
            {mode === 'imagine'
              ? inImagineSessionView
                ? 'Create more'
                : 'Create Images'
              : <PaperPlaneRight size={18} weight="fill" />}
          </button>
        </div>
      </div>

      {/* Picker bar (mode-specific visual chips; assistant has none) */}
      <AnimatePresence>
        {mode !== 'idle' && mode !== 'assistant' && (
          <motion.div
            className={styles.pickerBar}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className={styles.pickerBarInner}>
              {mode === 'imagine' && <ImaginePickers />}
              {mode === 'product' && <ProductPickers />}
              {mode === 'character' && <CharacterPickers />}
              {mode === 'create' && <CreatePickers />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Imagine Pickers ────────────────────────────────────────────────── */

function ImaginePickers() {
  const { state, dispatch } = useChat();
  const opts = state.imagineOptions;
  const hasMessages = state.currentSession && state.currentSession.messages.length > 0;
  const inSessionView = state.mode === 'imagine' && hasMessages;
  const [formatOpen, setFormatOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const formatTriggerRef = useRef<HTMLButtonElement>(null);
  const formatPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formatOpen && formatTriggerRef.current) {
      const rect = formatTriggerRef.current.getBoundingClientRect();
      setPopoverPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [formatOpen]);

  useEffect(() => {
    if (!formatOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        formatTriggerRef.current?.contains(e.target as Node) ||
        formatPopoverRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setFormatOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [formatOpen]);

  const formatPopoverContent = formatOpen && (
    <AnimatePresence>
      <motion.div
        ref={formatPopoverRef}
        className={styles.formatSelectPopover}
        style={{ top: popoverPosition.top, left: popoverPosition.left }}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
      >
        <div className={styles.formatSelectContent}>
          <div className={styles.imagineFormatBlock}>
            <span className={styles.imagineFormatLabel}>Aspect Ratio</span>
            <div className={styles.aspectRatioRow}>
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={cn(
                    styles.aspectRatioBtn,
                    opts.aspectRatio === r && styles.aspectRatioBtnActive
                  )}
                  onClick={() =>
                    dispatch({ type: 'SET_IMAGINE_OPTIONS', payload: { aspectRatio: r } })
                  }
                >
                  <span
                    className={cn(
                      styles.aspectRatioIcon,
                      styles[`aspectRatioIcon_${r.replace(':', '_')}`]
                    )}
                  />
                  <span className={styles.aspectRatioLabel}>{r}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      <div className={styles.pickerRow}>
        <div className={styles.pickerRowLeft}>
          {(inSessionView
            ? MOCK_BRAND_STYLES.filter((s) => opts.brandStyle === s.id)
            : MOCK_BRAND_STYLES
          ).map((s) => (
            <StyleChip
              key={s.id}
              name={s.name}
              image={s.image}
              description={s.description}
              previews={s.previews}
              isActive={opts.brandStyle === s.id}
              onClick={() =>
                dispatch({
                  type: 'SET_IMAGINE_OPTIONS',
                  payload: { brandStyle: opts.brandStyle === s.id ? '' : s.id },
                })
              }
            />
          ))}
        </div>
        <div className={styles.formatSelectWrap}>
          <button
            ref={formatTriggerRef}
            type="button"
            className={styles.formatSelectTrigger}
            onClick={() => setFormatOpen(!formatOpen)}
          >
            <ImageIcon size={14} weight="duotone" />
            <span>{opts.aspectRatio}</span>
            <CaretDown size={12} weight="bold" />
          </button>
        </div>
      </div>

      {typeof document !== 'undefined' &&
        formatPopoverContent &&
        createPortal(formatPopoverContent, document.body)}
    </>
  );
}

/* ── Product Pickers ────────────────────────────────────────────────── */

function ProductPickers() {
  const { state, dispatch } = useChat();
  const opts = state.productOptions;
  const [search, setSearch] = useState('');
  const selectedIds = new Set(opts.selectedProducts.map((p) => p.id));
  const isAdmin = useIsAdmin();
  const router = useRouter();

  const visibleProducts = search
    ? MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : MOCK_PRODUCTS;

  const toggleProduct = (prod: (typeof MOCK_PRODUCTS)[0]) => {
    if (selectedIds.has(prod.id)) {
      dispatch({
        type: 'SET_PRODUCT_OPTIONS',
        payload: {
          selectedProducts: opts.selectedProducts.filter((p) => p.id !== prod.id),
        },
      });
    } else {
      dispatch({
        type: 'SET_PRODUCT_OPTIONS',
        payload: {
          selectedProducts: [...opts.selectedProducts, prod],
        },
      });
    }
  };

  return (
    <>
      <div className={styles.pickerRow}>
        <span className={styles.pickerLabel}>
          <Package size={14} weight="bold" />
        </span>
        <div className={styles.searchChip}>
          <MagnifyingGlass size={12} />
          <input
            className={styles.searchChipInput}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {visibleProducts.map((p) => (
          <button
            key={p.id}
            className={cn(styles.chipButton, selectedIds.has(p.id) && styles.chipButtonActive)}
            onClick={() => toggleProduct(p)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt="" className={styles.chipImage} />
            {p.name}
            {selectedIds.has(p.id) && <Check size={12} weight="bold" />}
          </button>
        ))}
        {isAdmin && (
          <button
            className={styles.chipButton}
            onClick={() => router.push('/manage/products/new')}
          >
            <Plus size={12} />
            New Product
          </button>
        )}
      </div>

      <div className={styles.pickerRow}>
        <span className={styles.pickerLabel}>Shot</span>
        {MOCK_PRODUCT_STYLES.map((s) => (
          <StyleChip
            key={s.id}
            name={s.name}
            image={s.image}
            description={s.description}
            previews={s.previews}
            isActive={opts.shotStyle === s.id}
            onClick={() =>
              dispatch({
                type: 'SET_PRODUCT_OPTIONS',
                payload: { shotStyle: opts.shotStyle === s.id ? '' : s.id },
              })
            }
          />
        ))}
      </div>
    </>
  );
}

/* ── Character Pickers ──────────────────────────────────────────────── */

function CharacterPickers() {
  const { state, dispatch } = useChat();
  const opts = state.characterOptions;
  const selectedIds = new Set(opts.selectedCharacters.map((c) => c.id));
  const isAdmin = useIsAdmin();
  const router = useRouter();

  const toggleCharacter = (char: (typeof MOCK_CHARACTERS)[0]) => {
    if (selectedIds.has(char.id)) {
      dispatch({
        type: 'SET_CHARACTER_OPTIONS',
        payload: {
          selectedCharacters: opts.selectedCharacters.filter((c) => c.id !== char.id),
        },
      });
    } else {
      dispatch({
        type: 'SET_CHARACTER_OPTIONS',
        payload: {
          selectedCharacters: [...opts.selectedCharacters, char],
        },
      });
    }
  };

  return (
    <div className={styles.pickerRow}>
      <span className={styles.pickerLabel}>
        <UserCircle size={14} weight="bold" />
      </span>
      {MOCK_CHARACTERS.map((c) => (
        <button
          key={c.id}
          className={cn(
            styles.chipButton,
            styles.chipButtonAvatar,
            selectedIds.has(c.id) && styles.chipButtonActive
          )}
          onClick={() => toggleCharacter(c)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.image} alt="" className={styles.chipAvatar} />
          {c.name}
          {selectedIds.has(c.id) && <Check size={12} weight="bold" />}
        </button>
      ))}
      {isAdmin && (
        <button
          className={styles.chipButton}
          onClick={() => router.push('/manage/characters/new')}
        >
          <Plus size={12} />
          New Character
        </button>
      )}
    </div>
  );
}

/* ── Create (Ads) Pickers ───────────────────────────────────────────── */

function CreatePickers() {
  const { state, dispatch } = useChat();
  const opts = state.createOptions;

  return (
    <>
      <div className={styles.pickerRow}>
        <span className={styles.pickerLabel}>Format</span>
        {MOCK_AD_TEMPLATES.map((t) => (
          <button
            key={t.id}
            className={cn(styles.chipButton, opts.adFormat === t.id && styles.chipButtonActive)}
            onClick={() =>
              dispatch({
                type: 'SET_CREATE_OPTIONS',
                payload: { adFormat: opts.adFormat === t.id ? '' : t.id },
              })
            }
          >
            {opts.adFormat === t.id && <Check size={12} weight="bold" />}
            <span>{t.name}</span>
            <span className={styles.chipMeta}>{t.dimensions}</span>
          </button>
        ))}
      </div>

      <div className={styles.pickerRow}>
        {MOCK_BRAND_STYLES.map((s) => (
          <StyleChip
            key={s.id}
            name={s.name}
            image={s.image}
            description={s.description}
            previews={s.previews}
            isActive={opts.brandStyle === s.id}
            onClick={() =>
              dispatch({
                type: 'SET_CREATE_OPTIONS',
                payload: { brandStyle: opts.brandStyle === s.id ? '' : s.id },
              })
            }
          />
        ))}
      </div>
    </>
  );
}
