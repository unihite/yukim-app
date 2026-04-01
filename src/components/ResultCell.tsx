/**
 * @file ResultCell.tsx
 * @description 고밀도 육임 정보 셀 (천간, 지지, 천장, 육친, 12운성 등 포함)
 */

"use client";

import React from "react";

interface ResultCellProps {
  stem?: string;     // 천간 (Purple/Red)
  general?: string;  // 천장 (Blue)
  upper: React.ReactNode;     // 천반 지지 (Black large)
  lower: React.ReactNode;     // 지반 지지 (Black large)
  relation?: React.ReactNode; // 육친 (Gray small)
  stage?: React.ReactNode;    // 12운성 (Gray small)
  shinsal?: string;  // 신살 (Orange small)
  colorStem?: string;
  isMain?: boolean;
  isUpperGongmang?: boolean;
  isLowerGongmang?: boolean;
}

const ResultCell: React.FC<ResultCellProps> = ({
  stem, general, upper, lower, relation, stage, shinsal, colorStem = "text-purple-600", isMain = false, isUpperGongmang = false, isLowerGongmang = false
}) => {
  return (
    <div className={`relative flex flex-col items-center p-1 border-gray-200 min-w-0 flex-1 min-h-[110px] ${isMain ? "bg-white" : ""}`}>
      {/* 1. 최상단: 신살 (우측 상단에 바짝 붙임, 타이트한 텍스트/배경) */}
      <div className="absolute top-[2px] right-[2px] flex flex-wrap justify-end content-start gap-[1px] w-[95%] z-10 pointer-events-none">
        {shinsal ? shinsal.split(" ").filter(Boolean).map((s, idx) => (
          <span 
            key={idx} 
            className="text-[min(8.5px,2vw)] font-black text-orange-700 bg-orange-100 border border-orange-200 px-[2px] py-0 rounded-[2px] leading-tight shadow-sm whitespace-nowrap tracking-tighter"
          >
            {s}
          </span>
        )) : null}
      </div>

      {/* 2. 둔간 (천반 바로 위, 22px, absolute 겹침을 방지하기 위해 상단 마진부여) */}
      <div className="w-full min-h-[22px] flex justify-center items-end leading-none mt-[16px] mb-1">
        {isUpperGongmang ? (
          <span className="text-[min(22px,5.5vw)] font-black text-red-500 tracking-tighter animate-pulse">○</span>
        ) : (
          <span className={`text-[min(22px,5.5vw)] font-black ${colorStem} tracking-tighter`}>{stem}</span>
        )}
      </div>

      {/* 3. 중앙: 천반/지반 지지 + 12운성(좌) + 천장(우) */}
      <div className="flex flex-col items-center space-y-1 w-full px-1">
        <div className="flex items-center w-full justify-center">
          <span className="text-[min(16px,4vw)] font-black text-slate-600 w-1/3 text-right uppercase leading-none tracking-tighter pr-0.5 whitespace-nowrap">{stage}</span>
          <span className="text-[min(22px,5.5vw)] font-black text-slate-900 leading-none tracking-tighter w-1/3 text-center">{upper}</span>
          <span className="text-[min(22px,5.5vw)] font-black text-blue-700 w-1/3 text-left pl-0.5 uppercase leading-none">{general?.charAt(0)}</span>
        </div>
        <div className="w-full pt-1 flex justify-center items-center min-h-[28px]">
          {isLowerGongmang ? (
             <span className="flex items-center justify-center w-[min(28px,6.5vw)] h-[min(28px,6.5vw)] text-[min(22px,5.5vw)] font-black leading-none tracking-tighter text-slate-900 border-[2px] border-red-500 rounded-full">
               {lower}
             </span>
          ) : (
             <span className="text-[min(22px,5.5vw)] font-black text-slate-900 leading-none tracking-tighter w-full text-center flex justify-center items-center h-[26px]">{lower}</span>
          )}
        </div>
      </div>







    </div>
  );
};


export default ResultCell;
