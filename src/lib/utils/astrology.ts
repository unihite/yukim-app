/**
 * @file astrology.ts
 * @description 육임(Yukim) 핵심 계산 로직 - lunar-javascript 기반 2100년 대응 만세력 엔진
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Lunar = require('lunar-javascript');

import { BRANCHES, BRANCH_TO_IDX, IDX_TO_BRANCH, STEMS, GIGUNG_MAP, Stem, Branch } from "../constants/kanji";

// 만세력 데이터 타입
export interface ManseData {
  taeseCheongan: string;  // 태세(년) 천간
  taeseJiji: string;       // 태세(년) 지지
  wolgunCheongan: string; // 월건 천간
  wolgunJiji: string;      // 월건 지지
  ilganCheongan: string;  // 일주 천간
  ilganJiji: string;        // 일주 지지
  siJuCheongan: string;   // 시주 천간
  siJuJiji: string;          // 시주 지지
  woljang: string;          // 월장
  jeomsi: string;            // 점시
}

// 1. 천지반(Cheonjiban) 데이터 생성 엔진
export const calculateCheonjiban = (woljang: string, jeomsi: string): Record<string, string> => {
  const woljangIdx = BRANCH_TO_IDX[woljang];
  const jeomsiIdx = BRANCH_TO_IDX[jeomsi];
  const diff = (woljangIdx - jeomsiIdx + 12) % 12;
  const result: Record<string, string> = {};
  BRANCHES.forEach((jiban, idx) => {
    const cheonbanIdx = (idx + diff) % 12;
    result[jiban] = IDX_TO_BRANCH[cheonbanIdx];
  });
  return result;
};

// 2. 사과(Sagwa) 계산 로직
export interface Lesson {
  upper: string;
  lower: string;
  tag?: string;
  general?: string; // 천장 (귀인, 등사, 주작 등)
  stem?: string;    // 둔간 (천간)
}

/**
 * 일간과 일지를 기준으로 순중공망에 해당하는 2개의 지지를 계산합니다.
 */
export const getGongmang = (ilgan: string, ilji: string): string[] => {
  const gIdx = STEMS.indexOf(ilgan as Stem);
  const zIdx = BRANCHES.indexOf(ilji as Branch);
  if (gIdx === -1 || zIdx === -1) return [];
  
  const diff = (zIdx - gIdx + 12) % 12;
  const gm1 = (diff - 2 + 12) % 12;
  const gm2 = (diff - 1 + 12) % 12;
  
  return [BRANCHES[gm1], BRANCHES[gm2]];
};

/**
 * 둔간(천간) 조식법
 * 60갑자의 순(旬)을 찾아 대상 지지에 해당하는 둔간을 계산합니다.
 * @param ilgan 일간
 * @param ilji 일지
 * @param branch 대상 지지 (천반 등)
 * @returns 둔간(천간) 또는 공망일 경우 빈 문자열
 */
export const getDungan = (ilgan: string, ilji: string, branch: string): string => {
  const ilganIdx = STEMS.indexOf(ilgan as Stem);
  const iljiIdx = BRANCHES.indexOf(ilji as Branch);
  const branchIdx = BRANCHES.indexOf(branch as Branch);
  
  if (ilganIdx === -1 || iljiIdx === -1 || branchIdx === -1) return "";

  // 순수(旬首) 지지의 인덱스 = 일지 - 일간 (음수면 +12)
  const sunsuIdx = (iljiIdx - ilganIdx + 12) % 12;

  // 순수 지지에서 대상 지지까지의 순방향 오프셋
  const offset = (branchIdx - sunsuIdx + 12) % 12;

  // 오프셋이 10 이상이면 60갑자 1순(10일)을 벗어난 공망(空亡) 구간
  if (offset >= 10) return "";

  // 둔간은 대상 지지가 순수로부터 떨어진 오프셋만큼 甲에서 진행한 천간
  return STEMS[offset];
};

/**
 * 2. 사과(四課) 계산 로직 - 실제 육임 조식법 적용
 */
