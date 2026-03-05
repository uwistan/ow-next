import cn from 'classnames';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ppMori } from '@/fonts/fonts';
import './globals.css';
import styles from './layout.module.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Open Wonder',
    default: 'Open Wonder',
  },
  description: 'Open Wonder — New Interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, ppMori.variable)}>
        <main className={styles.main}>{children}</main>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
