import type { Metadata } from "next";
import "./globals.css";
import { Manrope } from 'next/font/google';
import ClientLayout from "./components/layout/clientlayout";
import RouteLoader from "./components/RouteLoader";

const manrope = Manrope({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: "IOM",
  description: "Website for IOM-ITB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${manrope.className} antialiased flex flex-col min-h-screen`} suppressHydrationWarning>
        <RouteLoader />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
