import type { Metadata } from 'next';
import './globals.css';
import { APP_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: `${APP_NAME} MVP`,
  description: 'NCT Pilgrimage Map MVP'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
