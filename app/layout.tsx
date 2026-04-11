import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sugar Rush Spots',
  description: 'Sugar Rush Spots pilgrimage map'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

