import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import { LocaleProvider } from "@/components/locale-provider";
import { AuthProvider } from "@/lib/auth";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shopping Home",
  description: "Personal price tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <AuthProvider>
          <LocaleProvider>
            <Nav />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
              {children}
            </main>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
