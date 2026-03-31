"use client";

import React, { useState } from "react";
import { useDivination } from "../context/DivinationContext";

const RYUSHIN_DATA = [
  {
    id: 1,
    title: "시험정단",
    content: (
      <>
        <ul className="text-[13px] font-bold space-y-1.5 ml-1 text-slate-700">
          <li className="grid grid-cols-[55px_1fr] items-start"><span className="text-slate-500 font-extrabold">입 시:</span> <span className="font-black text-blue-700">장생 록 역마 공망</span></li>
          <li className="grid grid-cols-[55px_1fr] items-start"><span className="text-slate-500 font-extrabold">공무원:</span> <span className="font-black text-blue-700">귀인 염막귀인</span></li>
          <li className="grid grid-cols-[55px_1fr] items-start"><span className="text-slate-500 font-extrabold">자격증:</span> <span className="font-black text-blue-700">주작</span></li>
          <li className="grid grid-cols-[55px_1fr] items-start"><span className="text-slate-500 font-extrabold">진 급:</span> <span className="font-black text-blue-700">태상</span></li>
        </ul>
        <p className="text-[12px] bg-indigo-50 text-indigo-800 p-2 mt-2 rounded border border-indigo-100 font-bold leading-snug">
          일덕 천희 / 행년상에서 류신은 형충파해묘 하는 것이 있으면 길작용이 감소
        </p>
      </>
    )
  },
  {
    id: 2,
    title: "취업",
    content: (
      <>
        <p className="text-[13px] font-black text-slate-700 mb-1">
          <span className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded">록 재성</span>
        </p>
        <p className="text-[12px] text-slate-600 font-bold leading-snug">
          류신이나 길성을 방해하는 것을 형충파해묘 할 때 해소되어 취업된다.
        </p>
      </>
    )
  },
  {
    id: 3,
    title: "구재",
    content: (
      <>
        <p className="text-[13px] font-black text-blue-700 mb-1 leading-snug">
          재성 장생 록 청룡 
        </p>
        <p className="text-[12px] text-red-600 font-bold bg-red-50 p-1.5 rounded">
          / 세파 월파 파쇄 (삼파)
        </p>
      </>
    )
  },
  {
    id: 4,
    title: "양택",
    content: (
      <>
        <p className="text-[13px] font-black text-slate-700 leading-snug">
          등사 백호 병지 묘 <span className="text-red-500">/ 세파 병부 파쇄</span>
        </p>
        <div className="mt-2 text-[11px] font-bold text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
          말전이 낮시간 (卯~申까지 낮 / 酉~寅까지 밤)
        </div>
      </>
    )
  },
  {
    id: 5,
    title: "혼인 및 연애",
    content: (
      <>
        <p className="text-[13px] font-black text-blue-700 mb-2 leading-snug">
          재 관 청룡 천후 / 천희 성신
        </p>
        <div className="text-[12px] font-bold text-slate-700 bg-orange-50 p-2 rounded border border-orange-100 leading-snug space-y-1">
          <p>삼전~ 초전 남자, 중전 중매인, 말전 여자</p>
          <p className="text-orange-800">각 생합 형충파해묘 관계 확인</p>
        </div>
      </>
    )
  },
  {
    id: 6,
    title: "소송",
    content: (
      <>
        <p className="text-[13px] font-black text-slate-700 leading-snug mb-2">
          구진 주작 천후 천공 공망 묘지 辰 戌 / <span className="text-blue-600">황은 천혁</span>
        </p>
        <div className="space-y-2 text-[12px] font-bold text-slate-600 leading-snug">
          <p><span className="text-slate-800 font-black">민사</span> ~ 초전 원고, 중전 법원, 말전 피고 생합관계</p>
          <p>귀나 구진 주작이 묘,절 하는 시기나 수극하는 때 천공,공망은 중도에 끝남</p>
          <p className="text-indigo-600 bg-indigo-50 p-1.5 rounded">삼전 장생에서 묘로가면 불리, 묘에서 장생으로가면 유리 (상대에 따라 변함)</p>
        </div>
      </>
    )
  },
  {
    id: 7,
    title: "질병",
    content: (
      <>
        <p className="text-[13px] font-black text-red-600 leading-snug mb-2">
          백호 병지 병부 귀살 사지 절지 묘 / 생기 사기 사신 상문 조객 
        </p>
        <p className="text-[12px] font-bold text-slate-700 bg-red-50 border border-red-100 p-2 rounded leading-snug">
          탈하는 시기 류신이 수극 묘 절을 만날 때 / 류신이 왕상하면 휴수사로 갈 때
        </p>
      </>
    )
  },
  {
    id: 8,
    title: "태산",
    content: (
      <>
        <p className="text-[13px] font-black text-slate-700 leading-snug">
          태지 육합 자손효 백호 / <span className="text-blue-600">생기</span> <span className="text-red-500">사기</span>
        </p>
      </>
    )
  },
  {
    id: 9,
    title: "일상의 길흉 성사 여부",
    content: (
      <>
        <ul className="text-[12px] font-bold space-y-1.5 ml-1 text-slate-700 leading-snug">
          <li className="grid grid-cols-[60px_1fr] items-start"><span className="text-slate-500 font-extrabold">신(새것):</span> <span className="font-black text-slate-800">태세 월자 생기 辰</span></li>
          <li className="grid grid-cols-[60px_1fr] items-start"><span className="text-slate-500 font-extrabold">구(옛것):</span> <span className="font-black text-slate-800">병부 구진 사기 戌</span></li>
          <li className="grid grid-cols-[60px_1fr] items-start"><span className="text-blue-600 font-black">길:</span> <span className="text-blue-700">길장 길신 (장생 록 재)</span></li>
          <li className="grid grid-cols-[60px_1fr] items-start"><span className="text-red-600 font-black">흉:</span> <span><span className="text-red-600">흉장 흉신 (패지 병지 사지 묘지) 공망 발용의 상하신 관계</span>를 살펴라. (형충파해묘)</span></li>
        </ul>
      </>
    )
  }
];

