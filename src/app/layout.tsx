import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lingora - Học tiếng Anh thông minh",
    template: "%s | Lingora",
  },
  description: "Ứng dụng học tiếng Anh toàn diện với từ vựng, luyện thi IELTS, và trợ lý AI. Học mọi lúc, mọi nơi!",
  keywords: ["học tiếng Anh", "IELTS", "từ vựng", "English learning", "Lingora"],
  authors: [{ name: "Lingora Team" }],
  openGraph: {
    title: "Lingora - Học tiếng Anh thông minh",
    description: "Ứng dụng học tiếng Anh toàn diện với từ vựng, luyện thi IELTS, và trợ lý AI.",
    type: "website",
    locale: "vi_VN",
  },
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
        {children}
      </body>
    </html>
  );
}
