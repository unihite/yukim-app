/**
 * @file SagwaSamjeon.tsx
 * @description 프리미엄 육임 사과삼전(四課三傳) 결과 대시보드
 */

"use client";

import React from "react";
import { useDivination } from "../context/DivinationContext";
import { getDungan, getGongmang, getTwelveStage, getMonthlyShinsals, getSeasonalShinsals, getDailyShinsals, getYearlyShinsals } from "../lib/utils/astrology";
import { toHangul } from "../lib/constants/kanji";

import ResultCell from "./ResultCell";

const SagwaSamjeon = () => {
  const { sagwa, samjeon, manseData, isHangulMode } = useDivination();

  const [gongmang1, gongmang2] = getGongmang(manseData?.ilganCheongan || "甲", manseData?.ilganJiji || "子");
  const checkGongmang = (branch: any) => branch === gongmang1 || branch === gongmang2;

  const computeShinsal = (targetBranch: any) => {
    if (!manseData || typeof targetBranch !== "string") return "";
    const s1 = getMonthlyShinsals(manseData.wolgunJiji, targetBranch);
    const s2 = getSeasonalShinsals(manseData.wolgunJiji, targetBranch);
    const s3 = getDailyShinsals(manseData.ilganJiji, targetBranch);
    const s4 = getYearlyShinsals(manseData.taeseJiji, targetBranch);
    const all = [...s1, ...s2, ...s3, ...s4];
    return all.join(" ");
  };

  return (
    <div className="w-full flex flex-col gap-0 shadow-sm border border-slate-400">
      {/* 1. 삼전 (Samjeon) */}
      <section className="bg-[#eef2f7] border-b border-slate-400">
        <div className="grid grid-cols-3 divide-x-[4px] divide-black items-stretch h-full">
          {samjeon.map((item, i) => (
            <ResultCell 
              key={i}
              stem={toHangul(getDungan(manseData?.ilganCheongan || "甲", manseData?.ilganJiji || "子", item.upper), isHangulMode)}
              shinsal={computeShinsal(item.upper)}
              general={toHangul(item.general, isHangulMode)}
              upper={toHangul(item.upper, isHangulMode)}
              lower={toHangul(item.lower, isHangulMode)}
              relation={i === 0 ? "형제" : i === 1 ? "관귀" : "부모"}
              stage={getTwelveStage(manseData?.ilganCheongan || "甲", item.upper)}
              colorStem="text-purple-600"
              isUpperGongmang={checkGongmang(item.upper)}
              isLowerGongmang={typeof item.lower === 'string' && checkGongmang(item.lower)}
            />
          ))}
        </div>
      </section>

      {/* 2. 사과 (Sagwa) */}
      <section className="bg-[#eef2f7] border-b border-slate-400">
        <div className="grid grid-cols-4 divide-x-[4px] divide-black items-stretch h-full">
          {sagwa.map((item, i) => {
            // 1과(i === 0)일 경우 지반 자리에 일간과 함께 기궁을 표시
            const lowerDisplay = i === 0 && manseData?.ilganCheongan ? (
              <div className="flex items-center w-full justify-between h-[28px]">
                <span className="w-10"></span>
                <span className="flex-1 text-[22px] font-black text-red-500 text-center tracking-tighter whitespace-nowrap leading-none">{toHangul(manseData.ilganCheongan, isHangulMode)}</span>
                <span className="w-10 flex justify-end items-center h-[28px]">
                  {checkGongmang(item.lower) ? (
                    <span className="flex items-center justify-center w-[28px] h-[28px] text-[22px] font-black leading-none tracking-tighter text-slate-900 border-[2px] border-red-500 rounded-full uppercase">
                      {toHangul(item.lower, isHangulMode)}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-[28px] h-[28px] text-[22px] font-black leading-none tracking-tighter text-gray-500 uppercase">
                      {toHangul(item.lower, isHangulMode)}
                    </span>
                  )}
                </span>
              </div>
            ) : (
              item.lower
            );

            return (
              <ResultCell 
                key={i}
                stem={toHangul(getDungan(manseData?.ilganCheongan || "甲", manseData?.ilganJiji || "子", item.upper), isHangulMode)}
                shinsal={computeShinsal(item.upper)}
                general={toHangul(item.general, isHangulMode)} // 계산된 진짜 천장 적용
                upper={toHangul(item.upper, isHangulMode)}
                lower={i === 0 ? lowerDisplay : toHangul(item.lower, isHangulMode)}
                relation={i === 0 ? "형제" : i === 1 ? "관귀" : i === 2 ? "자손" : "형제"}
                stage={getTwelveStage(manseData?.ilganCheongan || "甲", item.upper)}
                colorStem="text-purple-600"
                isUpperGongmang={checkGongmang(item.upper)}
                isLowerGongmang={i !== 0 && typeof item.lower === 'string' && checkGongmang(item.lower)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};



export default SagwaSamjeon;
