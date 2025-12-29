"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Account = {
  id: string;
  accountNumber: string;
  balance: string; // BigDecimal often serializes as string
  createdAt: string;
};

export default function AccountsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // per-account input amounts
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
  }, [router]);

  const authHeaders = useMemo(() => {
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  async function loadAccounts() {
    if (!authHeaders) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/accounts", {
      headers: authHeaders,
      cache: "no-store",
    });

    if (!res.ok) {
      setError(`Failed to load accounts (${res.status})`);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setAccounts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    if (authHeaders) loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeaders]);

  async function createAccount() {
    if (!authHeaders) return;
    setError(null);

    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: authHeaders,
    });

    if (!res.ok) {
      setError(`Failed to create account (${res.status})`);
      return;
    }

    await loadAccounts();
  }

  function getAmount(accountId: string) {
    return amounts[accountId] ?? "";
  }

  function setAmount(accountId: string, value: string) {
    setAmounts((prev) => ({ ...prev, [accountId]: value }));
  }

  async function doTxn(accountId: string, kind: "deposit" | "withdraw") {
    if (!authHeaders) return;
    setError(null);

    const amt = getAmount(accountId).trim();
    if (!amt) {
      setError("Enter an amount first");
      return;
    }

    // basic client validation – backend is source of truth
    const n = Number(amt);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Amount must be > 0");
      return;
    }

    const idem = `${kind}-${accountId}-${crypto.randomUUID()}`;

    const res = await fetch(`/api/accounts/${accountId}/${kind}`, {
      method: "POST",
      headers: {
        ...authHeaders,
        "Idempotency-Key": idem,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amt }),
    });

    if (!res.ok) {
      const text = await res.text();
      setError(`Transaction failed (${res.status}): ${text || "No body"}`);
      return;
    }

    // After a transaction, refresh accounts so balances update
    await loadAccounts();
    setAmount(accountId, "");
  }

  if (!token) return null;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Accounts</h1>

      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={createAccount} style={{ padding: "8px 12px" }}>
          Create savings account
        </button>
        <button onClick={loadAccounts} style={{ padding: "8px 12px" }}>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, color: "crimson", whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ marginTop: 16 }}>Loading…</p>
      ) : accounts.length === 0 ? (
        <p style={{ marginTop: 16 }}>No accounts yet.</p>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {accounts.map((a) => (
            <div
              key={a.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{a.accountNumber}</div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>{a.id}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>£{a.balance}</div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  value={getAmount(a.id)}
                  onChange={(e) => setAmount(a.id, e.target.value)}
                  placeholder="e.g. 10.00"
                  style={{ padding: 8, width: 140 }}
                />
                <button onClick={() => doTxn(a.id, "deposit")} style={{ padding: "8px 12px" }}>
                  Deposit
                </button>
                <button onClick={() => doTxn(a.id, "withdraw")} style={{ padding: "8px 12px" }}>
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
