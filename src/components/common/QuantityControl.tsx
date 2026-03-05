'use client';

import { Minus, Plus } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import Box from './Box';
import styles from './QuantityControl.module.css';

type QuantityControlProps = {
  min: number;
  max: number;
  value: number;
  onChange: (quantity: number) => void;
  className?: string;
  suffix?: string;
  size?: 'sm' | 'md';
};

const QuantityControl = ({
  min,
  max,
  value,
  onChange,
  className,
  suffix,
  size = 'sm',
}: QuantityControlProps) => {
  const [internalValue, setInternalValue] = useState(value);

  const handleChange = (quantity: number) => {
    if (quantity < min) {
      setInternalValue(min);
    } else if (quantity > max) {
      setInternalValue(max);
    } else {
      setInternalValue(quantity);
    }
  };

  const handleMinus = () => {
    handleChange(internalValue - 1);
  };

  const handlePlus = () => {
    handleChange(internalValue + 1);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  useEffect(() => {
    onChange(internalValue);
  }, [internalValue, onChange]);

  return (
    <Box
      variant="grey"
      className={classNames(styles.container, className, styles[size])}
    >
      <button
        type="button"
        className={styles.button}
        onClick={handleMinus}
        disabled={internalValue <= min}
      >
        <Minus size={16} />
      </button>

      <input
        type="number"
        className={styles.input}
        value={internalValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        onFocus={handleInputFocus}
      />
      {suffix && <span className={styles.suffix}>{suffix}</span>}
      <button
        type="button"
        className={styles.button}
        onClick={handlePlus}
        disabled={internalValue >= max}
      >
        <Plus size={16} />
      </button>
    </Box>
  );
};

export default QuantityControl;
