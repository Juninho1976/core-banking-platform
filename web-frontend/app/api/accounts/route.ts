import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const base = process.env.ACCOUNTS_BASE_URL;
  if (!base) {
    return NextResponse.json({ error: "Missing ACCOUNTS_BASE_URL" }, { status: 500 });
  }

  const upstream = await fetch(`${base}/accounts`, {
    headers: { Authorization: auth },
    cache: "no-store",
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  const base = process.env.ACCOUNTS_BASE_URL;
  if (!base) {
    return NextResponse.json({ error: "Missing ACCOUNTS_BASE_URL" }, { status: 500 });
  }

  const upstream = await fetch(`${base}/accounts`, {
    method: "POST",
    headers: { Authorization: auth },
    cache: "no-store",
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