const RyushinBoard = () => {
  const { setIsRyushinMode } = useDivination();
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleAccordion = (id: number) => {
    // 이미 열려있으면 닫고(null), 아니면 해당 아이디를 열어줌
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full aspect-square shadow-xl bg-[#eaeff5] border border-gray-300 mx-auto relative overflow-hidden">
      
      <div className="absolute inset-0 flex flex-col">
        {/* 1. 상단 고정 헤더 (뒤로가기 버튼) */}
        <div className="sticky top-0 z-20 w-full bg-white border-b border-gray-300 p-2 shadow-sm flex items-center justify-between">
          <div className="flex flex-col ml-1 justify-center">
            <span className="text-[16px] font-black text-[#6366F1] leading-none">류신</span>
          </div>
          <button 
            onClick={() => setIsRyushinMode(false)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white font-black text-[13px] rounded-md shadow-sm flex items-center justify-center gap-1"
          >
            <span>↩️</span> 천지반 복귀
          </button>
        </div>

        {/* 2. 스크롤 가능한 본문 내용 (아코디언 리스트) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-slate-800 pb-10 custom-scrollbar relative z-0">
          
          {RYUSHIN_DATA.map((item) => {
            const isOpen = openId === item.id;
            
            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-lg border shadow-sm transition-all duration-300 overflow-hidden cursor-pointer select-none
                  ${isOpen ? 'border-indigo-400 ring-1 ring-indigo-200 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => toggleAccordion(item.id)}
              >
                {/* 아코디언 헤더 (항상 보임) */}
                <div className="p-3 flex items-center justify-between">
                  <h3 className={`text-[15px] font-black flex items-center gap-2 transition-colors duration-200 ${isOpen ? 'text-indigo-700' : 'text-slate-700'}`}>
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[12px] transition-colors duration-200 ${isOpen ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'}`}>
                      {item.id}
                    </span> 
                    {item.title}
                  </h3>
                  
                  {/* 펼침 상태 아이콘 (+ / - 형태나 화살표) */}
                  <span className={`text-[14px] text-gray-400 font-black transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : 'rotate-0'}`}>
                    ▼
                  </span>
                </div>

                {/* 아코디언 펼침 내용 */}
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-indigo-50 bg-slate-50/50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {item.content}
                  </div>
                )}
              </div>
            )
          })}

        </div>
        
        {/* 3. 하단 스크롤 인디케이터용 그라데이션 */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#eaeff5] to-transparent pointer-events-none z-10"></div>
      
      </div>
    </div>
  );
};

export default RyushinBoard;
