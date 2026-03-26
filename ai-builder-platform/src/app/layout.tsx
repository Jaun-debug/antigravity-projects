import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aura - AI App Builder",
  description: "Premium Multi-Agent AI App Builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: '#3b82f6', colorBackground: '#0a0f16', colorText: 'white' } }}>
      <html lang="en">
        <body className={`${inter.className} min-h-screen bg-background text-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