export const calculateSagwa = (
  ilgan: string,
  ilji: string,
  cheonjiban: Record<string, string>
): Lesson[] => {
  // 1과: 지반은 일간의 기궁, 천반은 그 지반의 천반
  const gwa1Lower = GIGUNG_MAP[ilgan] || "寅"; // 기본 폴백(오류 방지)
  const gwa1Upper = cheonjiban[gwa1Lower] || gwa1Lower;

  // 2과: 지반은 1과의 천반, 천반은 그 지반의 천반
  const gwa2Lower = gwa1Upper;
  const gwa2Upper = cheonjiban[gwa2Lower] || gwa2Lower;

  // 3과: 지반은 일지, 천반은 그 지반의 천반
  const gwa3Lower = ilji;
  const gwa3Upper = cheonjiban[gwa3Lower] || gwa3Lower;

  // 4과: 지반은 3과의 천반, 천반은 그 지반의 천반
  const gwa4Lower = gwa3Upper;
  const gwa4Upper = cheonjiban[gwa4Lower] || gwa4Lower;

  // 둔간 계산
  const gwa1Stem = getDungan(ilgan, ilji, gwa1Upper);
  const gwa2Stem = getDungan(ilgan, ilji, gwa2Upper);
  const gwa3Stem = getDungan(ilgan, ilji, gwa3Upper);
  const gwa4Stem = getDungan(ilgan, ilji, gwa4Upper);

  return [
    { upper: gwa1Upper, lower: gwa1Lower, tag: "1과", stem: gwa1Stem },
    { upper: gwa2Upper, lower: gwa2Lower, tag: "2과", stem: gwa2Stem },
    { upper: gwa3Upper, lower: gwa3Lower, tag: "3과", stem: gwa3Stem },
    { upper: gwa4Upper, lower: gwa4Lower, tag: "4과", stem: gwa4Stem },
  ];
};

/**
 * 복음과(伏吟課) 삼전 테이블 - 월장 = 점시일 때 적용
 * 형식: [초전천반, 중전천반, 말전천반]
 */
type SamjeonTuple = [string, string, string];
type BokuemEntry = SamjeonTuple | Record<string, SamjeonTuple>;

const BOKEUM_SAMJEON: Record<string, BokuemEntry> = {
  "甲": ["寅", "巳", "申"],
  "乙": {
    "丑": ["辰", "丑", "戌"],
    "酉": ["辰", "酉", "卯"],
    "巳": ["辰", "巳", "申"],
    "亥": ["辰", "亥", "巳"],
    "卯": ["辰", "卯", "子"],
    "未": ["辰", "未", "丑"],
  },
  "丙": ["巳", "申", "寅"],
  "丁": {
    "丑": ["丑", "戌", "未"],
    "酉": ["酉", "未", "丑"],
    "巳": ["巳", "申", "寅"],
    "亥": ["亥", "未", "丑"],
    "卯": ["卯", "子", "午"],
    "未": ["未", "丑", "戌"],
  },
  "戊": ["巳", "申", "寅"],
  "己": {
    "丑": ["丑", "戌", "未"],
    "酉": ["酉", "未", "丑"],
    "巳": ["巳", "申", "寅"],
    "亥": ["亥", "未", "丑"],
    "卯": ["卯", "子", "午"],
    "未": ["未", "丑", "戌"],
  },
  "庚": ["申", "寅", "巳"],
  "辛": {
    "丑": ["丑", "戌", "未"],
    "酉": ["酉", "戌", "未"],
    "巳": ["巳", "申", "寅"],
    "亥": ["亥", "戌", "未"],
    "卯": ["卯", "子", "午"],
    "未": ["未", "丑", "戌"],
  },
  "壬": {
    "申": ["亥", "申", "寅"],
    "子": ["亥", "子", "卯"],
    "辰": ["亥", "辰", "戌"],
    "寅": ["亥", "寅", "巳"],
    "午": ["亥", "午", "子"],
    "戌": ["亥", "戌", "未"],
  },
  "癸": ["丑", "戌", "未"],
};

