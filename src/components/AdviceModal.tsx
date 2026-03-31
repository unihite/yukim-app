/**
 * @file AdviceModal.tsx
 * @description 1~64번 랜덤 조언 결과를 보여주는 팝업 모달
 */

"use client";

import React from "react";
import { ADVICES } from "../constants/advices";

interface AdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  number: number;
}

const AdviceModal: React.FC<AdviceModalProps> = ({ isOpen, onClose, number }) => {
  if (!isOpen) return null;

  const data = ADVICES[number] || { title: "로딩 중...", content: "데이터가 없습니다." };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-yukim-purple to-indigo-600 py-4 px-8 text-center text-white">
          <h2 className="text-[28px] font-black tracking-tight">{data.title}</h2>
        </div>
        
        <div className="p-8 text-center flex flex-col items-center">
          <div className="max-h-[60vh] overflow-y-auto mb-6 w-full px-2 scrollbar-hide text-left">
            <p className="text-[17px] text-slate-700 font-bold leading-[1.8] break-keep mb-6">
              {data.content}
            </p>

            {data.items && Object.keys(data.items).length > 0 && (
              <div className="space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                {Object.entries(data.items).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row gap-1 sm:gap-3 items-start pb-2 border-b border-slate-200/50 last:border-0 last:pb-0">
                    <span className="font-bold text-indigo-700 min-w-[70px] shrink-0 text-[15px]">
                      {key}
                    </span>
                    <span className="text-slate-800 text-[15px] leading-relaxed font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[16px] hover:bg-slate-800 transition-all active:scale-95"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdviceModal;
