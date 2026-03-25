import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Ohlthaver & List Group | Purposeing the Future',
  description: 'Namibia’s leading privately held corporation committed to creating a future, enhancing life. Explore our portfolio, news, and careers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased text-oldark bg-olbeige min-h-screen">
        {children}
      </body>
    </html>
  );
}