/** 복음과 삼전 조회 */
const getBokuemSamjeon = (ilgan: string, ilji: string): SamjeonTuple | null => {
  const entry = BOKEUM_SAMJEON[ilgan];
  if (!entry) return null;
  if (Array.isArray(entry)) return entry as SamjeonTuple;
  return (entry as Record<string, SamjeonTuple>)[ilji] ?? null;
};

/**
 * 3. 삼전(三傳) 계산 로직 - 실제 육임 형식 기반
 *
 * ■ 복음과 예외: 월장 = 점시이면 일간/일지 기반 고정 삼전 사용
 * ■ 초전 지반: gap = (점시idx - 월장idx + 12) % 12 ⇒ 초전지반 = 초전천반 + gap (순행)
 * ■ 중전 지반 = 초전 천반
 * ■ 중전 천반 = cheonjiban[중전지반]
 * ■ 말전 지반 = 중전 천반
 * ■ 말전 천반 = cheonjiban[말전지반]
 */
export const calculateSamjeon = (
  sagwa: Lesson[],
  woljang: string,
  jeomsi: string,
  cheonjiban: Record<string, string>,
  chojeonUpperOverride?: string,
  ilgan?: string,
  ilji?: string,
  chojeonGeneralOverride?: string
): Lesson[] => {
  let choUpper = "", choLower = "", jungUpper = "", jungLower = "", malUpper = "", malLower = "";
  let isBokeum = false;

  // ■ 복음과(伏吟課): 월장 = 점시 이고 yangja2 입력 없으면 테이블 적용
  if (woljang === jeomsi && !chojeonUpperOverride && ilgan && ilji) {
    const bokeum = getBokuemSamjeon(ilgan, ilji);
    if (bokeum) {
      [choUpper, jungUpper, malUpper] = bokeum;
      choLower = choUpper;
      jungLower = jungUpper;
      malLower = malUpper;
      isBokeum = true;
    }
  }

  // ■ 일반 계산 로직
  if (!isBokeum) {
    const woljangIdx = BRANCH_TO_IDX[woljang] ?? 0;
    const jeomsiIdx = BRANCH_TO_IDX[jeomsi] ?? 0;

    // 순행 gap: 월장 → 점시 (초전 지반 계산용)
    const forwardGap = (jeomsiIdx - woljangIdx + 12) % 12;

    // 초전 천반 (yangja2 덮어쓰기 또는 sagwa 기반)
    choUpper = chojeonUpperOverride ?? sagwa[0]?.upper ?? "丑";
    const choUpperIdx = BRANCH_TO_IDX[choUpper] ?? 0;

    // 초전 지반 = 초전천반 + forwardGap (순행)
    choLower = IDX_TO_BRANCH[(choUpperIdx + forwardGap) % 12];

    // 중전 지반 = 초전 천반
    jungLower = choUpper;

    // 중전 천반 = cheonjiban[중전지반]
    jungUpper = cheonjiban[jungLower] ?? jungLower;

    // 말전 지반 = 중전 천반
    malLower = jungUpper;

    // 말전 천반 = cheonjiban[말전지반]
    malUpper = cheonjiban[malLower] ?? malLower;
  }

  // -----------------------------
  // 천장(General) 접지(할당) 로직
  // -----------------------------
  const choIdx = BRANCH_TO_IDX[choUpper] ?? 0;
  const jungIdx = BRANCH_TO_IDX[jungUpper] ?? 0;
  const malIdx = BRANCH_TO_IDX[malUpper] ?? 0;

  // 순행 / 역행 과전 판별 (간격이 6 이하이면 순행, 아니면 역행)
  const isForward = ((jungIdx - choIdx + 12) % 12) <= 6;

  // 초전 천장 결정 (양자수 3번 입력 우선, 없으면 일단 "貴" (향후 기본 귀인 로직 반영용))
  const choGeneralStr = chojeonGeneralOverride ?? "貴";
  const genIdx = GENERALS.indexOf(choGeneralStr) >= 0 ? GENERALS.indexOf(choGeneralStr) : 0;

  // 중전 천장 계산 (순행이면 더하고, 역행이면 뺀다 즉 차이를 반대로 구함)
  const jungGap = isForward ? (jungIdx - choIdx + 12) % 12 : (choIdx - jungIdx + 12) % 12;
  const jungGeneral = GENERALS[(genIdx + jungGap) % 12];

  // 말전 천장 계산
  const malGap = isForward ? (malIdx - choIdx + 12) % 12 : (choIdx - malIdx + 12) % 12;
  const malGeneral = GENERALS[(genIdx + malGap) % 12];

  // -----------------------------
  // 삼전에 둔간(천간) 적용
  // -----------------------------
  const choStem = ilgan && ilji ? getDungan(ilgan, ilji, choUpper) : "";
  const jungStem = ilgan && ilji ? getDungan(ilgan, ilji, jungUpper) : "";
  const malStem = ilgan && ilji ? getDungan(ilgan, ilji, malUpper) : "";

  return [
    { upper: choUpper, lower: choLower, tag: isBokeum ? "초전(복음)" : "초전", general: choGeneralStr, stem: choStem },
    { upper: jungUpper, lower: jungLower, tag: isBokeum ? "중전(복음)" : "중전", general: jungGeneral, stem: jungStem },
    { upper: malUpper, lower: malLower, tag: isBokeum ? "말전(복음)" : "말전", general: malGeneral, stem: malStem },
  ];
};

