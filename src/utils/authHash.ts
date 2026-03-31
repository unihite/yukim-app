/**
 * @file authHash.ts
 * @description 결정론적 해싱 알고리즘 (DHpass 클라이언트 자체 교차 검증용)
 */

export const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || "YUKIM_PREMIUM_SECURE_AUTH_KEY_2026"; // 서버의 .env와 정확히 일치해야 함

/**
 * 프론트엔드 자체 해싱 함수
 * 서버와 완전히 동일한 로직(SHA-256 사용 후 앞 6자리 추출)으로 클라이언트 자체 검증을 보장
 */
export async function generateAuthCodeClient(phone: string): Promise<string> {
  const message = phone + SECRET_KEY;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex.substring(0, 6).toUpperCase();
}
