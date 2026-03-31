import { NextRequest, NextResponse } from "next/server";
import { getRequest, setRequest, getAllRequests, deleteRequest } from "@/lib/db";
import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY || 'YUKIM_DEFAULT_SECRET_2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'yukim2026';

function generateAuthCode(phone: string) {
  return crypto.createHash('sha256').update(phone + SECRET_KEY).digest('hex').substring(0, 6).toUpperCase();
}

/**
 * 미들웨어 검증 함수
 */
function checkAdminPassword(req: NextRequest) {
  const pwd = req.headers.get("x-admin-password");
  return pwd === ADMIN_PASSWORD;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  
  if (action === "login") {
    const { pwd } = await req.json();
    if (pwd === ADMIN_PASSWORD) return NextResponse.json({ success: true });
    return NextResponse.json({ error: "비밀번호 에러" }, { status: 401 });
  }

  // 관리자 권한 필수 체크
  if (!checkAdminPassword(req)) {
    return NextResponse.json({ error: "관리자 권한이 없습니다." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { phone } = body;

    // 1. 특정 번호 승인 처리 (/api/admin/approve)
    if (action === "approve" && phone) {
      let record = await getRequest(phone);
      if (!record) return NextResponse.json({ error: "요청이 존재하지 않습니다." }, { status: 404 });
      
      record.status = "approved";
      record.code = generateAuthCode(phone);
      record.timestamp = Date.now();
      await setRequest(phone, record);
      
      return NextResponse.json({ success: true, msg: "승인 완료" });
    }

    // 2. 특정 번호 거절 처리 (/api/admin/reject)
    if (action === "reject" && phone) {
      let record = await getRequest(phone);
      if (record) {
        record.status = "rejected";
        record.code = null;
        await setRequest(phone, record);
      }
      return NextResponse.json({ success: true, msg: "거절 완료" });
    }

    // 3. (옵션) 찌꺼기 삭제 처리
    if (action === "delete" && phone) {
      await deleteRequest(phone);
      return NextResponse.json({ success: true, msg: "삭제 완료" });
    }

    return NextResponse.json({ error: "잘못된 요청" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 전체 관리자 리스트 조회용 GET API
export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!checkAdminPassword(req)) {
    return NextResponse.json({ error: "관리자 권한이 없습니다." }, { status: 401 });
  }
  
  if (action === "list") {
    const all = await getAllRequests() as any[];
    // 서버측에서는 DB가 key가 없는 value 배열일 경우도 있으니 정렬을 위해 timestamp 활용
    all.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return NextResponse.json({ success: true, count: all.length, items: all });
  }

  return NextResponse.json({ error: "알 수 없는 요청" }, { status: 404 });
}
