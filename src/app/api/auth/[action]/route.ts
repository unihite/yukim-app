import { NextRequest, NextResponse } from "next/server";
import { getRequest, setRequest } from "@/lib/db";

import crypto from 'crypto';

const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || 'YUKIM_PREMIUM_SECURE_AUTH_KEY_2026';

function generateAuthCode(phone: string) {
  return crypto.createHash('sha256').update(phone + SECRET_KEY).digest('hex').substring(0, 6).toUpperCase();
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || phone.length < 10) {
      return NextResponse.json({ error: "유효한 번호가 아닙니다." }, { status: 400 });
    }

    // 1. 사용자 승인 대기 등록 (/api/auth/request)
    if (action === "request") {
      let record = await getRequest(phone);
      if (!record || record.status === 'rejected') {
        record = {
          phone: phone, // 관리지 리스트 출력을 위한 키 포함
          status: "pending",
          code: null,
          timestamp: Date.now()
        };
        await setRequest(phone, record);
      }
      return NextResponse.json({ success: true, status: record.status, code: record.code });
    }

    // 2. 관리자 승인 여부 폴링 체크 (/api/auth/check)
    if (action === "check") {
      const record = await getRequest(phone);
      if (!record) return NextResponse.json({ success: false, status: "none" });
      return NextResponse.json({ success: true, status: record.status, code: record.code });
    }

    // 3. 앱 입장 시 실시간 권한 교차 검증 (보안 박탈 동기화)
    if (action === "verify") {
      const { token } = body;
      const record = await getRequest(phone);
      const expectedCode = generateAuthCode(phone);

      // Vercel Serverless 등 환경에서 메모리가 날아간 경우 (!record), 
      // 클라이언트가 이미 올바른 토큰을 가졌다면 통과시키고 DB에 다시 살려놓음
      if (!record) {
        if (token === expectedCode) {
          await setRequest(phone, {
            phone: phone,
            status: "approved",
            code: expectedCode,
            timestamp: Date.now()
          });
          return NextResponse.json({ valid: true });
        } else {
          return NextResponse.json({ valid: false });
        }
      }

      // 레코드가 존재할 때는 관리자가 직접 거절했거나 승인 대기 중이거나, 토큰이 틀린 경우 차단
      if (record.status !== "approved" || record.code !== token) {
        return NextResponse.json({ valid: false });
      }
      
      // 통과 (입장 허용)
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json({ error: "알 수 없는 요청" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
