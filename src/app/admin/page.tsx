"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

export default function AdminDashboard() {
  const [pwd, setPwd] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [errorText, setErrorText] = useState("");
  const [items, setItems] = useState<any[]>([]);
  // 필터 탭 상태 상태
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchList = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/admin/list", {
        headers: { "x-admin-password": token },
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("yukim_admin_pwd");
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const savedPwd = localStorage.getItem("yukim_admin_pwd");
    if (savedPwd) {
      verifyToken(savedPwd);
    } else {
      setIsAuthenticated(false);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pwd: token }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("yukim_admin_pwd", token);
        setErrorText("");
        
        fetchList(token);
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(() => fetchList(token), 3000);
      } else {
        localStorage.removeItem("yukim_admin_pwd");
        setIsAuthenticated(false);
        setErrorText("비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      setErrorText("서버와 연결할 수 없습니다.");
    }
  };

  const handleAction = async (phone: string, action: "approve" | "reject" | "delete") => {
    if (action === "approve" && !window.confirm(`${phone} 번호를 승인하시겠습니까?`)) return;
    if (action === "reject" && !window.confirm(`${phone} 번호를 거절하시겠습니까?`)) return;
    if (action === "delete" && !window.confirm(`이 리스트를 완전히 삭제하시겠습니까?\n이 데이터베이스 서버에서 영구적으로 삭제됩니다.`)) return;

    const token = localStorage.getItem("yukim_admin_pwd");
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/${action}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-password": token
        },
        body: JSON.stringify({ phone }),
      });
      
      if (res.ok) {
        fetchList(token);
      } else {
        alert("세션 에러 혹은 처리 실패");
      }
    } catch (err) {
      alert("액션 처리 중 오류 발생");
    }
  };

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 flex-col"><span className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></span></div>;
  }

  if (isAuthenticated === false) {
    return (
      <div className="bg-slate-100 min-h-screen text-slate-800 font-sans flex items-center justify-center p-4">
        <div className="bg-white max-w-sm w-full rounded-[32px] p-8 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 text-white">
              <span className="text-3xl">🛡️</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">클라우드 관리자 모드</h1>
            <p className="text-sm text-slate-500 mt-2">안전한 승인 권한자만 입장할 수 있습니다.</p>
          </div>
          
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="관리자 비밀번호" 
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyToken(pwd)}
              className="w-full text-center px-4 py-4 border-2 border-slate-200 rounded-xl text-lg tracking-widest font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
            />
            <button 
              onClick={() => verifyToken(pwd)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-xl shadow-md transition-all active:scale-95"
            >
              입장하기
            </button>
            {errorText && <p className="text-red-500 text-sm font-bold text-center animate-pulse">{errorText}</p>}
          </div>
        </div>
      </div>
    );
  }

  // 선별된 아이템 리스트 추출
  const filteredItems = items.filter(item => {
    if (filterTab === "all") return true;
    return item.status === filterTab;
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans mx-auto max-w-md pb-24 relative shadow-2xl overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-900 px-6 py-6 text-white rounded-b-3xl shadow-lg sticky top-0 z-40 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[100%] h-[150%] bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">명단 통제 센터</h1>
            <p className="text-indigo-200/80 text-[11px] font-bold mt-1 tracking-widest uppercase flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Yukim Cloud DB Dashboard
            </p>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem("yukim_admin_pwd");
              setIsAuthenticated(false);
              if (pollRef.current) clearInterval(pollRef.current);
            }}
            className="text-xs font-bold bg-white/10 border border-white/20 px-3 py-1.5 rounded-full hover:bg-white/20 active:scale-95 transition backdrop-blur-md"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="px-5 py-6">
        
        {/* 필터 탭 (새로 추가됨) */}
        <div className="flex space-x-2 bg-slate-200/50 p-1.5 rounded-2xl mb-6 sticky top-[90px] z-30 backdrop-blur-md">
          <button 
            onClick={() => setFilterTab("all")} 
            className={`flex-1 py-2 text-[11px] font-black rounded-xl transition uppercase tracking-widest ${filterTab === "all" ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:bg-slate-200"}`}
          >
            전체보기 ({items.length})
          </button>
          <button 
            onClick={() => setFilterTab("pending")} 
            className={`flex-1 py-2 text-[11px] font-black rounded-xl transition uppercase tracking-widest ${filterTab === "pending" ? "bg-white shadow-sm text-yellow-600" : "text-slate-500 hover:bg-slate-200"}`}
          >
            대기 ({items.filter(i => i.status === "pending").length})
          </button>
          <button 
            onClick={() => setFilterTab("approved")} 
            className={`flex-1 py-2 text-[11px] font-black rounded-xl transition uppercase tracking-widest ${filterTab === "approved" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:bg-slate-200"}`}
          >
            접속 완료
          </button>
        </div>

        <div className="space-y-4">
          {filteredItems.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
             <span className="text-4xl opacity-50 block mb-3">📭</span>
             <p className="text-slate-400 font-bold text-sm tracking-wide">해당되는 기록이 없습니다</p>
           </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isPending = item.status === "pending";
              const isApproved = item.status === "approved";
              const isRejected = item.status === "rejected";

              return (
                <div key={item.phone || idx} className={`p-5 rounded-3xl border transition-all animate-in slide-in-from-bottom-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                  isPending ? "bg-white border-yellow-200" : 
                  isApproved ? "bg-emerald-50/30 border-emerald-100" :
                  "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`text-2xl font-black tracking-tighter letter-spacing-tight ${isRejected ? 'text-slate-400 line-through decoration-rose-500/30' : 'text-slate-800'}`}>
                      {item.phone?.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}
                    </h3>
                    {isPending && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-inner">승인 대기</span>}
                    {isApproved && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-inner">접속승인완료</span>}
                    {isRejected && <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-inner">거절/차단됨</span>}
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 font-mono mb-4">
                    {new Date(item.timestamp).toLocaleString()} 접속
                  </p>

                  {/* 승인 대기 카드 액션 */}
                  {isPending && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleAction(item.phone, "approve")}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black py-3 rounded-xl shadow-lg shadow-indigo-500/30 transition active:scale-95 text-[13px] tracking-wide"
                      >
                        ✅ 승인 발급 (입장 허락)
                      </button>
                      <button 
                        onClick={() => handleAction(item.phone, "reject")}
                        className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-xl transition active:scale-95 text-[13px]"
                      >
                        거절
                      </button>
                    </div>
                  )}

                  {/* 승인 완료 정보 및 삭제 버튼 */}
                  {isApproved && (
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="bg-white border border-emerald-100 rounded-xl p-3 flex justify-between items-center shadow-sm">
                        <div>
                          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block mb-0.5">발급된 고유 보안 암호</span>
                          <span className="font-black text-emerald-700 tracking-widest text-xl font-mono">{item.code || '******'}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAction(item.phone, "delete")} 
                        className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl font-bold text-xs transition border border-rose-100/50"
                      >
                        <span className="text-sm">🗑️</span> DB 완전 삭제 (권한 박탈)
                      </button>
                    </div>
                  )}

                  {/* 거절된 항목 삭제 버튼 */}
                  {isRejected && (
                    <button 
                      onClick={() => handleAction(item.phone, "delete")} 
                      className="w-full mt-3 py-2.5 bg-slate-200 text-slate-500 hover:bg-slate-300 rounded-xl font-bold text-xs transition border border-slate-300 flex items-center justify-center gap-1"
                    >
                      <span className="opacity-70">🧹</span> 찌꺼기 명단에서 깨끗이 비우기
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
