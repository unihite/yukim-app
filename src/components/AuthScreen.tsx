"use client";

import React, { useState, useEffect, useRef } from "react";
import { generateAuthCodeClient } from "../utils/authHash";

interface AuthScreenProps {
  onSuccess: () => void;
}

const SERVER_URL = "/api/auth/request"; // 요청 등록
const CHECK_URL  = "/api/auth/check";   // 상태 확인

const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 로컬 스토리지 진입 시 폰 번호 자동 로드
  useEffect(() => {
    const savedPhone = localStorage.getItem("yukim_phone");
    if (savedPhone) {
      setPhone(savedPhone);
    }
    return () => stopPolling();
  }, []);

  const stopPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;
  };

  const startPolling = (currentPhone: string) => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(CHECK_URL, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Bypass-Tunnel-Reminder": "true" 
          },
          body: JSON.stringify({ phone: currentPhone }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "approved" && data.code) {
            stopPolling();
            setStatus("approved");
            setCode(data.code);
            handleSaveAndVerify(currentPhone, data.code); // 자동 진입 시작
          } else if (data.status === "rejected") {
            stopPolling();
            setStatus("rejected");
            setErrorText("관리자에 의해 승인이 거절되었습니다.");
          }
        }
      } catch (err) {
        console.error("폴링 오류:", err);
      }
    }, 3000); // 3초마다 체크
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 남기고 최대 11자리 제한
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
    setPhone(val);
    
    // 번호를 수정하면 다시 최초 상태로 롤백
    if (status !== "none") {
      setStatus("none");
      setCode("");
      stopPolling();
      setErrorText("");
    }
  };

  // 승인 요청 버튼 (Server 연동)
  const handleRequest = async () => {
    if (phone.length < 10) {
      setErrorText("정확한 휴대폰 번호를 입력해주세요.");
      return;
    }
    setErrorText("");
    setIsLoading(true);

    try {
      // 1차 요청 (대기열 등록)
      const res = await fetch(SERVER_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) throw new Error("서버와의 통신에 실패했습니다.");

      const data = await res.json();
      localStorage.setItem("yukim_phone", phone); // 번호 로컬에 기억
      
      if (data.status === "pending") {
        setStatus("pending");
        startPolling(phone); // 관리자 승인 대기 폴링 시작
      } else if (data.status === "approved") {
        setStatus("approved");
        setCode(data.code);
        handleSaveAndVerify(phone, data.code); // 즉시 통과
      } else if (data.status === "rejected") {
        setStatus("rejected");
        setErrorText("이전에 거절된 번호입니다. 관리자에게 문의하세요.");
      }

    } catch (err: any) {
      console.error(err);
      setErrorText("서버 요청 실패. 호스팅 서버 실행 상태를 확인하세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 교차 검증 및 통과 (자동 실행됨)
  const handleSaveAndVerify = async (currentPhone: string, serverCode: string) => {
    try {
      // 자체 검증 해시 도출
      const expectedCode = await generateAuthCodeClient(currentPhone);
      
      if (serverCode === expectedCode) {
        localStorage.setItem("yukim_auth_token", expectedCode);
        onSuccess(); // 메인 화면(육임 앱)으로 이동
      } else {
        setErrorText("인증 코드가 변조되었습니다. (위조 검출)");
        setStatus("none");
        setCode("");
      }
    } catch (error) {
      setErrorText("모바일 검증 모듈 에러");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-300 border border-slate-200 relative">
        
        {/* 헤더 */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 py-10 px-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-md shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">관리자 결재 시스템</h1>
          <p className="text-sm font-medium opacity-80 break-keep">
            최고 관리자의 직접 확인 및 승인이 있어야만 앱 사용이 허가됩니다.
          </p>
        </div>

        {/* 바디 폼 */}
        <div className="px-8 py-8 space-y-6">
          <div className="space-y-4">
            
            {/* 휴대폰 번호 (Phone Field) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                사용자 식별 번호 (Phone)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={11}
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={status === "pending" || status === "approved"}
                  placeholder="예: 01012345678"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-[18px] font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono tracking-wider text-center disabled:opacity-50"
                />
              </div>
            </div>

            {/* 상태 창 영역 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                결재 진행 상태 (Status)
              </label>
              <div className={`w-full border-2 rounded-xl px-4 py-4 text-center transition-all flex flex-col items-center justify-center ${
                  status === "none" ? "bg-slate-100 border-slate-200" :
                  status === "pending" ? "bg-yellow-50 border-yellow-300" :
                  status === "rejected" ? "bg-red-50 border-red-200" :
                  "bg-indigo-50 border-indigo-300 relative overflow-hidden"
              }`}>
                
                {status === "none" && (
                  <p className="font-bold text-slate-400 text-sm tracking-wide">요청 전</p>
                )}
                
                {status === "pending" && (
                  <div className="flex flex-col items-center gap-2">
                    <span className="w-6 h-6 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></span>
                    <p className="font-black text-yellow-600 text-[15px] animate-pulse">관리자 승인 대기 중...</p>
                    <p className="text-xs text-yellow-700/70 font-bold">화면을 유지해주세요</p>
                  </div>
                )}
                
                {status === "approved" && (
                  <div className="animate-in slide-in-from-bottom-2 duration-500">
                    <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none animate-pulse"></div>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-1">수신된 보안 패스코드</p>
                    <p className="font-black text-indigo-700 text-3xl tracking-[0.2em] font-mono drop-shadow-sm">{code}</p>
                    <p className="text-xs text-indigo-600 font-bold mt-2">승인 완료! 보안 교차 검증 중...</p>
                  </div>
                )}

                {status === "rejected" && (
                  <p className="font-black text-red-500 text-[15px]">접근 거부됨</p>
                )}
              </div>
            </div>
            
            {/* 에러 메시지 표출 */}
            {errorText && (
              <p className="text-red-500 text-sm font-bold text-center animate-pulse pt-2 px-2 break-keep">
                {errorText}
              </p>
            )}
          </div>

          <div className="pt-2">
            {/* 요청 전용 버튼 */}
            {status === "none" && (
              <button
                onClick={handleRequest}
                disabled={phone.length < 10 || isLoading}
                className="w-full py-4 bg-slate-900 border border-slate-900 text-white rounded-2xl font-black text-lg shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.23)] transition-all active:scale-95 flex justify-center items-center disabled:opacity-50"
              >
                {isLoading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : "입장 승인 요청하기"}
              </button>
            )}

             {/* 다른 상태에서는 버튼 숨김 (자동 통과 및 에러뷰이므로) */}
             {(status === "rejected" || errorText !== "") && status !== "pending" && (
               <button
                 onClick={() => { setStatus("none"); setErrorText(""); }}
                 className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
               >
                 다시 시도하기
               </button>
             )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AuthScreen;
