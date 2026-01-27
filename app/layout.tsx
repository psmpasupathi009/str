import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/componets/ui/navbar";
import Footer from "@/componets/ui/footer";
import ScrollToTop from "@/componets/ui/scroll-to-top";
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            {children}
            <Footer />
            <ScrollToTop />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
