import React, { useState, useEffect } from "react";

/**
 * PWA 설치 지연 이벤트 타입
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 설치 프롬프트 이벤트 가로채기 (안드로이드/데스크톱)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // iOS 기기 판별 로직
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // 설치 버튼 클릭 핸들러
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("이미 앱이 설치되어 있거나, 설치 프롬프트를 지원하지 않는 브라우저입니다.");
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full relative h-screen bg-slate-900 overflow-hidden items-center justify-center text-white p-6">
      {/* 백그라운드 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[150%] h-[50%] bg-indigo-600/20 blur-[100px] rounded-[100%]" />
        <div className="absolute bottom-[-10%] -right-1/4 w-[100%] h-[50%] bg-purple-600/20 blur-[120px] rounded-[100%]" />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm space-y-10 animate-fade-in-up">
        {/* 상단 로고 및 타이틀 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-2xl flex items-center justify-center">
            <span className="text-4xl">☯️</span>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">소담 양자 육임</h1>
            <p className="text-indigo-200 text-sm font-medium tracking-wide">프리미엄 점술 시스템 공식 다운로드</p>
          </div>
        </div>

        {/* 안내 카드 */}
        <div className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <p className="text-slate-300 text-sm text-center font-medium leading-relaxed">
            보안 및 최적화를 위해 본 서비스는<br/>
            <strong className="text-white font-bold">전용 앱(App) 환경에서만</strong> 접속이 가능합니다.<br/>
            아래 설치 버튼을 눌러 바로 바탕화면에 추가하세요.
          </p>
        </div>

        {/* 설치 액션 컨트롤 */}
        <div className="w-full flex flex-col space-y-4 items-center">
          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="w-full py-4 rounded-xl font-bold tracking-widest text-[15px] shadow-lg shadow-indigo-600/40 border border-indigo-400/30 transition-all duration-300 transform active:scale-95 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            >
              앱 전용 다운로드 (무료 설치)
            </button>
          ) : isIOS ? (
            <div className="w-full bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 flex flex-col items-center space-y-3">
              <span className="text-2xl">📤</span>
              <p className="text-[13px] text-slate-300 text-center leading-relaxed">
                아이폰(iOS) 접속자이신가요?<br />
                화면 하단의 <strong>공유하기</strong> 버튼을 누른 후<br/>
                <strong className="text-white border-b border-indigo-400">[홈 화면에 추가]</strong>를 선택해 주세요.
              </p>
            </div>
          ) : (
            <div className="w-full bg-slate-800/80 rounded-xl p-5 border border-slate-700/50 flex flex-col items-center space-y-2 text-center">
              <p className="text-[13px] text-slate-400">
                브라우저 메뉴(⋮)에서<br/>
                <strong>'홈 화면에 추가'</strong> 혹은 <strong>'앱 설치'</strong>를 눌러주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
