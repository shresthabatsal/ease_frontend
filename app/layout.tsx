import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";
import { StoreProvider } from "@/context/StoreContext";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ease",
  description: "Shopping and Drive-Through Pick-up Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastContainer position="top-right" />
        <Toaster
          position="top-right"
          richColors
          closeButton
          // toastOptions={{ duration: 4000 }}
        />
        <AuthProvider>
          <StoreProvider>
            <Header />
            {children}
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
