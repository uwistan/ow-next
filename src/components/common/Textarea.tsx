import { Copy } from '@phosphor-icons/react';
import cn from 'classnames';
import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import styles from '@/components/common/Input.module.css';
import { copyText } from '@/lib/utils/clipboard';
import { Button } from './Button';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label?: string;
  error?: string | null;
  rows?: number;
  enableCopy?: boolean;
  autoResize?: boolean;
  /**
   * Optional callback fired when the user presses Enter without holding Shift.
   * Useful for chat-like submit behaviour.
   */
  onEnterPress?: () => void;
};

export default function Textarea({
  id,
  label,
  error,
  className,
  rows = 3,
  onEnterPress,
  onKeyDown,
  enableCopy,
  autoResize = false,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const textareaClasses = cn(
    styles.input,
    { [styles.inputError]: !!error }
  );

  const formGroupClasses = cn(styles.formGroup, className);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onEnterPress && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnterPress();
    }
    if (onKeyDown) onKeyDown(e);
  };

  const handleCopy = async () => {
    const ok = await copyText(String(props.value ?? ''));
    if (ok) toast.success('Copied to clipboard');
    else toast.error('Failed to copy');
  };

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const timeoutId = setTimeout(() => {
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          textarea.style.height = 'auto';
          const minHeight = rows * 1.5 * 16;
          const newHeight = Math.max(textarea.scrollHeight, minHeight);
          textarea.style.height = `${newHeight}px`;
        }
      }, 10);

      return () => clearTimeout(timeoutId);
    }
  }, [props.value, autoResize, rows]);

  return (
    <div className={formGroupClasses}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        id={id}
        className={textareaClasses}
        rows={rows}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
      {enableCopy && (
        <Button
          variant="secondary"
          size="sm"
          icon={<Copy size={16} />}
          onClick={handleCopy}
          className={styles.copyButton}
        >
          Copy Prompt
        </Button>
      )}
    </div>
  );
}
