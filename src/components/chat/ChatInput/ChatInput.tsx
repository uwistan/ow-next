'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperPlaneRight,
  X,
  CaretDown,
  Image as ImageIcon,
  Check,
} from '@phosphor-icons/react';
import cn from 'classnames';
import { useChat } from '@/lib/chat-context';
import { setMentionMode } from '@/lib/mention-mode';
import { useIsAdmin } from '@/lib/permissions';
import {
  MOCK_BRAND_STYLES,
  MOCK_IMAGE_STYLES,
  MOCK_PRODUCT_STYLES,
  MOCK_CHARACTER_LOCATIONS,
  MOCK_AD_TEMPLATES,
} from '@/lib/mock-data';
import StyleChip from '@/components/chat/StyleChip/StyleChip';
import PromptEditor, { type PromptEditorRef } from '@/components/chat/ChatInput/PromptEditor';
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

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3'] as const;

/* ── Main Component ─────────────────────────────────────────────────── */

const usePromptEditor = (mode: string) =>
  ['imagine', 'assistant', 'product', 'character'].includes(mode);

export default function ChatInput({ className, onSend }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const promptEditorRef = useRef<PromptEditorRef>(null);
  const { state, dispatch } = useChat();
  const mode = state.mode;
  const hasMessages = state.currentSession && state.currentSession.messages.length > 0;
  const hasAssets = state.currentSession && state.currentSession.generatedAssets.length > 0;
  const inImageSessionView =
    (mode === 'imagine' || mode === 'product' || mode === 'character') &&
    state.currentSession &&
    (hasMessages || hasAssets);
  const lastUserMessage = state.currentSession?.messages
    ?.filter((m) => m.role === 'user')
    .pop();
  const usePromptEditorFor = usePromptEditor(mode);
  const [promptEditorEmpty, setPromptEditorEmpty] = useState(true);

  useEffect(() => {
    setMentionMode(mode);
  }, [mode]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [value]);

  useEffect(() => {
    if (usePromptEditorFor && inImageSessionView && lastUserMessage?.content) {
      promptEditorRef.current?.setContent(lastUserMessage.content);
    }
  }, [usePromptEditorFor, inImageSessionView, state.currentSession?.id, lastUserMessage?.content]);

  const canSendRequirement =
    mode === 'imagine'
      ? !!state.imagineOptions.brandStyle
      : mode === 'product'
        ? !!state.productOptions.shotStyle
        : mode === 'character'
          ? !!state.characterOptions.location
          : true;
  const canSendTextarea = value.trim() && canSendRequirement;
  const canSendPromptEditor = !promptEditorEmpty && canSendRequirement;
  const canSend = usePromptEditorFor ? canSendPromptEditor : canSendTextarea;

  const handleSend = useCallback(() => {
    if (mode === 'imagine' && !state.imagineOptions.brandStyle) return;
    if (mode === 'product' && !state.productOptions.shotStyle) return;
    if (mode === 'character' && !state.characterOptions.location) return;
    if (usePromptEditorFor) {
      const text = promptEditorRef.current?.getText() ?? '';
      const trimmed = text.trim();
      if (!trimmed) return;
      const accepted = onSend?.(trimmed);
      if (accepted !== false) {
        const keepForIteration =
          mode === 'imagine' || mode === 'product' || mode === 'character';
        if (!keepForIteration) {
          promptEditorRef.current?.setContent('');
        }
      }
    } else {
      const trimmed = value.trim();
      if (!trimmed) return;
      const accepted = onSend?.(trimmed);
      if (accepted !== false) {
        const keepForIteration =
          mode === 'imagine' || mode === 'product' || mode === 'character';
        if (!keepForIteration) {
          setValue('');
        }
      }
    }
  }, [mode, state.imagineOptions.brandStyle, state.productOptions.shotStyle, state.characterOptions.location, usePromptEditorFor, value, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Derive inline tags from current state (product/character use PromptEditor; create mode uses tags) */
  const inlineTags: InlineTag[] = [];

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
      ? 'Choose a mode below to get started'
      : mode === 'imagine'
        ? state.imagineOptions.brandStyle
          ? 'Describe the image you want to create...'
          : 'Select a brand style below, then describe the image you want'
        : mode === 'product'
          ? state.productOptions.shotStyle
            ? 'Add products with @ and describe the scene...'
            : 'Select a shot style below, then add products with @'
          : mode === 'character'
            ? state.characterOptions.location
              ? 'Add characters with @ and describe the scene...'
              : 'Select a location below, then add characters with @'
            : mode === 'assistant'
              ? 'Ask me anything about your brand'
              : 'Select a format below, then describe the ad you want to create';

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
          {usePromptEditorFor ? (
            <PromptEditor
              ref={promptEditorRef}
              placeholder={placeholder}
              onSend={handleSend}
              onContentChange={setPromptEditorEmpty}
              content={inImageSessionView && lastUserMessage?.content ? lastUserMessage.content : undefined}
            />
          ) : (
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          )}
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
              ? inImageSessionView
                ? 'Create more'
                : 'Create Images'
              : <PaperPlaneRight size={18} weight="fill" />}
          </button>
        </div>
      </div>

      {/* Picker bar (mode-specific visual chips; assistant shows empty placeholder for consistent height) */}
      {mode !== 'idle' && (
        <div className={styles.pickerBar}>
          <div className={styles.pickerBarInner}>
            {mode === 'imagine' && <ImaginePickers />}
            {mode === 'product' && <ProductPickers />}
            {mode === 'character' && <CharacterPickers />}
            {mode === 'create' && <CreatePickers />}
          </div>
        </div>
      )}
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
            : MOCK_IMAGE_STYLES
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

  return (
    <div className={styles.pickerRow}>
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
  );
}

/* ── Character Pickers ──────────────────────────────────────────────── */

function CharacterPickers() {
  const { state, dispatch } = useChat();
  const opts = state.characterOptions;

  return (
    <div className={styles.pickerRow}>
      {MOCK_CHARACTER_LOCATIONS.map((s) => (
        <StyleChip
          key={s.id}
          name={s.name}
          image={s.image}
          description={s.description}
          previews={s.previews}
          isActive={opts.location === s.id}
          onClick={() =>
            dispatch({
              type: 'SET_CHARACTER_OPTIONS',
              payload: { location: opts.location === s.id ? '' : s.id },
            })
          }
        />
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
        {MOCK_IMAGE_STYLES.map((s) => (
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
