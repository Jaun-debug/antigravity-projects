import type { Metadata, Viewport } from "next";
import { Open_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

const openSans = Open_Sans({
    subsets: ["latin"],
    variable: "--font-open-sans"
});

const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair-display",
    weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
    title: "Accountant.AI | Portable Ledger",
    description: "Intelligent document management and ledger system for accountants.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Accountant.AI",
    },
};

export const viewport: Viewport = {
    themeColor: "#059669",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={cn(openSans.variable, playfairDisplay.variable)}>
            <body className="bg-neutral-50 min-h-screen font-sans font-light">
                <Sidebar />
                <main className="lg:pl-64 min-h-screen pt-20 lg:pt-0">
                    <div className="p-4 md:p-8 max-w-[1600px] mx-auto page-transition">
                        {children}
                    </div>
                </main>
            </body>
        </html>
    );
}
