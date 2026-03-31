/**
 * @description 육임 및 명리학 계산을 위한 천간, 지지, 12지신, 육친, 12운성 상숫값 정의관련 설정함
 */

// 1. 천간 (10 Celestial Stems)
export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export type Stem = (typeof STEMS)[number];

// 2. 지지 (12 Terrestrial Branches)
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export type Branch = (typeof BRANCHES)[number];

// 3. 12천장 (12 Heavenly Generals - Cheonjang)
export const CHEONJANGS = [
  "貴人", "騰蛇", "朱雀", "六合", "勾陳", "靑龍", 
  "天空", "白虎", "太常", "玄武", "太陰", "天后"
] as const;
export type Cheonjang = (typeof CHEONJANGS)[number];

// 4. 오행 (Five Elements)
export const FIVE_ELEMENTS = {
  "甲": "木", "乙": "木", "寅": "木", "卯": "木",
  "丙": "火", "丁": "火", "巳": "火", "午": "火",
  "戊": "土", "己": "土", "辰": "土", "戌": "土", "丑": "土", "未": "土",
  "庚": "金", "辛": "金", "申": "金", "酉": "金",
  "壬": "水", "癸": "水", "亥": "水", "子": "水",
} as const;

// 5. 육친 (Relationships)
export const RELATIONSHIPS = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인", "형제", "부모", "관귀", "자손", "재효"] as const;
export type Relationship = (typeof RELATIONSHIPS)[number];

// 6. 12운성 (12 Stages of Life)
export const TWELVE_STAGES = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"] as const;
export type TwelveStage = (typeof TWELVE_STAGES)[number];


// 5. 지지별 인덱스 맵 (계산용)
export const BRANCH_TO_IDX: Record<string, number> = BRANCHES.reduce((acc, b, i) => ({ ...acc, [b]: i }), {});
export const IDX_TO_BRANCH: Record<number, Branch> = BRANCHES.reduce((acc, b, i) => ({ ...acc, [i]: b }), {});

// 6. 12궁 배지 정보 (예시 데이터)
export const CELL_TAGS: Record<string, { top: string; left: string; right: string }> = {
  "巳": { top: "癸", left: "재효", right: "태" },
  "午": { top: "", left: "부모", right: "양" },
  "未": { top: "", left: "관귀", right: "장" },
  "申": { top: "甲", left: "관귀", right: "목" },
  "酉": { top: "乙", left: "부모", right: "임" },
  "戌": { top: "丙", left: "형제", right: "록" },
  "亥": { top: "丁", left: "형제", right: "록" },
  "子": { top: "戊", left: "부모", right: "태" },
  "丑": { top: "己", left: "자손", right: "병" },
  "寅": { top: "庚", left: "자손", right: "사" },
  "卯": { top: "辛", left: "부모", right: "묘" },
  "辰": { top: "壬", left: "재료", right: "절" },
};

// 7. 천간 기궁(寄宮) 맵 (1과 지반 도출용)
export const GIGUNG_MAP: Record<string, Branch> = {
  "甲": "寅", "乙": "辰", "丙": "巳", "丁": "未", "戊": "巳",
  "己": "未", "庚": "申", "辛": "戌", "壬": "亥", "癸": "丑"
};

// 8. 한자 -> 한글 변환기 (UI 표시용)
export const HANJA_CHAR_TO_HANGUL: Record<string, string> = {
  "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무", "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계",
  "子": "자", "丑": "축", "寅": "인", "卯": "묘", "辰": "진", "巳": "사", "午": "오", "未": "미", "申": "신", "酉": "유", "戌": "술", "亥": "해",
  "貴": "귀", "人": "인", "騰": "등", "蛇": "사", "朱": "주", "雀": "작", "六": "육", "合": "합", "勾": "구", "陳": "진", "青": "청", "靑": "청", "龍": "룡", "天": "천", "空": "공", "白": "백", "虎": "호", "太": "태", "常": "상", "玄": "현", "武": "무", "陰": "음", "后": "후",
  "本": "본", "命": "명"
};

export const toHangul = (text: string | undefined | null, isHangulMode: boolean = false): string => {
  if (!text) return "";
  if (!isHangulMode) return String(text);
  return text.split('').map(char => HANJA_CHAR_TO_HANGUL[char] || char).join('');
};
