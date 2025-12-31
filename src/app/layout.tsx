import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SkipLink } from "@/components/accessibility";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Church Event Management System",
  description: "Streamlined event planning and approval for church communities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* WCAG 2.4.1: Skip to main content link */}
        <SkipLink />
        {/* SessionProvider will be added here when NextAuth is implemented */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
