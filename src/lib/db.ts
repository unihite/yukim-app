import { Redis } from "@upstash/redis";

// 환경 변수 설정 여부 판단
const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

// 임시 휘발성 글로벌 메모리 (Redis 환경이 완전 세팅되기 전까지 작동을 보장하기 위함)
const globalMemoryDb: Record<string, any> = {};

/**
 * 특정 전화번호의 승인 요청 정보 가져오기
 */
export async function getRequest(phone: string) {
  if (hasRedis) {
    try {
      const redis = Redis.fromEnv();
      return await redis.hget("yukim_requests", phone);
    } catch(e) { 
      console.error("Redis 통신 오류 (임시 메모리로 대체):", e); 
      // Redis 에러 발생 시 최후의 수단으로 메모리 반환
    }
  }
  return globalMemoryDb[phone] || null;
}

/**
 * 전체 승인 요청 목록 가져오기
 */
export async function getAllRequests() {
  if (hasRedis) {
    try {
      const redis = Redis.fromEnv();
      const all: Record<string, any> | null = await redis.hgetall("yukim_requests");
      return all ? Object.values(all) : [];
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
  if (hasRedis) {
    try {
      const redis = Redis.fromEnv();
      await redis.hset("yukim_requests", { [phone]: data });
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
  if (hasRedis) {
    try {
      const redis = Redis.fromEnv();
      await redis.hdel("yukim_requests", phone);
      return;
    } catch(e) {
      console.error("Redis 통신 오류 (임시 메모리에서 삭제):", e);
    }
  }
  delete globalMemoryDb[phone];
}
