import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import ScrollToTop from "@/components/shared/scroll-to-top";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STN GOLDEN HEALTHY FOODS",
  description: "Premium Quality Natural & Healthy Food Products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-green-50">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-green-50`}
      >
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 bg-green-50">
              {children}
            </main>
            <Footer />
            <ScrollToTop />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