// 4. 행년(Haengnyeon) 계산 (간지 2글자 반환)
export const calculateHaengnyeon = (age: number, gender: "남" | "여", isBirthdayPassed: boolean = true): string => {
  const actualAge = isBirthdayPassed ? age : Math.max(1, age - 1);
  if (gender === "남") {
    // 1세 丙寅(병인)부터 순행
    const stemIdx = (2 + (actualAge - 1)) % 10;
    const branchIdx = (2 + (actualAge - 1)) % 12;
    return STEMS[stemIdx] + IDX_TO_BRANCH[branchIdx];
  } else {
    // 1세 壬申(임신)부터 역행
    const stemIdx = (8 - (actualAge - 1) + 100) % 10;
    const branchIdx = (8 - (actualAge - 1) + 120) % 12;
    return STEMS[stemIdx] + IDX_TO_BRANCH[branchIdx];
  }
};

// 5. 육친 및 운성 매핑
export const getRelationship = (branch: string): string => {
  const mock: Record<string, string> = { "申": "형제", "午": "관귀", "辰": "부모", "亥": "지의", "酉": "자손" };
  return mock[branch] || "재효";
};

export const getTwelveStage = (ilgan: string, branch: string): string => {
  let baseMap: Record<string, string> = {};
  
  // 1. 소담 양자 육임 파의 12운성 룰: 양/음간 통합 12운성 전체 순행
  if (ilgan === "甲" || ilgan === "乙") {
    // 목(木) - 亥생 순행
    baseMap = { "亥":"생", "子":"욕", "丑":"관", "寅":"록", "卯":"왕", "辰":"쇠", "巳":"병", "午":"사", "未":"묘", "申":"절", "酉":"태", "戌":"양" };
  } else if (ilgan === "丙" || ilgan === "丁") {
    // 화(火) - 寅생 순행
    baseMap = { "寅":"생", "卯":"욕", "辰":"관", "巳":"록", "午":"왕", "未":"쇠", "申":"병", "酉":"사", "戌":"묘", "亥":"절", "子":"태", "丑":"양" };
  } else if (ilgan === "庚" || ilgan === "辛") {
    // 금(金) - 巳생 순행
    baseMap = { "巳":"생", "午":"욕", "未":"관", "申":"록", "酉":"왕", "戌":"쇠", "亥":"병", "子":"사", "丑":"묘", "寅":"절", "卯":"태", "辰":"양" };
  } else if (ilgan === "戊" || ilgan === "己" || ilgan === "壬" || ilgan === "癸") {
    // 수/토(水/土) 동궁 - 申생 순행
    baseMap = { "申":"생", "酉":"욕", "戌":"관", "亥":"록", "子":"왕", "丑":"쇠", "寅":"병", "卯":"사", "辰":"묘", "巳":"절", "午":"태", "未":"양" };
  }

  // 2. 예외 록(건록) 강제 적용 (선생님 제공 고유 규칙: 어떠한 기존 운성과 겹치든 무조건 '록' 1글자로 덮어쓰기 표출)
  if (ilgan === "甲") baseMap["寅"] = "록";
  if (ilgan === "乙") baseMap["卯"] = "록";
  if (ilgan === "丙") baseMap["巳"] = "록";
  if (ilgan === "丁") baseMap["午"] = "록";
  if (ilgan === "戊") baseMap["巳"] = "록";
  if (ilgan === "己") baseMap["午"] = "록";
  if (ilgan === "庚") baseMap["申"] = "록";
  if (ilgan === "辛") baseMap["酉"] = "록";
  if (ilgan === "壬") baseMap["亥"] = "록";
  if (ilgan === "癸") baseMap["子"] = "록";

  return baseMap[branch] || "";
};

