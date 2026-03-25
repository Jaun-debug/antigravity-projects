import type { Metadata } from 'next';
import { Playfair_Display, Open_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: 'Desert Tracks | Availability Dashboard',
  description: 'Premium internal availability dashboard for Desert Tracks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${playfair.variable} bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
