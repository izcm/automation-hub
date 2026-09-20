import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";
import { ClientToaster } from "./ClientToaster";

import { Sidebar } from "@/features/core/ui/Sidebar";
import { GlobalShortcuts } from "@/features/core/ui/GlobalShortcuts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hubben",
  description: "Built by SWH.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark" // todo: add light theme once it looks presentable
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-dvh overflow-hidden flex bg-ground bg-ground-gradient">
        <Providers>
          <>
            <GlobalShortcuts />
            <Sidebar />
            <main
              id="main-content"
              tabIndex={-1}
              className="h-dvh overflow-auto flex-1 focus:outline-none"
            >
              {children}
            </main>
          </>
          <ClientToaster />
        </Providers>
      </body>
    </html>
  );
}
