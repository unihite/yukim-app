/**
 * @file InputPanel.tsx
 * @description 프리미엄 글래스 스타일 점술 정보 입력 창
 */

"use client";

import React from "react";
import { useDivination } from "../context/DivinationContext";

const InputPanel = () => {
  const { caseName, setCaseName, gender, age } = useDivination();

  return (
    <div className="w-full bg-[#FEFCE8] border-b border-[#EAB308]/20 flex items-center px-3 py-1.5 shadow-sm">
      <div className="flex items-center w-full px-1">
        {/* 1. 사례 정보 입력 필드 */}
        <div className="flex-1 flex items-center">
          <input 
            type="text"
            placeholder="메모"
            value={caseName === "메모" ? "" : caseName}
            onChange={(e) => {
              const val = e.target.value;
              setCaseName(val === "" ? "메모" : val);
            }}
            className="w-full bg-transparent border-none outline-none focus:ring-0 px-0 py-0 text-[16px] font-black text-slate-800 tracking-tight placeholder:font-bold placeholder:text-slate-500"
          />
        </div>
      </div>
    </div>
  );
};





export default InputPanel;
