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
  const [inAppStatus, setInAppStatus] = useState<"none" | "ios" | "android">("none");

  useEffect(() => {
    // 인앱 브라우저 체크 및 탈출 로직
    const userAgent = navigator.userAgent.toLowerCase();
    const targetUrl = window.location.href;
    const isIosDevice = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const inAppAgents = ['kakaotalk', 'naver', 'daum', 'instagram', 'facebook', 'line'];
    const isInsideInApp = inAppAgents.some(agent => userAgent.includes(agent));

    if (isInsideInApp) {
      if (isIosDevice) {
        setInAppStatus("ios");
      } else {
        setInAppStatus("android");
        // 안드로이드 강제 크롬 탈출 (Intent)
        const intentUrl = `intent://${targetUrl.replace(/^https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intentUrl;
      }
    }

    // 설치 프롬프트 이벤트 가로채기 (안드로이드/데스크톱)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

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

  // 인앱 브라우저 감지 시 차단 및 가이드 오버레이 반환
  if (inAppStatus === "ios") {
    return (
      <div className="flex flex-col flex-1 w-full relative h-screen bg-slate-900 overflow-hidden items-center justify-center text-white p-6">
        <div className="absolute top-8 right-8 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12 text-indigo-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </div>
        <div className="relative z-10 w-full max-w-sm bg-indigo-900/50 border border-indigo-500/30 rounded-2xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-500">인앱 접속 제한됨</h2>
          <p className="text-sm text-indigo-200 leading-relaxed font-medium break-keep">
            이 브라우저(카카오톡/네이버 등)에서는 앱 다운로드가 지원되지 않습니다.<br/><br/>
            화면 우측 하단의 <strong className="text-white">나침반(🧭) 아이콘</strong>이나 우측 상단의 <strong className="text-white text-base">메뉴(···)</strong>를 누르신 후,<br/>
            <strong className="text-white bg-indigo-500/30 px-2 py-1 rounded inline-block mt-3 mb-1">Safari로 열기</strong><br/>
            또는 <strong className="text-white bg-indigo-500/30 px-2 py-1 rounded inline-block mt-1">다른 브라우저로 열기</strong>를<br/>
            선택하여 접속해 주세요!
          </p>
        </div>
      </div>
    );
  }

  if (inAppStatus === "android") {
    return (
      <div className="flex flex-col flex-1 w-full relative h-screen bg-slate-900 overflow-hidden items-center justify-center text-white p-6">
        <div className="relative z-10 w-full max-w-sm bg-indigo-900/50 border border-indigo-500/30 rounded-2xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="w-8 h-8 border-4 border-indigo-400 border-t-white rounded-full animate-spin"></span>
          </div>
          <h2 className="text-xl font-bold text-white">안전한 환경으로 이동 중...</h2>
          <p className="text-sm text-indigo-200 leading-relaxed font-medium break-keep">
            크롬(Chrome) 브라우저로 자동 연결됩니다.<br/>
            만약 화면이 넘어가지 않는다면 아래 버튼을 눌러주세요.
          </p>
          <button
             onClick={() => {
               const intentUrl = `intent://${window.location.href.replace(/^https?:\/\//i, '')}#Intent;scheme=https;package=com.android.chrome;end`;
               window.location.href = intentUrl;
             }}
             className="w-full mt-4 py-4 rounded-xl font-bold bg-indigo-600 border border-indigo-500 text-white shadow-lg active:scale-95 transition-all text-[15px] tracking-wide"
          >
            🚀 크롬(Chrome)으로 강제 열기
          </button>
        </div>
      </div>
    );
  }

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