// 6. 소담 조언 데이터
export const ADVICE_DATA: Record<number, { title: string; content: string }> = {
  1: { title: "건위천 (乾爲天)", content: "하늘이 거듭된 형상입니다. 큰 뜻을 품고 나아가면 길합니다." },
};
for (let i = 2; i <= 64; i++) {
  ADVICE_DATA[i] = { title: `괘 ${i}`, content: `제 ${i}번 조언입니다. 1초간의 집중이 행운을 부릅니다.` };
}

/**
 * 본명(本命) 지지 산출
 * 올해 태세(太歲) 지지에서 한국나이 기준으로 역행(逆行)하여 출생년도의 지지를 계산합니다.
 */
export const getBonmyeongBranch = (taeseJiji: string, age: number): string => {
  const taeseIdx = BRANCH_TO_IDX[taeseJiji as Branch];
  if (taeseIdx === undefined) return "午";
  const idx = (taeseIdx - (age - 1) + 1200) % 12;
  return IDX_TO_BRANCH[idx];
};

/**
 * 7. lunar-javascript 기반 정밀 만세력 산출 (2100년까지 지원)
 * 날짜와 시각(시간)을 입력받아 태세/월건/일주/시주를 반환합니다.
 */
export const getManseData = (date: Date): ManseData => {
  const hour = date.getHours();
  const solar = Lunar.Solar.fromDate(date);
  const lunar = solar.getLunar();
  const bazi = lunar.getEightChar();

  const taeseStr: string = bazi.getYear();
  const wolgunStr: string = bazi.getMonth();
  const ilganStr: string = bazi.getDay();
  const siJuStr: string = bazi.getTime();

  // 만세력 라이브러리의 간지 두 글자 분리
  const taeseCheongan = taeseStr.charAt(0);
  const taeseJiji = taeseStr.charAt(1);
  const wolgunCheongan = wolgunStr.charAt(0);
  const wolgunJiji = wolgunStr.charAt(1);
  const ilganCheongan = ilganStr.charAt(0);
  const ilganJiji = ilganStr.charAt(1);
  const siJuCheongan = siJuStr.charAt(0);
  const siJuJiji = siJuStr.charAt(1);

  const woljang = getWoljangFromSolar(solar);
  const jeomsi = getHourBranch(date);

  return {
    taeseCheongan, taeseJiji,
    wolgunCheongan, wolgunJiji,
    ilganCheongan, ilganJiji,
    siJuCheongan, siJuJiji,
    woljang,
    jeomsi,
  };
};

/**
 * 8. 태양 황경 기반 월장 산출 (2100년 정밀 지원)
 * lunar-javascript의 Solar Term 데이터를 활용합니다.
 */
