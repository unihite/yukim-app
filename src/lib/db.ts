import Redis from "ioredis";

// Vercel에서 발급된 REDIS_URL이 있는지 확인합니다.
const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
const hasRedis = !!redisUrl;

let redisClient: Redis | null = null;
if (hasRedis) {
  // REDIS_URL로 ioredis 연결 생성
  redisClient = new Redis(redisUrl as string);
}

// 임시 휘발성 글로벌 메모리 (Redis 스토어 설정 전/오류 시 사용)
const globalMemoryDb: Record<string, any> = {};

/**
 * 특정 전화번호의 승인 요청 정보 가져오기
 */
export async function getRequest(phone: string) {
  if (hasRedis && redisClient) {
    try {
      const data = await redisClient.hget("yukim_requests", phone);
      return data ? JSON.parse(data) : null;
    } catch(e) { 
      console.error("Redis 통신 오류 (임시 메모리로 대체):", e); 
    }
  }
  return globalMemoryDb[phone] || null;
}

/**
 * 전체 승인 요청 목록 가져오기
 */
export async function getAllRequests() {
  if (hasRedis && redisClient) {
    try {
      const all = await redisClient.hgetall("yukim_requests");
      if (all) {
        return Object.values(all).map(val => JSON.parse(val));
      }
      return [];
    } catch(e) { 
      console.error("Redis 통신 오류 (임시 메모리로 대체):", e);
    }
  }
  return Object.values(globalMemoryDb);
}

/**
 * 승인 요청 정보 갱신/저장
 */
export async function setRequest(phone: string, data: any) {
  if (hasRedis && redisClient) {
    try {
      await redisClient.hset("yukim_requests", phone, JSON.stringify(data));
      return;
    } catch(e) {
      console.error("Redis 통신 오류 (임시 메모리에 저장):", e);
    }
  }
  globalMemoryDb[phone] = data;
}

/**
 * 특정 전화번호 삭제
 */
export async function deleteRequest(phone: string) {
  if (hasRedis && redisClient) {
    try {
      await redisClient.hdel("yukim_requests", phone);
      return;
    } catch(e) {
      console.error("Redis 통신 오류 (임시 메모리에서 삭제):", e);
    }
  }
  delete globalMemoryDb[phone];
}
