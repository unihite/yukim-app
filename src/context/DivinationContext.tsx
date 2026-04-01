/**
 * @file DivinationContext.tsx
 * @description 육임 점술 데이터 및 사용자 설정을 관리하는 전역 컨텍스트
 *              lunar-javascript 기반 정밀 만세력 연동
 */

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import {
  calculateCheonjiban, calculateSagwa, calculateSamjeon,
  getManseData, getJeomsiFromYangja, getChojeonCheonbanFromYangja,
  getGeneralFromYangja3, buildGeneralsMap, getBonmyeongBranch, Lesson, ManseData
} from "../lib/utils/astrology";

interface DivinationContextType {
  caseName: string;
  setCaseName: (val: string) => void;
  gender: "남" | "여";
  setGender: (val: "남" | "여") => void;
  age: number;
  setAge: (val: number) => void;
  isBirthdayPassed: boolean;
  setIsBirthdayPassed: (val: boolean) => void;
  dateTime: string;
  setDateTime: (val: string) => void;
  yangja1: string;
  setYangja1: (val: string) => void;
  yangja2: string;
  setYangja2: (val: string) => void;
  yangja3: string;
  setYangja3: (val: string) => void;
  cheonjiban: Record<string, string>;
  sagwa: Lesson[];
  samjeon: Lesson[];
  woljang: string;
  jeomsi: string;
  manseData: ManseData | null;
  bonmyeongBranch: string; // 본명(本命) 지지
  isRyushinMode: boolean;
  setIsRyushinMode: (val: boolean) => void;
  isHangulMode: boolean;
  setIsHangulMode: (val: boolean) => void;
  generalMap: Record<string, string>;
  calculate: () => void;
}

const DivinationContext = createContext<DivinationContextType | undefined>(undefined);

// 현재 시각을 "YYYY/MM/DD HH:mm" 형식으로 반환
const getNowString = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
};

export const DivinationProvider = ({ children }: { children: ReactNode }) => {
  const [caseName, setCaseName] = useState("메모");
  const [gender, setGender] = useState<"남" | "여">("남");
  const [age, setAge] = useState(1);
  const [isBirthdayPassed, setIsBirthdayPassed] = useState(true);
  const [dateTime, setDateTime] = useState(getNowString);
  const [yangja1, setYangja1] = useState("");
  const [yangja2, setYangja2] = useState("");
  const [yangja3, setYangja3] = useState("");

  const [cheonjiban, setCheonjiban] = useState<Record<string, string>>({});
  const [sagwa, setSagwa] = useState<Lesson[]>([]);
  const [samjeon, setSamjeon] = useState<Lesson[]>([]);
  const [woljang, setWoljang] = useState("戌");
  const [jeomsi, setJeomsi] = useState("午");
  const [manseData, setManseData] = useState<ManseData | null>(null);
  const [bonmyeongBranch, setBonmyeongBranch] = useState("午");
  const [isRyushinMode, setIsRyushinMode] = useState<boolean>(false);
  const [isHangulMode, setIsHangulMode] = useState<boolean>(false);
  const [generalMap, setGeneralMap] = useState<Record<string, string>>({});

  const calculate = () => {
    const cleanDateTime = dateTime.replace(/\//g, "-");
    const date = new Date(cleanDateTime);
    if (isNaN(date.getTime())) return;

    // 1. lunar-javascript 기반 만세력 전체 산출
    const manse = getManseData(date);
    setManseData(manse);

    // 2. 점시: 양자수 1번 입력이 있으면 우선 적용, 없으면 시간 기반
    const jeomsiVal = getJeomsiFromYangja(yangja1) ?? manse.jeomsi;

    setWoljang(manse.woljang);
    setJeomsi(jeomsiVal);

    // 3. 천지반 계산
    const newCheon = calculateCheonjiban(manse.woljang, jeomsiVal);
    setCheonjiban(newCheon);

    // 4. 사과 계산
    const newSagwa = calculateSagwa(manse.ilganCheongan, manse.ilganJiji, newCheon);

    // 5. 양자수 2번 오버라이드
    const chojeonUpperOverride = getChojeonCheonbanFromYangja(yangja2) ?? undefined;

    // 7. 양자수 3번 오버라이드 (calculateSamjeon 내에서 천장 접지 처리에 활용)
    const chojeonGeneralOverride = getGeneralFromYangja3(yangja3) ?? undefined;

    // 6. 삼전 계산 (복음과 포함, 초전지반/중전/말전 포함, 천장 자동 접지)
    const newSamjeon = calculateSamjeon(
      newSagwa,
      manse.woljang,
      jeomsiVal,
      newCheon,
      chojeonUpperOverride,
      manse.ilganCheongan,  // 복음과 판별용 일간
      manse.ilganJiji,       // 복음과 판별용 일지
      chojeonGeneralOverride
    );

    // 7. 양자수 3번 및 삼전 역행 로직을 통과한 12천장 순환 맵 생성
    // 삼전의 방향성을 판단하기 위해 초전(1전)과 중전(2전)의 천반을 넘깁니다.
    const gMap = buildGeneralsMap(newSamjeon[0]?.upper || "子", newSamjeon[1]?.upper || "丑", yangja3);
    setGeneralMap(gMap);

    // 사과/삼전 천장 프로퍼티 업데이트 (맵 룩업)
    const updatedSagwa = newSagwa.map((s) => ({ ...s, general: gMap[s.upper] || "貴" }));
    const updatedSamjeon = newSamjeon.map((s) => ({ ...s, general: gMap[s.upper] || "貴" }));

    setSagwa(updatedSagwa);
    setSamjeon(updatedSamjeon);

    // 8. 본명(本命) 지지 계산 (올해 태세와 나이 기준)
    const newBonmyeong = getBonmyeongBranch(manse.taeseJiji, age || 1);
    setBonmyeongBranch(newBonmyeong);
  };

  useEffect(() => {
    calculate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateTime, gender, age, yangja1, yangja2, yangja3]);

  return (
    <DivinationContext.Provider
      value={{
        caseName, setCaseName, gender, setGender, age, setAge,
        isBirthdayPassed, setIsBirthdayPassed,
        dateTime, setDateTime,
        yangja1, setYangja1, yangja2, setYangja2, yangja3, setYangja3,
        cheonjiban, sagwa, samjeon, woljang, jeomsi, manseData, bonmyeongBranch,
        isRyushinMode, setIsRyushinMode, isHangulMode, setIsHangulMode, generalMap, calculate
      }}
    >
      {children}
    </DivinationContext.Provider>
  );
};

export const useDivination = () => {
  const context = useContext(DivinationContext);
  if (!context) {
    throw new Error("useDivination must be used within DivinationProvider");
  }
  return context;
};
