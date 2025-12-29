import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { accountId: string } }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const idem = req.headers.get("idempotency-key");
  if (!idem) {
    return NextResponse.json({ error: "Missing Idempotency-Key header" }, { status: 400 });
  }

  const body = await req.text();
  const base = process.env.NEXT_PUBLIC_ACCOUNTS_BASE_URL!;
  const res = await fetch(`${base}/accounts/${params.accountId}/withdraw`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Idempotency-Key": idem,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
