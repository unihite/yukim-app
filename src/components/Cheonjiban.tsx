/**
 * @file Cheonjiban.tsx
 * @description 프리미엄 4x4 격자 천지반 및 중앙 대시보드 UI (전체 화면 확대 버전)
 */

"use client";

import React, { useState, useRef } from "react";
import { useDivination } from "../context/DivinationContext";
import { BRANCHES, CELL_TAGS, toHangul } from "../lib/constants/kanji";
import { calculateHaengnyeon, getTwelveStage, getMonthlyShinsals, getSeasonalShinsals, getDailyShinsals, getYearlyShinsals, getGongmang, getDungan } from "../lib/utils/astrology";
import AdviceModal from "./AdviceModal";

const Cheonjiban = () => {
  const { 
    cheonjiban, gender, setGender, age, setAge, dateTime, yangja1, woljang, jeomsi, manseData, bonmyeongBranch,
    setYangja1, setYangja2, setYangja3, setIsRyushinMode, generalMap, isHangulMode
  } = useDivination();
  const [isAdviceOpen, setIsAdviceOpen] = useState(false);
  const [adviceNumber, setAdviceNumber] = useState(1);
  const [isYangjaPressing, setIsYangjaPressing] = useState(false);
  const [isAdvicePressing, setIsAdvicePressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 천지반 전용 두 글자 천장 맵핑 상수
  const FULL_GENERALS: Record<string, string> = {
    "貴": "貴人", "蛇": "騰蛇", "朱": "朱雀", "合": "六合",
    "勾": "勾陳", "青": "靑龍", "空": "天空", "白": "白虎",
    "常": "太常", "玄": "玄武", "陰": "太陰", "后": "天后"
  };
  const yangjaTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startYangjaLongPress = () => {
    setIsYangjaPressing(true);
    yangjaTimerRef.current = setTimeout(() => {
      setYangja1(String(Math.floor(Math.random() * 9999) + 1));
      setYangja2(String(Math.floor(Math.random() * 9999) + 1));
      setYangja3(String(Math.floor(Math.random() * 9999) + 1));
      setIsYangjaPressing(false); // 완료 후 초기화
    }, 1000);
  };

  const cancelYangjaLongPress = () => {
    setIsYangjaPressing(false);
    if (yangjaTimerRef.current) clearTimeout(yangjaTimerRef.current);
  };

  // 4x4 그리드 배치를 위한 순서 맵 (시계 방향 외곽 배치)
  const gridMap = [
    "巳", "午", "未", "申",
    "辰", "CENTER", "CENTER", "酉",
    "卯", "CENTER", "CENTER", "戌",
    "寅", "丑", "子", "亥"
  ];

  const haengnyeonGanji = calculateHaengnyeon(age || 1, gender, true);
  const haengnyeonBranch = haengnyeonGanji.charAt(1);

  const startLongPress = () => {
    setIsAdvicePressing(true);
    timerRef.current = setTimeout(() => {
      const randomNum = Math.floor(Math.random() * 64) + 1;
      setAdviceNumber(randomNum);
      setIsAdviceOpen(true);
      setIsAdvicePressing(false);
    }, 1000); // 1초간 누르면 발동
  };

  const cancelLongPress = () => {
    setIsAdvicePressing(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div className="w-full aspect-square grid grid-cols-4 grid-rows-4 bg-[#eaeff5] shadow-2xl rounded-sm overflow-hidden border border-gray-400">
      {gridMap.map((cell, idx) => {
        // 중앙 대시보드 영역 (2x2 공간)
        if (cell === "CENTER") {
          if (idx === 5) {
            return (
              <div key="center" className="col-span-2 row-span-2 bg-[#F8FAFC] grid grid-cols-3 grid-rows-3 gap-1.5 p-1.5 border border-slate-400">
                {/* 1. 좌측 열 (세로 통합 4단 구성: 양자/나이/성별/신살) */}
                <div className="row-span-3 flex flex-col gap-1">
                  <div 
                    className="relative flex-1 bg-orange-300 text-slate-800 flex flex-col items-center justify-center rounded-sm shadow-sm border-2 border-slate-600 min-h-0 cursor-pointer select-none overflow-hidden"
                    onMouseDown={startYangjaLongPress}
                    onMouseUp={cancelYangjaLongPress}
                    onMouseLeave={cancelYangjaLongPress}
                    onTouchStart={startYangjaLongPress}
                    onTouchEnd={cancelYangjaLongPress}
                  >
                    {/* 게이지 바 애니메이션 */}
                    <div 
                      className={`absolute left-0 right-0 bottom-0 bg-white/40 transition-all ease-linear ${isYangjaPressing ? "h-full duration-1000" : "h-0 duration-[50ms]"}`}
                    />
                    <div className="relative z-10 text-[14px] font-bold opacity-80 uppercase leading-none mb-0.5 pointer-events-none">양자</div>
                    <div className="relative z-10 text-[14px] font-black leading-tight pointer-events-none">1초</div>
                  </div>
                  <div 
                    className={`flex-1 ${gender === "남" ? "bg-blue-900" : "bg-pink-500"} text-white flex items-center justify-center rounded-sm border-2 border-slate-600 font-black text-[15px] shadow-sm min-h-0 cursor-pointer active:scale-95 transition-colors select-none`}
                    onClick={() => setGender(gender === "남" ? "여" : "남")}
                  >
                    {gender}
                  </div>
                  <div className="flex-1 bg-white border-2 border-slate-600 text-slate-800 flex items-center justify-center rounded-sm shadow-sm min-h-0 relative">
                    <input 
                      type="tel" 
                      value={age || ""}
                      onChange={(e) => {
                        const str = e.target.value.replace(/[^0-9]/g, "");
                        if (str === "") {
                          setAge(0);
                        } else {
                          const val = parseInt(str, 10);
                          if (!isNaN(val)) setAge(val);
                        }
                      }}
                      className="w-8 text-[17px] font-black text-center p-0 border-none outline-none leading-none bg-transparent"
                    />
                    <span className="text-[14px] font-bold ml-0.5 whitespace-nowrap">세</span>
                  </div>
                  <div 
                    className="flex-1 bg-[#6366F1] text-white flex items-center justify-center rounded-sm border-2 border-slate-600 font-black text-[14px] shadow-sm active:bg-indigo-700 min-h-0 cursor-pointer select-none transition-colors"
                    onClick={() => setIsRyushinMode(true)}
                  >
                    류신
                  </div>
                </div>
                
                {/* 2. 중앙 열 (상하 50:50 분할: 소담 조언 / 현재 시간) */}
                <div className="row-span-3 flex flex-col gap-1.5">
                  {/* 기존 1초 누름 랜덤 발동 UI (조언 내용 수정을 위해 임시 비활성화해제) */}
                  <div 
                    className="relative flex-1 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-md flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all select-none shadow-lg border-2 border-slate-600 overflow-hidden"
                    onMouseDown={startLongPress}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onTouchStart={startLongPress}
                    onTouchEnd={cancelLongPress}
                  >
                     <div 
                       className={`absolute left-0 right-0 bottom-0 bg-white/30 transition-all ease-linear ${isAdvicePressing ? "h-full duration-1000" : "h-0 duration-[50ms]"}`}
                     />
                     <div className="relative z-10 text-[18px] font-black text-white leading-none mb-0.5 pointer-events-none">소담</div>
                     <div className="relative z-10 text-[18px] font-black text-white leading-none mb-0.5 pointer-events-none">조언</div>
                     <div className="relative z-10 text-[18px] font-black text-white leading-none mb-0.5 pointer-events-none">1초</div>
                  </div>
                  {(() => {
                    const [dateStr, timeStr] = dateTime.split(" ");
                    const [y, m, d] = dateStr ? dateStr.split("/") : ["2026", "01", "01"];
                    return (
                      <div className="flex-1 border-2 border-slate-600 rounded-md flex flex-col items-center justify-center bg-white overflow-hidden shadow-sm gap-0.5 pt-0.5 pb-0.5">
                         <div className="text-[14px] font-black text-slate-700 leading-none">{y}</div>
                         <div className="text-[14px] font-black text-slate-700 leading-none">{m}/{d}</div>
                         <div className="text-[16px] font-black text-blue-900 tracking-tight leading-none mt-0.5">{timeStr}</div>
                      </div>
                    );
                  })()}
                </div>

                {/* 3. 우측 열 (세로 통합 4단 구성: 태세/월건/월장/점시) */}
                <div className="row-span-3 flex flex-col gap-1">
                  <div className="flex-1 bg-white border-2 border-slate-600 rounded-md p-1 flex flex-col items-center justify-center shadow-sm min-h-0">
                    <span className="text-[14px] text-gray-600 font-black uppercase leading-none">태세</span>
                    <span className="text-[18px] font-black text-slate-900">{manseData ? manseData.taeseCheongan + manseData.taeseJiji : "丙午"}</span>
                  </div>
                  <div className="flex-1 bg-white border-2 border-slate-600 rounded-md p-1 flex flex-col items-center justify-center shadow-sm min-h-0">
                    <span className="text-[14px] text-gray-600 font-black uppercase leading-none">월건</span>
                    <span className="text-[18px] font-black text-slate-900">{manseData ? manseData.wolgunCheongan + manseData.wolgunJiji : "辛卯"}</span>
                  </div>
                  <div className="flex-1 bg-white border-2 border-slate-600 rounded-md p-1 flex flex-col items-center justify-center shadow-sm min-h-0">
                    <span className="text-[14px] text-gray-600 font-black uppercase leading-none">월장</span>
                    <span className="text-[18px] font-black text-slate-900">{woljang}</span>
                  </div>
                  <div className="flex-1 bg-white border-2 border-slate-600 rounded-md p-1 flex flex-col items-center justify-center shadow-sm min-h-0">
                    <span className="text-[14px] text-gray-600 font-black uppercase leading-none">점시</span>
                    <span className="text-[18px] font-black text-slate-900">{jeomsi}</span>
                  </div>
                </div>
              </div>






            );
          }
          return null;
        }

        // 일반 12궁 셀 영역
        const upper = cheonjiban[cell];
        // 동적 둔간 계산 (일간, 일지, 천반 지지 기준)
        const dungan = getDungan(manseData?.ilganCheongan || "甲", manseData?.ilganJiji || "子", upper);
        const tags = CELL_TAGS[cell] || { top: "", left: "", right: "" };
        const isHaengnyeon = cell === haengnyeonBranch;
        
        // 공망 산출 (일간, 일지 기준 순중공망)
        const [gongmang1, gongmang2] = getGongmang(manseData?.ilganCheongan || "甲", manseData?.ilganJiji || "子");
        const isJibanGongmang = cell === gongmang1 || cell === gongmang2;
        const isCheonbanGongmang = upper === gongmang1 || upper === gongmang2;

        return (
          <div key={cell} className="relative flex flex-col justify-between p-1 border border-slate-400 bg-[#eaeff5] min-h-0 overflow-hidden h-full">
            {/* 상단 통합 레이아웃 (신살 + 둔간 + 천반) */}
            <div className="flex flex-col w-full h-full justify-start">
              {/* 1. 신살(제거됨): 공간 최적화를 위해 천지반 셀에서는 렌더링하지 않음 */}
              <div className="w-full min-h-[4px]"></div>

              {/* 2. 둔간 (천반 바로 위) 및 천반 공망 표시 */}
              <div className="w-full flex justify-center leading-none mb-1 h-5 items-center">
                 {isCheonbanGongmang ? (
                   <span className="text-[22px] font-black text-red-500 tracking-tighter animate-pulse">○</span>
                 ) : (
                   <span className="text-[22px] font-black text-purple-600 tracking-tighter">{toHangul(dungan, isHangulMode)}</span>
                 )}
              </div>

              {/* 3. 중앙 레이아웃: 12운성(좌) + 천반(중) + 천장(우) */}
              <div className="w-full flex items-center justify-between py-0 h-6">
                 {/* 12운성: 동적 계산 (일간 기반), 선생님 기준 천반 글자(upper) 대입 */}
                 <span className="text-[14px] font-black text-slate-600 w-1/3 text-right uppercase leading-none tracking-tighter pr-1">
                   {getTwelveStage(manseData?.ilganCheongan || "甲", upper)}
                 </span>
                 {/* 천반: 정중앙 고정 */}
                 <span className="text-[22px] font-black text-slate-900 w-1/3 text-center leading-none tracking-tighter">{toHangul(upper, isHangulMode)}</span>
                 {/* 천장: generalMap에서 뽑은 1글자를 천지반 전용 2글자 맵으로 변환하여 출력 */}
                 <span className="text-[16px] font-black text-blue-700 w-1/3 text-left leading-none tracking-tighter whitespace-nowrap overflow-visible">
                   {toHangul(generalMap[upper] ? FULL_GENERALS[generalMap[upper]] : "", isHangulMode)}
                 </span>
              </div>
            </div>

            {/* 4. 지반 지지 (위 그룹 바로 아래에 표시하여 여백 최소화 + 지반 공망 시 원형 테두리) */}
            <div className="text-[22px] font-black leading-none w-full flex justify-center tracking-tighter">
               <span className={`flex items-center justify-center w-[28px] h-[28px] text-slate-900 ${isJibanGongmang ? "border-[2px] border-red-500 rounded-full" : ""}`}>
                 {toHangul(cell, isHangulMode)}
               </span>
            </div>






            {/* 특별 마커 (좌측 하단 배치) */}
            <div className="absolute bottom-1 left-1 flex flex-col items-start gap-0.5 pointer-events-none">
              {isHaengnyeon && (
                <div className="flex items-center justify-center bg-yellow-100 text-orange-800 text-[10px] font-black px-1.5 py-[3px] rounded-[4px] border border-orange-200 shadow-sm leading-none whitespace-nowrap h-[18px]">
                   <span>{haengnyeonGanji}</span>
                </div>
              )}
              {cell === bonmyeongBranch && (
                <div className="flex items-center justify-center bg-yellow-100 text-orange-800 text-[10px] font-black px-1.5 py-[3px] rounded-[4px] border border-orange-200 shadow-sm leading-none whitespace-nowrap h-[18px]">
                   <span>本命</span>
                </div>
              )}
            </div>
          </div>

        );
      })}

      <AdviceModal 
        isOpen={isAdviceOpen} 
        onClose={() => setIsAdviceOpen(false)} 
        number={adviceNumber} 
      />
    </div>
  );
};

export default Cheonjiban;
