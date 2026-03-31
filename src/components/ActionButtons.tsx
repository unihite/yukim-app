/**
 * @file ActionButtons.tsx
 * @description 프리미엄 양자수 1, 2, 3 선택 버튼 그룹
 */

"use client";

import React from "react";
import { useDivination } from "../context/DivinationContext";

const ActionButtons = () => {
  const { 
    yangja1, setYangja1, 
    yangja2, setYangja2, 
    yangja3, setYangja3 
  } = useDivination();

  const handleInputChange = (val: string, setter: (v: string) => void) => {
    // 숫자만 허용하고 4자리로 제한
    const numericValue = val.replace(/[^0-9]/g, "").slice(0, 4);
    setter(numericValue);
  };

  return (
    <div className="w-full grid grid-cols-3 gap-3 px-3 py-1.5 bg-[#F8FAFC] border-b border-gray-300">
      {[
        { label: "양자수 1", val: yangja1, set: setYangja1 },
        { label: "양자수 2", val: yangja2, set: setYangja2 },
        { label: "양자수 3", val: yangja3, set: setYangja3 },
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col">
          <input
            type="text"
            inputMode="numeric"
            value={item.val}
            onChange={(e) => handleInputChange(e.target.value, item.set)}
            className="w-full bg-white border-2 border-slate-600 rounded-md px-2 py-1.5 text-center text-[18px] font-black text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all shadow-sm placeholder:text-slate-400"
            placeholder={item.label}
          />
        </div>
      ))}
    </div>


  );
};


export default ActionButtons;
