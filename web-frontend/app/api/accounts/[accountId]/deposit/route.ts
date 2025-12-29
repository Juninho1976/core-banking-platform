import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await ctx.params;

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const body = await req.text(); // preserve whatever JSON the UI sent
  const base = process.env.NEXT_PUBLIC_ACCOUNTS_BASE_URL!;

  const upstream = await fetch(`${base}/accounts/${accountId}/deposit`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      // optional but useful:
      "Idempotency-Key": req.headers.get("idempotency-key") ?? crypto.randomUUID(),
    },
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