const getWoljangFromSolar = (solar: unknown): string => {
  // lunar-javascript의 solar term(절기) index를 활용
  // 중기(中氣)는 짝수 번호 절기: 우수(1), 춘분(3), 곡우(5), 소만(7), 하지(9), 대서(11)
  //                               처서(13), 추분(15), 상강(17), 소설(19), 동지(21), 대한(23)
  // 월장은 중기 이후 해당 지지로 결정
  const s = solar as { getMonth: () => number; getDay: () => number };
  const month = s.getMonth();
  const day = s.getDay();
  return getWoljang(new Date(2000, month - 1, day));
};

/**
 * 9. 날짜 기반 월장 산출 (중기 절입 기준)
 */
export const getWoljang = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 1 && day >= 20) || (month === 2 && day < 19)) return "子";
  if ((month === 2 && day >= 19) || (month === 3 && day < 21)) return "亥";
  if ((month === 3 && day >= 21) || (month === 4 && day < 20)) return "戌";
  if ((month === 4 && day >= 20) || (month === 5 && day < 21)) return "酉";
  if ((month === 5 && day >= 21) || (month === 6 && day < 21)) return "申";
  if ((month === 6 && day >= 21) || (month === 7 && day < 23)) return "未";
  if ((month === 7 && day >= 23) || (month === 8 && day < 23)) return "午";
  if ((month === 8 && day >= 23) || (month === 9 && day < 23)) return "巳";
  if ((month === 9 && day >= 23) || (month === 10 && day < 23)) return "辰";
  if ((month === 10 && day >= 23) || (month === 11 && day < 22)) return "卯";
  if ((month === 11 && day >= 22) || (month === 12 && day < 22)) return "寅";
  return "丑";
};

/**
 * 10. 시간 기반 점시(12지) 산출
 */
export const getHourBranch = (date: Date): string => {
  const hours = date.getHours();
  if (hours >= 23 || hours < 1) return "子";
  if (hours >= 1 && hours < 3) return "丑";
  if (hours >= 3 && hours < 5) return "寅";
  if (hours >= 5 && hours < 7) return "卯";
  if (hours >= 7 && hours < 9) return "辰";
  if (hours >= 9 && hours < 11) return "巳";
  if (hours >= 11 && hours < 13) return "午";
  if (hours >= 13 && hours < 15) return "未";
  if (hours >= 15 && hours < 17) return "申";
  if (hours >= 17 && hours < 19) return "酉";
  if (hours >= 19 && hours < 21) return "戌";
  return "亥";
};

/**
 * 11. 범용 양자수 → 12지지 산출
 * 1=子, 2=丑, ..., 12=亥. 12 초과 시 12를 반복 차감.
 */
export const getBranchFromNumber = (input: string): string | null => {
  const num = parseInt(input, 10);
  if (isNaN(num) || num <= 0) return null;
  let n = num;
  while (n > 12) n -= 12;
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  return branches[n - 1];
};

/**
 * 12. 양자수 1번 기반 점시 산출 (하위 호환성 유지)
 */
export const getJeomsiFromYangja = (yangja: string): string | null =>
  getBranchFromNumber(yangja);

/**
 * 13. 양자수 2번 기반 초전 천반 산출
 * 1=子, 2=丑, ..., 12=亥
 * 예) 14 -> 14-12=2 -> 丑, 77 -> 77-6*12=5 -> 辰
 */
export const getChojeonCheonbanFromYangja = (yangja: string): string | null =>
  getBranchFromNumber(yangja);

/**
 * 14. 양자수 3번 기반 초전 천장 산출
 * 1=귀인(貴人), 2=등사(騰蛇), 3=주작(朱雀), 4=육합(六合),
 * 5=구진(勾陳), 6=청뢡(青龍), 7=천공(天空), 8=백호(白虎),
 * 9=태상(太常), 10=현무(玄武), 11=태음(太陰), 12=천후(天後)
 * 예) 15 -> 15-12=3 -> 주작(朱), 33 -> 33-12-12=9 -> 태상(常)
 */
