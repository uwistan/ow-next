'use client';

import cn from 'classnames';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './IconButton.module.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'filled';
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', variant = 'ghost', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(styles.iconButton, styles[size], styles[variant], className)}
        type="button"
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
export default IconButton;
