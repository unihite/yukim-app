/**
 * @file advices.ts
 * @description 프리미엄 소담 조언(Advice) 세밀 파싱 데이터 (1~64괘 상세)
 */

import chunk1 from './advices_chunk1.json';
import chunk2 from './advices_chunk2.json';
import chunk3 from './advices_chunk3.json';
import chunk4 from './advices_chunk4.json';

export interface AdviceData {
  title: string;
  content: string;
  items?: Record<string, string>;
}

export const ADVICES: Record<number, AdviceData> = {
  ...chunk1,
  ...chunk2,
  ...chunk3,
  ...chunk4,
} as Record<number, AdviceData>;
