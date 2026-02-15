import cn from 'classnames';
import styles from './Spinner.module.css';

type SpinnerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export default function Spinner({
  size = 'md',
  className,
  ...props
}: SpinnerProps) {
  return (
    <div className={cn(styles.spinner, styles[size], className)} {...props} />
  );
}
