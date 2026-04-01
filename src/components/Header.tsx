/**
 * @file Header.tsx
 * @description 프리미엄 블루 그라데이션 및 글래스모피즘이 적용된 헤더
 */

"use client";

import React, { useState } from "react";
import { useDivination } from "../context/DivinationContext";
import { toPng } from "html-to-image";
import HistoryModal from "./HistoryModal";

const Header = () => {
  const { 
    isHangulMode, setIsHangulMode,
    caseName, gender, age, dateTime, yangja1, yangja2, yangja3 
  } = useDivination();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleSaveHistory = () => {
    try {
      const now = new Date();
      const savedAt = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      const newItem = {
        id: Date.now(),
        savedAt,
        caseName,
        gender,
        age,
        dateTime,
        yangja1,
        yangja2,
        yangja3
      };
      
      const loaded = localStorage.getItem("yukim_saved_history");
      const list = loaded ? JSON.parse(loaded) : [];
      list.push(newItem);
      localStorage.setItem("yukim_saved_history", JSON.stringify(list));
    } catch(e) {
      console.error("기록 저장 중 오류가 발생했습니다.", e);
    }
  };

  const handleCapture = async () => {
    const targetElement = document.getElementById("yukim-capture-area");
    if (!targetElement) {
      alert("캡처할 영역을 찾을 수 없습니다.");
      return;
    }

    setIsCapturing(true);

    try {
      const dataUrl = await toPng(targetElement, {
        pixelRatio: 2,
        backgroundColor: "#f8fafc",
        filter: (node) => {
          if (node.nodeType === 1 && (node as HTMLElement).hasAttribute('data-html2canvas-ignore')) {
            return false;
          }
          return true;
        }
      });
      
      // 모바일 파일 다운로드 오류/불편을 해결하기 위해 화면 중앙 팝업 표시 모드로 전환
      setCapturedImage(dataUrl);

    } catch (err) {
      console.error("화면 캡쳐 중 오류가 발생했습니다:", err);
      alert("캡처 도중 오류가 발생했습니다.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 w-full bg-[#1E3A8A] text-white py-1.5 px-3 flex items-center justify-between shadow-md z-50">
        {/* 1. 좌측: 기록 불러오기 및 저장 버튼 */}
        <div className="flex items-center gap-1.5" data-html2canvas-ignore="true">
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="bg-white/10 px-2 py-1 rounded-md text-[11px] font-bold shadow-sm hover:bg-white/20 transition-all text-white border border-white/10"
          >
            목록
          </button>
          <button 
            onClick={handleSaveHistory}
            className="bg-teal-600/80 px-2 py-1 rounded-md text-[11px] font-bold shadow-md hover:bg-teal-500 transition-all border border-teal-400/30 text-white"
          >
            저장
          </button>
        </div>
        
        {/* 2. 중앙: 메인 타이틀 */}
        <h1 className="text-[17px] font-black tracking-tight flex items-center gap-2">
          <span>소담 양자 육임</span>
        </h1>
        
        {/* 3. 우측: 유틸리티 버튼 그룹 (캡처 시 제외) */}
        <div data-html2canvas-ignore="true" className="flex items-center gap-1.5">
          <button 
            onClick={() => setIsHangulMode(!isHangulMode)}
            className={`px-2 py-1 rounded-md text-[11px] font-bold shadow-md transition-all ${
              isHangulMode 
                ? "bg-[#38BDF8] hover:bg-[#0EA5E9] text-white" 
                : "bg-white/20 hover:bg-white/30 text-white border border-white/20"
            }`}
          >
            한/漢
          </button>
          <button 
            onClick={handleCapture}
            disabled={isCapturing}
            className={`px-2 py-1 rounded-md text-[11px] font-bold shadow-md transition-all ${
              isCapturing ? "bg-slate-500 text-slate-300" : "bg-[#6366F1] hover:bg-[#5558E3] text-white"
            }`}
          >
            {isCapturing ? "처리중.." : "캡쳐"}
          </button>
        </div>

        {/* 4. 기록 모달 영역 */}
        <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      </header>

      {/* 5. 캡처 결과물 모달 (꾹 눌러서 저장하는 방식) */}
      {capturedImage && (
        <div className="fixed inset-0 z-[100] bg-black/85 flex flex-col items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
          <div className="w-full max-w-sm flex flex-col items-center relative gap-3">
            {/* 타이틀 및 닫기 바깥쪽 배치 (이미지 위에 둥둥 뜨게) */}
            <div className="w-full flex justify-end">
               <button 
                 onClick={() => setCapturedImage(null)}
                 className="bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-full font-bold shadow-lg backdrop-blur text-sm border border-white/30"
               >
                 ✕ 닫기
               </button>
            </div>
            
            {/* 찰칵! 캡처 이미지 본체 (스크롤 가능한 컨테이너 내부에 배치해 잘림 방지) */}
            <div className="w-full bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] overflow-hidden flex flex-col border-4 border-indigo-500/50 transform scale-100 transition-transform">
               <div className="bg-indigo-600 px-4 py-3 flex text-center justify-center animate-pulse">
                 <p className="text-white font-black text-[15px] tracking-tight">
                   👇 이미지를 <span className="text-amber-300">꾹 눌러서</span> 사진첩에 저장하세요
                 </p>
               </div>
               <div className="w-full p-2 bg-slate-100 max-h-[60vh] overflow-y-auto">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img 
                   src={capturedImage} 
                   alt="육임 점사 캡처본" 
                   className="w-full h-auto rounded shadow-sm"
                 />
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
