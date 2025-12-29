import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { accountId: string } }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  // Read body as raw text to avoid JSON parse errors when body is empty
  const bodyText = await req.text();
  if (!bodyText || bodyText.trim().length === 0) {
    return NextResponse.json({ error: "Missing request body" }, { status: 400 });
  }

  const idempotencyKey = req.headers.get("idempotency-key") ?? `dep-${crypto.randomUUID()}`;

  const base = process.env.NEXT_PUBLIC_ACCOUNTS_BASE_URL!;
  const upstream = await fetch(`${base}/accounts/${params.accountId}/deposit`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: bodyText,
    cache: "no-store",
  });

  const text = await upstream.text(); // could be empty on errors
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
