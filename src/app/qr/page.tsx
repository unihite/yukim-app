"use client";

import React from "react";

export default function QRCodePage() {
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://yukim-app-rt2q.vercel.app";

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* 상단 럭셔리 헤더 */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <p className="text-indigo-200 text-sm font-bold tracking-[0.3em] uppercase mb-2 relative z-10">Premium Divination</p>
          <h1 className="text-3xl font-black text-white tracking-tight relative z-10">소담 양자 육임</h1>
        </div>

        {/* QR 코드 영역 */}
        <div className="p-10 flex flex-col items-center">
          <div className="w-64 h-64 p-4 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-2 border-slate-50 mb-8 relative">
            {/* 장식용 코너 모서리 */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl translate-x-1 -translate-y-1"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl -translate-x-1 translate-y-1"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-xl translate-x-1 translate-y-1"></div>

            <img 
              src={qrUrl} 
              alt="육임 앱 QR코드" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <p className="text-slate-500 font-bold text-center text-[15px] break-keep leading-relaxed">
            스마트폰 카메라를 켜고<br/>
            위 QR코드를 스캔하시면<br/>
            <strong className="text-indigo-600">곧바로 앱으로 접속</strong>됩니다.
          </p>
        </div>

        {/* 하단 푸터 */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400 font-mono tracking-widest">
            yukim-app-rt2q.vercel.app
          </p>
        </div>

      </div>
    </div>
  );
}
