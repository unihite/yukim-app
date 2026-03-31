/**
 * @file page.tsx
 * @description 프리미엄 육임 애플리케이션 메인 페이지
 */

"use client";

import Header from "../components/Header";
import InputPanel from "../components/InputPanel";
import SagwaSamjeon from "../components/SagwaSamjeon";
import ActionButtons from "../components/ActionButtons";
import Cheonjiban from "../components/Cheonjiban";
import RyushinBoard from "../components/RyushinBoard";
import { useDivination } from "../context/DivinationContext";
import SplashScreen from "../components/SplashScreen";
import AuthScreen from "../components/AuthScreen";
import LandingPage from "../components/LandingPage";
import { useState, useCallback, useEffect } from "react";

export default function Home() {
  const { isRyushinMode } = useDivination();
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null);
  
  // 최초 구동 시 인증 여부 및 PWA 스탠드얼론 여부 체크
  useEffect(() => {
    // 개발 편의를 위해 임시로 보안 인증 및 PWA 모드 검사 우회 (모두 강제 승인)
    setIsAuthenticated(true);
    setIsStandalone(true);
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // 랜딩, 인증 전 (상태 확인 중)
  if (isAuthenticated === null || isStandalone === null) {
    return <div className="flex-1 w-full bg-slate-900 flex items-center justify-center h-screen">
      <span className="w-8 h-8 border-4 border-indigo-400 border-t-white rounded-full animate-spin"></span>
    </div>;
  }

  // ⭐️ 핵심: 인터넷 브라우저로 들어온 경우 (스토어 역할 랜딩 페이지)
  if (!isStandalone) {
    return <LandingPage />;
  }

  // 인증 화면 표출
  if (isAuthenticated === false) {
    return <AuthScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  // 인증 완료 후 메인 앱 실행
  return (
    <div className="flex flex-col flex-1 w-full relative h-full">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      
      {!showSplash && (
        <main id="yukim-capture-area" className="flex flex-col flex-1 w-full relative animate-fade-in bg-[#f8fafc]">
          {/* 1. 프리미엄 헤더 */}
          <Header />
          
          {/* 2. 콘텐츠 영역 (좌우 여백 최소화) */}
          <div className="flex-1 px-0.5 py-2 space-y-0">
            {/* 점술 정보 입력 */}
            <InputPanel />
            
            {/* 사과삼전 레이아웃 */}
            <SagwaSamjeon />
            
            {/* NEW: 양자수 액션 버튼 */}
            <ActionButtons />
            
            {/* 류신 모드 스위칭: 천지반 또는 류신 표 출력 */}
            <section className="w-full pt-2 min-h-[380px]">
              {isRyushinMode ? <RyushinBoard /> : <Cheonjiban />}
            </section>
          </div>

          {/* 3. 하단 푸터 (고급스러운 여백) */}
          <footer className="w-full py-8 text-center border-t border-slate-100 bg-slate-50/50">
            <p className="text-[9px] text-slate-400 font-bold tracking-[0.3em]">
              © 2026 소담 양자 육임
            </p>
          </footer>
        </main>
      )}
    </div>
  );
}
