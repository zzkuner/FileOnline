import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

import { getConfig } from "@/lib/config";

export async function generateMetadata() {
  const siteName = await getConfig('SITE_NAME', 'InsightLink');
  const siteSlogan = await getConfig('SITE_SLOGAN', '让本地文件拥有"在线生命"');
  const siteDescription = await getConfig('SITE_DESCRIPTION', '简单拖拽，本地文件秒变在线直链。实时追踪访客行为，让每一次分享都心中有数。');

  return {
    title: `${siteName} - ${siteSlogan}`,
    description: siteDescription,
  };
}

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
