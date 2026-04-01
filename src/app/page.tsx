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
    // 1. PWA 스탠드얼론 체크 (스마트폰 홈 화면에 추가된 앱으로 실행되었는지 검사)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone) === true;
    
    // 개발 모드(로컬 테스트)일 때는 브라우저에서도 보이도록 임시 허용하고, 실제 배포 시에는 PWA로만 작동하게 함
    setIsStandalone(isPWA || process.env.NODE_ENV === "development");

    // 2. 인증 토큰 검사 (실제 관리자 승인 여부 체크)
    const token = localStorage.getItem("yukim_auth_token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      // 실제 서비스 배포 시 보안을 위해 인증 토큰이 없으면 관리자 승인 화면으로 보냄
      setIsAuthenticated(false); 
    }
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
        <div className="flex flex-col flex-1 w-full relative h-full">
          {/* 1. 프리미엄 헤더 (항상 상단 고정, 메모/캡처 영역과 완전 분리) */}
          <div className="fixed top-0 left-0 right-0 z-[70] w-full shadow-lg">
            <Header />
          </div>

          <main className="flex flex-col flex-1 w-full relative animate-fade-in bg-[#f8fafc] pt-[44px]">
            {/* 2. 콘텐츠 영역 (좌우 여백 최소화, 실제 캡처 대상) */}
            <div id="yukim-capture-area" className="flex-1 px-0.5 pt-3 pb-2 space-y-0 bg-[#f8fafc]">
              {/* 점술 정보 입력 (메모칸) */}
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

          {/* 3. 하단 푸터 (불필요한 선 및 여백 최소화) */}
          <footer className="w-full pt-1 pb-3 text-center bg-[#f8fafc]">
            <p className="text-[11px] text-slate-400 font-black tracking-[0.2em]">
              © 2026 소담 양자 육임
            </p>
          </footer>
        </main>
        </div>
      )}
    </div>
  );
}