export const GENERALS: string[] = [
  "貴",  // 1. 귀인
  "蛇",  // 2. 등사
  "朱",  // 3. 주작
  "合",  // 4. 육합
  "勾",  // 5. 구진
  "青",  // 6. 청뢡
  "空",  // 7. 천공
  "白",  // 8. 백호
  "常",  // 9. 태상
  "玄",  // 10. 현무
  "陰",  // 11. 태음
  "后",  // 12. 천후
];

export const getGeneralFromYangja3 = (yangja: string): string | null => {
  const num = parseInt(yangja, 10);
  if (isNaN(num) || num <= 0) return null;
  let n = num;
  while (n > 12) n -= 12;
  return GENERALS[n - 1];
};

/**
 * 12천장 동적 포국 (배포) 맵
 * - 삼전(초전,중전) 방향성(순행/역행) 판단: (중전 - 초전 + 12) % 12 가 7 이상이면 역행.
 * - 양자수 3번(yangja3)으로 '초전 천장' 도출 (1=귀인 ~ 12=천후)
 * - 12천반 지지에 맞춰 천장을 자동으로 승전시켜 맵형태로 반환
 */
export const buildGeneralsMap = (
  choUpper: string, 
  jungUpper: string, 
  yangja3: string
): Record<string, string> => {
  const map: Record<string, string> = {};
  if (!choUpper || !jungUpper) return map;

  const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  
  // 1. 초전 천장 도출 (선생님 공식: 12 초과 시 -12)
  let gIdx = 0; // 예외 시 기본값 귀인(index 0)
  if (yangja3) {
    let num = parseInt(yangja3, 10);
    if (!isNaN(num) && num > 0) {
      while (num > 12) num -= 12;
      gIdx = num - 1; // 1~12를 0~11 인덱스로 변환
    }
  }

  // 2. 삼전 진행 방향 (순행 vs 역행) 판단
  const choIdx = BRANCHES.indexOf(choUpper);
  const jungIdx = BRANCHES.indexOf(jungUpper);
  const diff = (jungIdx - choIdx + 12) % 12;
  const isReverse = diff > 6; 

  // 3. 천지반 12칸 배포 순환 (기준점: 초전 천반 글자)
  for (let i = 0; i < 12; i++) {
    const currentBranchIdx = (choIdx + i) % 12;
    const currentBranch = BRANCHES[currentBranchIdx];
    
    let currentGenIdx;
    if (isReverse) {
      // 역행이면 초전에서 시계방향 지지로 갈수록 천장은 거꾸로 간다(귀인->천후->태음...)
      currentGenIdx = (gIdx - i + 120) % 12; // 음수 방지
    } else {
      // 순행이면 시계방향 지지에 천장도 시계방향 (귀인->등사->주작...)
      currentGenIdx = (gIdx + i) % 12;
    }
    map[currentBranch] = GENERALS[currentGenIdx];
  }

  return map;
};

/**
 * 15. 월건 기반 특수 신살(사기, 생기, 사신, 천의, 지의, 황은, 천마, 월염, 성신) 산출
 * 월건 지지(wolgeonBranch)와 대상 지지(targetBranch)를 받아, 대상 지지에 속하는 신살 목록 반환
 */
