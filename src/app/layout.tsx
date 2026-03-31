import type { Metadata } from "next";
import "./globals.css";
import { DivinationProvider } from "../context/DivinationContext";

export const metadata: Metadata = {
  title: "소담 양자 육임 - 전문 점술 시스템",
  description: "현대적인 디자인의 고품격 육임 점사 서비스",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "소담 육임",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-[#f8fafc] text-slate-900 selection:bg-yukim-blue-light/30 min-h-screen">
        <DivinationProvider>
          <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-x-hidden border-x border-slate-200 flex flex-col">
            {children}
          </div>
        </DivinationProvider>
      </body>
    </html>
  );
}

