import { NextRequest, NextResponse } from "next/server";
import { getRequest, setRequest } from "@/lib/db";

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

    return NextResponse.json({ error: "알 수 없는 요청" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
