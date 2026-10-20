import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./portfolio.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "개발자 포트폴리오 | 문제를 이해하고 해결하는 개발자",
  description:
    "Node.js, Next.js, Nginx, Unreal Engine을 활용한 개발 경험과 프로젝트, 문제 해결 방식과 작업 강점을 소개하는 개발자 포트폴리오입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <a
          href="/private"
          className="portfolio-passkey fixed bottom-5 right-5 z-50 border border-[#ECE8E0] bg-[#172033] px-4 py-3 text-xs font-bold tracking-[0.12em] text-[#ECE8E0] shadow-lg focus:outline-none focus:ring-2 focus:ring-[#263B5E] focus:ring-offset-2"
        >
          PRIVATE · PASSKEY
        </a>
      </body>
    </html>
  );
}
