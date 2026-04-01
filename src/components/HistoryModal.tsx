"use client";

import React, { useEffect, useState } from "react";
import { useDivination } from "../context/DivinationContext";

interface SavedHistoryItem {
  id: number;
  savedAt: string;
  caseName: string;
  gender: "남" | "여";
  age: number;
  dateTime: string;
  yangja1: string;
  yangja2: string;
  yangja3: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<SavedHistoryItem[]>([]);
  const { setCaseName, setGender, setAge, setDateTime, setYangja1, setYangja2, setYangja3 } = useDivination();

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    try {
      const data = localStorage.getItem("yukim_saved_history");
      if (data) {
        setHistory(JSON.parse(data));
      }
    } catch (e) {
      console.error("히스토리 불러오기 오류", e);
    }
  };

  const handleApply = (item: SavedHistoryItem) => {
    setCaseName(item.caseName || "메모");
    setGender(item.gender || "남");
    setAge(item.age || 30);
    setDateTime(item.dateTime);
    setYangja1(item.yangja1 || "");
    setYangja2(item.yangja2 || "");
    setYangja3(item.yangja3 || "");
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("이 기록을 삭제하시겠습니까?")) return;
    
    try {
      const updated = history.filter((h) => h.id !== id);
      setHistory(updated);
      localStorage.setItem("yukim_saved_history", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-[80vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#1E3A8A] text-white">
          <h2 className="text-lg font-black tracking-tight">저장된 점사 기록</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 리스트 영역 */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="font-bold text-sm">기록된 점사가 없습니다.</p>
              <p className="text-xs mt-1">좌측 상단의 '저장' 버튼을 눌러 기록해보세요.</p>
            </div>
          ) : (
            history.sort((a,b) => b.id - a.id).map((item) => (
              <div 
                key={item.id}
                onClick={() => handleApply(item)}
                className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex items-start justify-between active:scale-[0.98]"
              >
                <div className="flex flex-col gap-1">
                  {/* 제목 (메모) */}
                  <h3 className="text-base font-black text-slate-800 break-keep group-hover:text-indigo-600 transition-colors">
                    {item.caseName && item.caseName !== "메모" ? item.caseName : "제목 없음 (메모 미입력)"}
                  </h3>
                  {/* 상세 정보 요약 */}
                  <p className="text-xs font-bold text-slate-500">
                    {item.gender} {item.age}세 · 기준시각: <span className="text-indigo-500">{item.dateTime}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">저장일시: {item.savedAt}</p>
                </div>
                
                <button 
                  onClick={(e) => handleDelete(e, item.id)}
                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                  title="삭제"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
};

export default HistoryModal;
