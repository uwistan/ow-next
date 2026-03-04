'use client';

import { X } from '@phosphor-icons/react';
import { NodeViewWrapper } from '@tiptap/react';
import cn from 'classnames';
import type { NodeViewProps } from '@tiptap/core';
import styles from './ChatInput.module.css';

export default function ProductTagChip({ node, editor, getPos }: NodeViewProps) {
  const { name, image } = node.attrs;

  const handleRemove = () => {
    const pos = getPos();
    if (typeof pos === 'number') {
      editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
    }
  };

  return (
    <NodeViewWrapper as="span" contentEditable={false} className={styles.inlineTagChip}>
      <span className={cn(styles.inlineTagChipInner, styles.tag_product)}>
        {image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={image} alt="" className={styles.inlineTagImage} />
        )}
        <span className={styles.inlineTagChipLabel}>{name}</span>
        <button
          type="button"
          className={styles.inlineTagRemove}
          onClick={handleRemove}
          aria-label={`Remove ${name}`}
        >
          <X size={10} />
        </button>
      </span>
    </NodeViewWrapper>
  );
}
