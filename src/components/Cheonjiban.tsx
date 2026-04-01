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
                {/* 1. 좌측 열 (세로 통합 3단 구성: 성별/나이/류신) */}
                <div className="row-span-3 flex flex-col gap-1">
                  <div 
                    className={`flex-1 ${gender === "남" ? "bg-blue-900" : "bg-pink-500"} text-white flex items-center justify-center rounded-sm border-2 border-slate-600 font-black text-[min(15px,3.5vw)] tracking-tighter shadow-sm min-h-0 cursor-pointer active:scale-95 transition-colors select-none`}
                    onClick={() => setGender(gender === "남" ? "여" : "남")}
                  >
                    {gender}
                  </div>
                  <div className="flex-1 bg-white border-2 border-slate-600 text-slate-800 flex items-center justify-center rounded-sm shadow-sm min-h-0 relative">
                    <input 
                      type="tel" 
                      maxLength={2}
                      value={age || ""}
                      onChange={(e) => {
                        const str = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
                        if (str === "") {
                          setAge(0);
                        } else {
                          const val = parseInt(str, 10);
                          if (!isNaN(val)) setAge(val);
                        }
                      }}
                      className="w-8 text-[min(17px,4vw)] tracking-tighter font-black text-center p-0 border-none outline-none leading-none bg-transparent"
                    />
                    <span className="text-[min(14px,3.2vw)] font-bold ml-0.5 whitespace-nowrap tracking-tighter">세</span>
                  </div>
                  <div 
                    className="flex-1 bg-[#6366F1] text-white flex items-center justify-center rounded-sm border-2 border-slate-600 font-black text-[min(14px,3.2vw)] tracking-tighter shadow-sm active:bg-indigo-700 min-h-0 cursor-pointer select-none transition-colors"
                    onClick={() => setIsRyushinMode(true)}
                  >
                    류신
                  </div>
                </div>
                
                {/* 2. 중앙 열 (상하 50:50 분할: 양자 버튼 / 소담 조언 버튼) */}
                <div className="row-span-3 flex flex-col gap-1.5">
                  <div 
                    className="relative flex-1 bg-gradient-to-b from-amber-400 to-orange-500 text-white flex flex-col items-center justify-center rounded-sm shadow-sm border-2 border-slate-600 min-h-0 cursor-pointer select-none overflow-hidden"
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
                    <div className="relative z-10 text-[min(18px,4.2vw)] font-black text-white leading-none mb-0.5 pointer-events-none tracking-tighter">양자</div>
                    <div className="relative z-10 text-[min(18px,4.2vw)] font-black text-white leading-none mb-0.5 pointer-events-none tracking-tighter">생성</div>
                  </div>
                  
                  {/* 소담 조언 버튼 */}
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
                     <div className="relative z-10 text-[min(18px,4.2vw)] font-black text-white leading-none mb-0.5 pointer-events-none tracking-tighter">소담</div>
                     <div className="relative z-10 text-[min(18px,4.2vw)] font-black text-white leading-none mb-0.5 pointer-events-none tracking-tighter">조언</div>
                  </div>
                </div>

                {/* 3. 우측 열 (세로 통합 3단 구성: 월건/월장/점시) */}
                <div className="row-span-3 flex flex-col gap-1">
                  <div className="flex-1 bg-white border-2 border-slate-600 rounded-md p-0.5 flex flex-col items-center justify-center shadow-sm min-h-0 overflow-hidden">
                    <span className="text-[min(14px,3.2vw)] text-gray-600 font-black uppercase leading-none tracking-tighter whitespace-nowrap">월건</span>
                    <span className="text-[min(18px,4.2vw)] font-black text-slate-900 tracking-tighter whitespace-nowrap">{manseData ? manseData.wolgunCheongan + manseData.wolgunJiji : "辛卯"}</span>
                  </div>
                  <div className="flex-1 bg-white border-2 border-slate-600 rounded-md p-0.5 flex flex-col items-center justify-center shadow-sm min-h-0 overflow-hidden">
                    <span className="text-[min(14px,3.2vw)] text-gray-600 font-black uppercase leading-none tracking-tighter whitespace-nowrap">월장</span>
                    <span className="text-[min(18px,4.2vw)] font-black text-slate-900 tracking-tighter whitespace-nowrap">{woljang}</span>
                  </div>
                  <div className="flex-1 bg-white border-2 border-slate-600 rounded-md p-0.5 flex flex-col items-center justify-center shadow-sm min-h-0 overflow-hidden">
                    <span className="text-[min(14px,3.2vw)] text-gray-600 font-black uppercase leading-none tracking-tighter whitespace-nowrap">점시</span>
                    <span className="text-[min(18px,4.2vw)] font-black text-slate-900 tracking-tighter whitespace-nowrap">{jeomsi}</span>
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
            {/* 상단 통합 콘텐츠 래퍼 (우측에 빈 공간을 주어 전체 축을 좌측으로 밀어냄) */}
            <div className="flex flex-col w-full h-full justify-start pr-2">
              <div className="w-full min-h-[4px]"></div>

              {/* 2. 둔간 (천반 바로 위) 및 천반 공망 표시 */}
              <div className="w-full flex justify-center leading-none mb-1 h-5 items-center">
                 {isCheonbanGongmang ? (
                   <span className="text-[min(20px,5vw)] font-black text-red-500 tracking-tighter animate-pulse">○</span>
                 ) : (
                   <span className="text-[min(20px,5vw)] font-black text-purple-600 tracking-tighter">{toHangul(dungan, isHangulMode)}</span>
                 )}
              </div>

              {/* 3. 중앙 레이아웃: 12운성(숨김) + 천반(좌측시프트) + 천장(우붙임) */}
              <div className="w-full flex items-center justify-between py-0 h-6">
                 {/* 12운성: 숨김 처리하여 렌더링하지 않음 */}
                 <span className="hidden">
                   {getTwelveStage(manseData?.ilganCheongan || "甲", upper)}
                 </span>
                 
                 {/* 천반 및 천장: 이전 3단 배치 구조를 유지하되 천반을 중앙에, 천장을 우측에 둠 */}
                 {/* 숨겨진 공간만큼 앞당기기 위해 w-1/3 대신 flex 구조 최적화 */}
                 <div className="flex-1 flex justify-center relative w-full items-center">
                   {/* 천반 */}
                   <span className="text-[min(20px,5vw)] font-black text-slate-900 leading-none tracking-tighter text-center">{toHangul(upper, isHangulMode)}</span>
                   
                   {/* 천장: 천반 글자 기준으로 우측에 앱솔루트로 바짝 붙임으로써 기준축 흔들림 방지 */}
                   <span className="absolute left-[50%] ml-[min(12px,3vw)] text-[min(16px,3.8vw)] font-black text-blue-700 whitespace-nowrap overflow-hidden text-ellipsis">
                     {toHangul(generalMap[upper] ? FULL_GENERALS[generalMap[upper]] : "", isHangulMode)}
                   </span>
                 </div>
              </div>
            </div>

            {/* 4. 지반 지지 (상단 그룹과 동일하게 축 이동 적용) */}
            <div className="text-[min(20px,5vw)] font-black leading-none w-full flex justify-center tracking-tighter pr-2">
               <span className={`flex items-center justify-center w-[min(28px,6.5vw)] h-[min(28px,6.5vw)] text-slate-900 ${isJibanGongmang ? "border-[2px] border-red-500 rounded-full" : ""}`}>
                 {toHangul(cell, isHangulMode)}
               </span>
            </div>






            {/* 특별 마커 (우측 하단 배치) */}
            <div className="absolute bottom-1 right-1 flex flex-col items-end gap-0.5 pointer-events-none">
              {isHaengnyeon && (
                <div className="flex items-center justify-center bg-yellow-100 text-orange-800 text-[min(10px,2.5vw)] font-black px-1 py-[2px] rounded-[4px] border border-orange-200 shadow-sm leading-none whitespace-nowrap min-h-0 tracking-tighter">
                   <span>{haengnyeonGanji}</span>
                </div>
              )}
              {cell === bonmyeongBranch && (
                <div className="flex items-center justify-center bg-yellow-100 text-orange-800 text-[min(10px,2.5vw)] font-black px-1 py-[2px] rounded-[4px] border border-orange-200 shadow-sm leading-none whitespace-nowrap min-h-0 tracking-tighter">
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