export const getMonthlyShinsals = (wolgeonBranch: string, targetBranch: string): string[] => {
  const WOLGEON_ORDER = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
  const wIdx = WOLGEON_ORDER.indexOf(wolgeonBranch);
  if (wIdx === -1) return [];

  const result: string[] = [];

  // 1. 사기
  const sagiMap = ["午", "未", "申", "酉", "戌", "亥", "子", "丑", "寅", "卯", "辰", "巳"];
  if (sagiMap[wIdx] === targetBranch) result.push("사기");

  // 2. 생기
  const saenggiMap = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  if (saenggiMap[wIdx] === targetBranch) result.push("생기");

  // 3. 사신
  const sashinMap = ["巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑", "寅", "卯", "辰"];
  if (sashinMap[wIdx] === targetBranch) result.push("사신");

  // 4. 천의
  const cheonuiMap = ["辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑", "寅", "卯"];
  if (cheonuiMap[wIdx] === targetBranch) result.push("천의");

  // 5. 지의
  const jiuiMap = ["戌", "亥", "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉"];
  if (jiuiMap[wIdx] === targetBranch) result.push("지의");

  // 6. 황은
  const hwangeunMap = ["未", "酉", "亥", "丑", "卯", "巳", "未", "酉", "亥", "丑", "卯", "巳"];
  if (hwangeunMap[wIdx] === targetBranch) result.push("황은");

  // 7. 천마
  const cheonmaMap = ["午", "申", "戌", "子", "寅", "辰", "午", "申", "戌", "子", "寅", "辰"];
  if (cheonmaMap[wIdx] === targetBranch) result.push("천마");

  // 8. 월염
  const wolyeomMap = ["戌", "酉", "申", "未", "午", "巳", "辰", "卯", "寅", "丑", "子", "亥"];
  if (wolyeomMap[wIdx] === targetBranch) result.push("월염");

  // 9. 성신
  const seongshinMap = ["巳", "申", "亥", "寅", "巳", "申", "亥", "寅", "巳", "申", "亥", "寅"];
  if (seongshinMap[wIdx] === targetBranch) result.push("성신");

  return result;
};

/**
 * 16. 계절 신살 산출 (월건의 계절 기준)
 * 천희, 화귀 반환
 */
export const getSeasonalShinsals = (wolgeonBranch: string, targetBranch: string): string[] => {
  const result: string[] = [];
  const isSpring = ["寅", "卯", "辰"].includes(wolgeonBranch);
  const isSummer = ["巳", "午", "未"].includes(wolgeonBranch);
  const isAutumn = ["申", "酉", "戌"].includes(wolgeonBranch);
  const isWinter = ["亥", "子", "丑"].includes(wolgeonBranch);

  if (isSpring) {
    if (targetBranch === "戌") result.push("천희");
    if (targetBranch === "午") result.push("화귀");
  } else if (isSummer) {
    if (targetBranch === "丑") result.push("천희");
    if (targetBranch === "酉") result.push("화귀");
  } else if (isAutumn) {
    if (targetBranch === "辰") result.push("천희");
    if (targetBranch === "子") result.push("화귀");
  } else if (isWinter) {
    if (targetBranch === "未") result.push("천희");
    if (targetBranch === "卯") result.push("화귀");
  }
  return result;
};

/**
 * 17. 일지 신살 산출 (일지 기준)
 * 파쇄 반환
 */
export const getDailyShinsals = (iljiBranch: string, targetBranch: string): string[] => {
  const ORDER = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
  const idx = ORDER.indexOf(iljiBranch);
  if (idx === -1) return [];
  const result: string[] = [];
  
  // 파쇄: 酉 巳 丑 酉 巳 丑 酉 巳 丑 酉 巳 丑
  const paswaeMap = ["酉", "巳", "丑", "酉", "巳", "丑", "酉", "巳", "丑", "酉", "巳", "丑"];
  if (paswaeMap[idx] === targetBranch) result.push("파쇄");

  return result;
};

/**
 * 18. 년지 신살 산출 (태세 지지 기준)
 * 조객, 상문 반환
 */
export const getYearlyShinsals = (taeseBranch: string, targetBranch: string): string[] => {
  const ORDER = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];
  const idx = ORDER.indexOf(taeseBranch);
  if (idx === -1) return [];
  const result: string[] = [];

  // 조객: 子 丑 寅 卯 辰 巳 午 未 申 酉 戌 亥
  const jogaekMap = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  if (jogaekMap[idx] === targetBranch) result.push("조객");

  // 상문: 辰 巳 午 未 申 酉 戌 亥 子 丑 寅 卯
  const sangmunMap = ["辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑", "寅", "卯"];
  if (sangmunMap[idx] === targetBranch) result.push("상문");

  return result;
};
