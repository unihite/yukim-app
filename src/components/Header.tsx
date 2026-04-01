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
      alert("현재 점사가 안전하게 기록되었습니다.");
    } catch(e) {
      alert("기록 저장 중 오류가 발생했습니다.");
    }
  };

  const handleCapture = async () => {
    const targetElement = document.getElementById("yukim-capture-area");
    if (!targetElement) {
      alert("캡처할 영역을 찾을 수 없습니다.");
      return;
    }

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
      
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const fileName = `sodam_yukim_jeomsa_${dateStr}.png`;

      // 모바일 기기에서 파일 전송(Share) 화면이 뜨는 현상 및 오류를 방지하기 위해
      // 공유 API(navigator.share)를 제거하고 무조건 브라우저 직접 다운로드 방식으로 통일합니다.
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("화면 캡쳐 중 오류가 발생했습니다:", err);
      alert("캡처 도중 오류가 발생했습니다.");
    }
  };

  return (
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
          className="bg-[#6366F1] px-2 py-1 rounded-md text-[11px] font-bold shadow-md hover:bg-[#5558E3] transition-all"
        >
          캡쳐
        </button>
      </div>

      {/* 4. 기록 모달 영역 */}
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </header>
  );
};


export default Header;
