'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperPlaneRight,
  X,
  Sparkle,
  Package,
  UserCircle,
  PaintBrush,
  Image as ImageIcon,
  VideoCamera,
  MagnifyingGlass,
  Check,
} from '@phosphor-icons/react';
import cn from 'classnames';
import { useChat, CreativeMode } from '@/lib/chat-context';
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
  onSend?: (message: string) => void;
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
};

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3'] as const;
const VIDEO_DURATIONS = [5, 10, 15] as const;

/* ── Main Component ─────────────────────────────────────────────────── */

export default function ChatInput({ className, onSend }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { state, dispatch } = useChat();

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearMode = () => dispatch({ type: 'EXIT_MODE' });

  const mode = state.mode;
  const meta = MODE_META[mode];

  /* Derive inline tags from current state */
  const inlineTags: InlineTag[] = [];

  if (mode === 'imagine' && state.imagineOptions.brandStyle) {
    const s = MOCK_BRAND_STYLES.find((x) => x.id === state.imagineOptions.brandStyle);
    if (s) {
      inlineTags.push({
        id: `style-${s.id}`,
        label: s.name,
        category: 'style',
        onRemove: () => dispatch({ type: 'SET_IMAGINE_OPTIONS', payload: { brandStyle: '' } }),
      });
    }
  }

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
    if (state.productOptions.shotStyle) {
      const s = MOCK_PRODUCT_STYLES.find((x) => x.id === state.productOptions.shotStyle);
      if (s) {
        inlineTags.push({
          id: `pstyle-${s.id}`,
          label: s.name,
          category: 'style',
          onRemove: () => dispatch({ type: 'SET_PRODUCT_OPTIONS', payload: { shotStyle: '' } }),
        });
      }
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
    if (state.createOptions.brandStyle) {
      const s = MOCK_BRAND_STYLES.find((x) => x.id === state.createOptions.brandStyle);
      if (s) {
        inlineTags.push({
          id: `cstyle-${s.id}`,
          label: s.name,
          category: 'style',
          onRemove: () => dispatch({ type: 'SET_CREATE_OPTIONS', payload: { brandStyle: '' } }),
        });
      }
    }
  }

  const placeholder =
    mode === 'idle'
      ? 'Ask anything...'
      : mode === 'imagine'
        ? 'Describe the image you want to create...'
        : mode === 'product'
          ? 'Describe the product shot...'
          : mode === 'character'
            ? 'Describe the scene with your characters...'
            : 'Describe the ad you want to create...';

  return (
    <div className={cn(styles.wrapper, className)}>
      {/* Mode pill */}
      <AnimatePresence>
        {mode !== 'idle' && (
          <motion.div
            className={styles.modePill}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className={styles.modePillInner}>
              <span className={styles.modeIcon} style={{ color: meta.color }}>
                {meta.icon}
              </span>
              <span className={styles.modeLabel}>{meta.label}</span>
              <button className={styles.modeClose} onClick={clearMode}>
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            className={cn(styles.sendButton, value.trim() && styles.sendButtonActive)}
            onClick={handleSend}
            disabled={!value.trim()}
          >
            <PaperPlaneRight size={18} weight="fill" />
          </button>
        </div>
      </div>

      {/* Picker bar (mode-specific visual chips) */}
      <AnimatePresence>
        {mode !== 'idle' && (
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

  return (
    <>
      <div className={styles.pickerRow}>
        <div className={styles.pillGroup}>
          {ASPECT_RATIOS.map((r) => (
            <button
              key={r}
              className={cn(styles.pill, opts.aspectRatio === r && styles.pillActive)}
              onClick={() => dispatch({ type: 'SET_IMAGINE_OPTIONS', payload: { aspectRatio: r } })}
            >
              {r}
            </button>
          ))}
        </div>

        <div className={styles.pickerDivider} />

        <div className={styles.pillGroup}>
          <button
            className={cn(styles.pill, styles.pillWithIcon, opts.outputType === 'image' && styles.pillActive)}
            onClick={() => dispatch({ type: 'SET_IMAGINE_OPTIONS', payload: { outputType: 'image' } })}
          >
            <ImageIcon size={14} /> Image
          </button>
          <button
            className={cn(styles.pill, styles.pillWithIcon, opts.outputType === 'video' && styles.pillActive)}
            onClick={() => dispatch({ type: 'SET_IMAGINE_OPTIONS', payload: { outputType: 'video' } })}
          >
            <VideoCamera size={14} /> Video
          </button>
        </div>

        {opts.outputType === 'video' && (
          <>
            <div className={styles.pickerDivider} />
            <div className={styles.pillGroup}>
              {VIDEO_DURATIONS.map((d) => (
                <button
                  key={d}
                  className={cn(styles.pill, opts.duration === d && styles.pillActive)}
                  onClick={() => dispatch({ type: 'SET_IMAGINE_OPTIONS', payload: { duration: d } })}
                >
                  {d}s
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.pickerRow}>
        <span className={styles.pickerLabel}>Style</span>
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
                type: 'SET_IMAGINE_OPTIONS',
                payload: { brandStyle: opts.brandStyle === s.id ? '' : s.id },
              })
            }
          />
        ))}
      </div>
    </>
  );
}

/* ── Product Pickers ────────────────────────────────────────────────── */

function ProductPickers() {
  const { state, dispatch } = useChat();
  const opts = state.productOptions;
  const [search, setSearch] = useState('');
  const selectedIds = new Set(opts.selectedProducts.map((p) => p.id));

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
        <span className={styles.pickerLabel}>Style</span>
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
