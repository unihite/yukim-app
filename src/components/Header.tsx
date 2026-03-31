/**
 * @file Header.tsx
 * @description 프리미엄 블루 그라데이션 및 글래스모피즘이 적용된 헤더
 */

"use client";

import React from "react";
import { useDivination } from "../context/DivinationContext";
import { toPng } from "html-to-image";

const Header = () => {
  const { isHangulMode, setIsHangulMode } = useDivination();
  const handleCapture = async () => {
    const targetElement = document.getElementById("yukim-capture-area");
    if (!targetElement) {
      alert("캡처할 영역을 찾을 수 없습니다.");
      return;
    }

    try {
      // 최신의 CSS 기술(Tailwind v4) 완벽 호환 캡처 브러리 적용
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

      // Web Share API를 지원하는 모바일 기기 (갤러리에 직접 저장 가능)
      if (navigator.share && navigator.canShare) {
        // dataURL을 Blob -> File 객체로 변환
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: "image/png" });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "소담 양자육임",
            text: "점사 결과 확인",
          });
          return; // 공유/저장 성공 시 종료
        }
      }

      // 데스크톱 환경이나 Web Share 미지원 기기용 Fallback (일반 다운로드)
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();

    } catch (err) {
      console.error("화면 캡쳐 중 오류가 발생했습니다:", err);
      alert("캡처 도중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="sticky top-0 w-full bg-[#1E3A8A] text-white py-1.5 px-3 flex items-center justify-between shadow-md z-50">
      {/* 1. 좌측: 균형 맞추기용 빈 공간 (타이틀 중앙 정렬) */}
      <div className="w-12"></div>
      
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
          저장
        </button>
      </div>
    </header>
  );
};


export default Header;
