'use client';

import { Combobox } from '@base-ui/react/combobox';
import {
  CaretDown as CaretDownIcon,
  Check as CheckIcon,
  MagnifyingGlass as MagnifyingGlassIcon,
} from '@phosphor-icons/react';
import cn from 'classnames';
import React from 'react';
import { Button } from '@/components/common/Button';
import styles from './Select.module.css';

type Option = {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  imageUrl?: string;
};

type ItemValue = {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  imageUrl?: string;
};

type GroupedItemValue = {
  value: string;
  items: ItemValue[];
};

type SelectProps = {
  id: string;
  label?: string;
  error?: string | null;
  placeholder?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Prefix shown on trigger before selected label (e.g. "Product · ") */
  triggerPrefix?: string;
};

export default function CustomSelect({
  id,
  label,
  error,
  placeholder = 'Select an option',
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  required = false,
  className,
  size = 'md',
  searchable = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found',
  triggerPrefix,
}: SelectProps) {
  const formGroupClasses = cn(styles.formGroup, className);

  const groupedOptions = options.reduce<Record<string, Option[]>>(
    (acc, opt) => {
      const group = opt.group || '';
      if (!acc[group]) acc[group] = [];
      acc[group].push(opt);
      return acc;
    },
    {}
  );

  const hasGroups = options.some((o) => o.group);

  const flatItems: ItemValue[] = options.map((opt) => ({
    value: opt.value,
    label: opt.label,
    disabled: opt.disabled,
    icon: opt.icon,
    imageUrl: opt.imageUrl,
  }));

  const groupedItems: GroupedItemValue[] | undefined = hasGroups
    ? Object.entries(groupedOptions).map(([groupLabel, groupOpts]) => ({
        value: groupLabel,
        items: groupOpts.map((opt) => ({
          value: opt.value,
          label: opt.label,
          disabled: opt.disabled,
          icon: opt.icon,
          imageUrl: opt.imageUrl,
        })),
      }))
    : undefined;

  const items = searchable ? flatItems : (groupedItems || flatItems);

  const isControlled = value !== undefined;

  const currentItemValue = isControlled
    ? (flatItems.find((item) => item.value === value) ?? null)
    : undefined;

  const defaultItemValue = defaultValue
    ? flatItems.find((item) => item.value === defaultValue)
    : undefined;

  const selectedOption = isControlled
    ? flatItems.find((item) => item.value === value)
    : undefined;

  const filterFunction = searchable
    ? (itemValue: ItemValue, query: string) => {
        const searchQuery = query.toLowerCase().trim();
        if (!searchQuery) return true;
        const itemLabel = itemValue.label.toLowerCase();
        return itemLabel.includes(searchQuery);
      }
    : null;

  return (
    <div className={formGroupClasses}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <Combobox.Root<ItemValue>
        items={items as ItemValue[] | GroupedItemValue[]}
        value={currentItemValue}
        defaultValue={defaultItemValue}
        onValueChange={(newValue) => {
          if (newValue !== null && onValueChange) {
            onValueChange(newValue.value);
          }
        }}
        disabled={disabled}
        required={required}
        filter={filterFunction}
      >
        <Combobox.Trigger
          render={(props) => {
            const { color: _color, ...buttonProps } = props;
            const displayValue =
              triggerPrefix && selectedOption
                ? `${triggerPrefix}${selectedOption.label}`
                : undefined;
            return (
              <Button
                {...(buttonProps as React.ComponentProps<typeof Button>)}
                id={id}
                variant="secondary"
                icon={selectedOption?.icon && !selectedOption?.imageUrl && (() => {
                  const Icon = selectedOption.icon!;
                  return <Icon width={16} height={16} />;
                })()}
                size={size === 'lg' ? 'md' : size}
                disabled={disabled}
                className={cn(
                  styles.triggerButton,
                  size === 'lg' && styles.triggerButtonLg
                )}
                classNames={{
                  inner: styles.triggerButtonInner,
                  content: styles.triggerButtonContent,
                  ellipsisText: styles.triggerButtonEllipsisText,
                }}
              >
                {displayValue !== undefined ? (
                  displayValue
                ) : (
                  <Combobox.Value placeholder={placeholder} />
                )}
                <span className={styles.chevron}>
                  <CaretDownIcon size={16} />
                </span>
              </Button>
            );
          }}
        />

        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4} className={styles.positioner}>
            <Combobox.Popup className={styles.popup}>
              {searchable && (
                <div className={styles.searchInputWrapper}>
                  <MagnifyingGlassIcon
                    size={16}
                    className={styles.searchIcon}
                  />
                  <Combobox.Input
                    placeholder={searchPlaceholder}
                    className={styles.searchInput}
                  />
                </div>
              )}

              <Combobox.Empty className={styles.emptyState}>
                {emptyMessage}
              </Combobox.Empty>

              <Combobox.List className={styles.list}>
                {hasGroups && !searchable
                  ? (groupedItems || []).map((group) => (
                      <Combobox.Group
                        key={group.value}
                        items={group.items}
                        className={styles.group}
                      >
                        {group.value && (
                          <Combobox.GroupLabel className={styles.groupLabel}>
                            {group.value}
                          </Combobox.GroupLabel>
                        )}
                        <Combobox.Collection>
                          {(item: ItemValue) => (
                            <ComboboxItem
                              key={item.value}
                              value={item}
                              disabled={item.disabled}
                              icon={item.icon}
                              imageUrl={item.imageUrl}
                            >
                              {item.label}
                            </ComboboxItem>
                          )}
                        </Combobox.Collection>
                      </Combobox.Group>
                    ))
                  : (item: ItemValue) => (
                      <ComboboxItem
                        key={item.value}
                        value={item}
                        disabled={item.disabled}
                        icon={item.icon}
                        imageUrl={item.imageUrl}
                      >
                        {item.label}
                      </ComboboxItem>
                    )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
}

type ComboboxItemProps = {
  children: React.ReactNode;
  value: ItemValue;
  disabled?: boolean;
  className?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  imageUrl?: string;
};

const ComboboxItem = React.forwardRef<
  HTMLDivElement,
  ComboboxItemProps & { className?: string }
>(
  (
    { children, value, disabled, className, icon: Icon, imageUrl, ...props },
    forwardedRef
  ) => {
    const leadingContent = imageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className={styles.itemImage} />
    ) : Icon ? (
      <Icon width={16} height={16} />
    ) : null;

    return (
      <Combobox.Item
        className={cn(styles.item, className)}
        value={value}
        disabled={disabled}
        ref={forwardedRef}
        {...props}
      >
        <div className={styles.itemContent}>
          <Button
            variant="text"
            size="md"
            disabled={disabled}
            className={styles.itemButton}
            classNames={{
              inner: styles.itemButtonInner,
              content: styles.itemButtonContent,
              ellipsisText: styles.itemButtonEllipsisText,
            }}
            icon={leadingContent}
          >
            {children}
          </Button>
        </div>
        <Combobox.ItemIndicator className={styles.itemIndicator}>
          <CheckIcon size={16} />
        </Combobox.ItemIndicator>
      </Combobox.Item>
    );
  }
);

ComboboxItem.displayName = 'ComboboxItem';
