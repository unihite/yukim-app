/**
 * @file InputPanel.tsx
 * @description 프리미엄 글래스 스타일 점술 정보 입력 창
 */

"use client";

import React from "react";
import { useDivination } from "../context/DivinationContext";

const InputPanel = () => {
  const { caseName, setCaseName, dateTime, setDateTime } = useDivination();

  // "YYYY/MM/DD HH:mm" -> "YYYY-MM-DDTHH:mm" 변환
  const formatForInput = (dt: string) => {
    return dt.replace(/\//g, "-").replace(" ", "T");
  };

  // "YYYY-MM-DDTHH:mm" -> "YYYY/MM/DD HH:mm" 변환
  const formatFromInput = (dt: string) => {
    return dt.replace(/-/g, "/").replace("T", " ");
  };

  return (
    <div className="w-full bg-[#FEFCE8] border-b border-[#EAB308]/20 flex items-center px-3 py-1.5 shadow-sm justify-between">
      {/* 1. 메모 입력 필드 (좌측) */}
      <div className="flex-1 flex items-center px-1">
        <input 
          type="text"
          placeholder="메모"
          value={caseName === "메모" ? "" : caseName}
          onChange={(e) => {
            const val = e.target.value;
            setCaseName(val === "" ? "메모" : val);
          }}
          className="w-full bg-transparent border-none outline-none focus:ring-0 px-0 py-0 text-[min(16px,4vw)] font-black text-slate-800 tracking-tight placeholder:font-bold placeholder:text-slate-500"
        />
      </div>

      {/* 2. 기준 시간 표시 및 변경 (우측 1줄) */}
      <div className="flex items-center ml-2 border-l border-[#EAB308]/30 pl-2">
        <input
          type="datetime-local"
          value={formatForInput(dateTime)}
          onChange={(e) => {
            if (e.target.value) {
              setDateTime(formatFromInput(e.target.value));
            }
          }}
          className="bg-transparent border-none outline-none text-[min(13px,3.3vw)] font-bold text-slate-600 focus:ring-0 p-0 text-right cursor-pointer"
        />
      </div>
    </div>
  );
};





export default InputPanel;
