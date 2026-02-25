'use client';

import { Tooltip } from '@base-ui/react/tooltip';
import cn from 'classnames';
import Link from 'next/link';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, FocusEvent, forwardRef, KeyboardEvent, MouseEvent } from 'react';

import Spinner from '@/components/common/Spinner';

import styles from './Button.module.css';
import tooltipStyles from './Tooltip.module.css';

// Define common event handlers that can apply to both button and anchor
type CommonEventHandlers = {
  onClick?: (
    event: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLAnchorElement>
  ) => void;
  onFocus?: (
    event: FocusEvent<HTMLButtonElement> | FocusEvent<HTMLAnchorElement>
  ) => void;
  onBlur?: (
    event: FocusEvent<HTMLButtonElement> | FocusEvent<HTMLAnchorElement>
  ) => void;
  onKeyDown?: (
    event: KeyboardEvent<HTMLButtonElement> | KeyboardEvent<HTMLAnchorElement>
  ) => void;
  onKeyUp?: (
    event: KeyboardEvent<HTMLButtonElement> | KeyboardEvent<HTMLAnchorElement>
  ) => void;
};

interface BaseButtonProps extends CommonEventHandlers {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'text';
  size?: 'sm' | 'md';
  isLoading?: boolean;
  icon?: React.ReactNode;
  color?: 'default' | 'danger';
  iconColor?: 'green' | 'grey' | 'red' | 'orange' | 'blue' | 'white';
  active?: boolean;
  tooltip?: string;
  classNames?: {
    button?: string;
    inner?: string;
    content?: string;
    icon?: string;
    ellipsisText?: string;
  };
  disabled?: boolean;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
  className?: string;
}

// Props specific to when rendering a <button>
interface HtmlButtonProps
  extends BaseButtonProps,
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      keyof BaseButtonProps | 'type'
    > {
  href?: undefined;
  type?: 'button' | 'submit' | 'reset';
}

// Props specific to when rendering an <a> (via NextLink)
interface LinkButtonProps
  extends BaseButtonProps,
    Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      keyof BaseButtonProps | 'href' | 'target'
    > {
  href: string;
  target?: string;
  type?: undefined;
}

export type ButtonProps = HtmlButtonProps | LinkButtonProps;

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const {
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconColor = 'currentColor',
    iconPosition = 'left',
    isLoading = false,
    className: userClassName,
    active = false,
    tooltip,
    classNames,
    disabled = false,
    onClick,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    color = 'default',
    ...restSpecific
  } = props;

  const isLink = 'href' in restSpecific && restSpecific.href !== undefined;

  const isDisabled =
    (isLink
      ? isLoading
      : ('disabled' in restSpecific && restSpecific.disabled) || isLoading) ||
    disabled;

  const baseClasses = cn(
    styles.button,
    styles[variant],
    styles[size],
    userClassName,
    classNames?.button,
    active && styles.active,
    color === 'danger' && styles.danger,
    {
      [styles.iconOnly]: icon && !children,
      [styles.disabled]: isDisabled,
      [styles.loading]: isLoading,
    }
  );

  const contentClasses = cn(styles.content, classNames?.content, {
    [styles.contentHidden]: isLoading,
    [styles.iconLeft]: iconPosition === 'left',
    [styles.iconRight]: iconPosition === 'right',
  });

  const innerClasses = cn(styles.inner, classNames?.inner);

  const buttonInnerContent = (
    <div className={innerClasses}>
      <span className={contentClasses}>
        {children && <span className={cn(styles.ellipsisText, classNames?.ellipsisText)}>{children}</span>}
        {icon && (
          <span
            className={cn(
              styles.icon,
              styles[`color-${iconColor}`],
              classNames?.icon
            )}
          >
            {icon}
          </span>
        )}
      </span>
      {isLoading && (
        <div className={styles.loadingSpinner} aria-hidden='true'>
          <Spinner size='sm' />
        </div>
      )}
    </div>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commonTriggerProps: any = {
    className: baseClasses,
    onClick,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    ...(isDisabled && {
      'aria-disabled': true,
      tabIndex: isLink ? -1 : undefined,
    }),
  };

  let renderedButton;

  if (isLink) {
    const { href, target, ...linkRest } = restSpecific as LinkButtonProps;
    renderedButton = (
      <Link
        href={href}
        target={target}
        ref={ref as React.Ref<HTMLAnchorElement>}
        {...commonTriggerProps}
        {...linkRest}
      >
        {buttonInnerContent}
      </Link>
    );
  } else {
    const {
      type = 'button',
      href: _href,
      target: _target,
      ...buttonRest
    } = restSpecific as HtmlButtonProps & { href?: string; target?: string };
    void _href;
    void _target;

    renderedButton = (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={isDisabled}
        {...commonTriggerProps}
        {...buttonRest}
      >
        {buttonInnerContent}
      </button>
    );
  }

  if (tooltip) {
    return (
      <Tooltip.Provider delay={300}>
        <Tooltip.Root>
          <Tooltip.Trigger render={renderedButton} />
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={8} className={tooltipStyles.tooltipPositioner}>
              <Tooltip.Popup
                className={tooltipStyles.tooltipContent}
                aria-label={tooltip}
              >
                {tooltip}
                <Tooltip.Arrow className={tooltipStyles.tooltipArrow}>
                  <svg width='10' height='5' viewBox='0 0 10 5'>
                    <path d='M0 0L5 5L10 0Z' fill='var(--tooltip-background, #333)' />
                  </svg>
                </Tooltip.Arrow>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  return renderedButton;
});

Button.displayName = 'Button';
