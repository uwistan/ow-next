import cn from 'classnames';
import styles from './Avatar.module.css';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn(styles.avatar, styles[size], className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name || 'Avatar'} className={styles.image} />
      ) : (
        <span className={styles.initials}>{name ? getInitials(name) : '?'}</span>
      )}
    </div>
  );
}
