"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface SplashScreenProps {
  onComplete: () => void;
}

type SplashStep = "start" | "loading" | "fading_out";

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [step, setStep] = useState<SplashStep>("start");

  useEffect(() => {
    // 1단계(시작 로고 3번) -> 2.5초 후 2단계(로딩)를 건너뛰고 바로 3단계(완전 페이드아웃) 진행
    const startTimer = setTimeout(() => {
      setStep("fading_out");
    }, 2500);

    // 2단계(로딩 진행) - 사용 중지 (코드 보존)
    // const fadeOutTimer = setTimeout(() => {
    //   setStep("fading_out");
    // }, 5000); // 2500 + 2500

    // 완전히 컴포넌트 마운트 해제 (메인 화면 전환)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3300); // 2500(startTimer) + 800(페이드아웃 애니메이션 시간)

    return () => {
      clearTimeout(startTimer);
      // clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-[#040B16] transition-opacity duration-700 ease-in-out ${step === "fading_out" ? "opacity-0" : "opacity-100"}`}
    >
      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes customFadeInUp {
          from { opacity: 0; transform: translateY(20px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes customFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes customLoadingBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(56, 189, 248, 0.2); }
          50% { box-shadow: 0 0 60px rgba(56, 189, 248, 0.5); }
        }
      `}</style>

      {/* 배경 빛 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-80 blur-3xl animate-pulse"></div>

      <div className="relative z-10 grid place-items-center w-full max-w-sm px-6">
        
        {/* 1단계: 앱 시작 대문 (로고 3번 미니멀 네온) */}
        <div 
          className={`col-start-1 row-start-1 flex flex-col items-center w-full transition-all duration-1000 ease-in-out ${step === "start" ? "opacity-100 transform scale-100" : "opacity-0 transform scale-110 pointer-events-none"}`}
        >
          {/* 빛나는 아우라를 가진 로고 3번 컨테이너 */}
          <div className="w-52 h-52 mb-8 relative rounded-[3rem] overflow-hidden border border-white/10 backdrop-blur-md" 
               style={{ animation: 'floatLogo 3s ease-in-out infinite, pulseGlow 4s ease-in-out infinite' }}>
            <Image 
              src="/logo_start_3.png" 
              alt="앱 시작 대문 로고" 
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="flex flex-col items-center gap-2" style={{ animation: 'customFadeInUp 1s ease-out 0.2s both' }}>
            <h1 className="text-[32px] font-black text-white tracking-[0.15em] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              소담양자육임
            </h1>
            <p className="text-[12px] font-bold text-sky-300/80 tracking-[0.4em] uppercase">
              Quantum Divination
            </p>
          </div>
        </div>

        {/* 2단계: 앱 로딩 화면 (사용 안 함 - 코드는 살려둠) */}
        <div 
          className={`col-start-1 row-start-1 flex flex-col items-center w-full transition-all duration-1000 ease-in-out delay-300 ${step === "loading" ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-10 pointer-events-none"}`}
        >
          <div className="w-40 h-40 mb-10 relative rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.3)] border border-yellow-500/30 backdrop-blur-md" 
               style={{ animation: 'floatLogo 5s ease-in-out infinite' }}>
            <Image 
              src="/logo_loading_4.png" 
              alt="앱 로딩 동기화 로고" 
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-col items-center w-full gap-4">
            <span className="text-[14px] font-bold text-yellow-500/80 tracking-widest animate-pulse">
              양자 데이터 동기화 중...
            </span>
            {/* 로딩 바 */}
            <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner relative">
              {/* step이 loading으로 넘어갔을 때만 animation이 트리거 되도록 분기 처리 */}
              {step !== "start" && (
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-yellow-500 rounded-full" 
                  style={{ animation: 'customLoadingBar 2.5s ease-in-out forwards' }}
                ></div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
