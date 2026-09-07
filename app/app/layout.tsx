import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Sweden, in the glass — 1861–2006',
  description: 'A scrolling visual history of Sweden’s alcohol sales. Restrictions, shortages, and the slow shift from spirits to wine.',
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
