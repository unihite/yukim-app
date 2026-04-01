"use client";

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRDownloadPage() {
  const downloadUrl = "https://yukim-app.vercel.app";

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl flex flex-col items-center space-y-8 max-w-sm w-full border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            육임 앱 다운로드
          </h1>
          <p className="text-gray-500 text-sm">
            아래 QR 코드를 스캔하세요
          </p>
        </div>

        {/* QR Code Section */}
        <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-200">
          <QRCodeSVG 
            value={downloadUrl}
            size={220}
            level="H"
            includeMargin={false}
            className="w-full h-auto"
          />
        </div>

        {/* Instruction Text - The core requirement */}
        <div className="text-center mt-6 p-4 bg-sky-50 rounded-xl border border-sky-100 w-full animate-pulse shadow-sm">
          <p className="text-2xl font-black text-sky-600 tracking-wider">
            화면을 누르세요.
          </p>
        </div>
        
        {/* Footer info */}
        <p className="text-xs text-gray-400 text-center leading-relaxed mt-4">
          모바일 기기의 기본 카메라를 켜고<br />화면의 QR 코드를 비추어 주세요.
        </p>
        
      </div>
    </div>
  );
}
