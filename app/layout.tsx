import './globals.css';
import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
  weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
  title: 'Aetheria — A Space for Your Thoughts',
  description: 'An interactive mental sandbox where thoughts float as glowing orbs in zero gravity.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-dark" suppressHydrationWarning>
      <body className={`${syne.variable} ${dmSans.variable} font-dm`} suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
