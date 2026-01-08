import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Background from "@/components/landing/Background";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kirata - The Operating System for Modern Commerce",
  description: "Seamlessly manage inventory, credit, and analytics with the power of AI. The smartest way to run your shop.",
  icons: {
    icon: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Background />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
