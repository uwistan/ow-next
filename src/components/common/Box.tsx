import cn from 'classnames';
import { MotionProps } from 'framer-motion';
import Link from 'next/link';

import styles from './Box.module.css';

type BoxProps = React.PropsWithChildren &
  MotionProps & {
    variant?: 'purple' | 'default' | 'grey' | 'white';
    className?: string;
    as?: React.ElementType;
    noPadding?: boolean;
    href?: string;
  };

const Box = ({
  children,
  className,
  variant = 'default',
  as = 'div',
  noPadding = false,
  href,
  ...props
}: BoxProps) => {
  const Component = href ? Link : as;

  return (
    <Component
      href={href ?? undefined}
      className={cn(styles.box, styles[variant], className, {
        [styles.noPadding]: noPadding,
      })}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Box;
