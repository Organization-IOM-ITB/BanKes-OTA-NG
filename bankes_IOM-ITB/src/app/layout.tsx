import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans } from 'next/font/google';
import ClientLayout from "./components/layout/clientlayout";
import RouteLoader from "./components/RouteLoader";

// DM Sans = font kanonik IOM-ITB (lihat iom-tokens.css).
const dmSans = DM_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: "IOM",
  description: "Website for IOM-ITB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmSans.className} antialiased flex flex-col min-h-screen`} suppressHydrationWarning>
        <RouteLoader />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
