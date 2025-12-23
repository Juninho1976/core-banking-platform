"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Account = {
  id: string;
  userId: string;
  accountNumber: string;
  balance: string | number;
  createdAt: string;
};

export default function AccountsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
  }, [router]);

  async function loadAccounts(t: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts", {
        headers: { Authorization: `Bearer ${t}` },
        cache: "no-store",
      });
      const text = await res.text();
      if (!res.ok) {
        setError(`Load failed (${res.status}): ${text}`);
        return;
      }
      const data = text ? JSON.parse(text) : [];
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (token) loadAccounts(token);
  }, [token]);

  async function createAccount() {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      if (!res.ok) {
        setError(`Create failed (${res.status}): ${text}`);
        return;
      }
      // Reload list after create
      await loadAccounts(token);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24 }}>Accounts</h1>
        <button onClick={logout} style={{ padding: 8 }}>
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={createAccount} disabled={busy || !token} style={{ padding: 10 }}>
          {busy ? "Working..." : "Create savings account"}
        </button>
        <button onClick={() => token && loadAccounts(token)} disabled={busy || !token} style={{ padding: 10 }}>
          Refresh
        </button>
      </div>

      {error && (
        <pre style={{ marginTop: 16, color: "crimson", whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}

      <div style={{ marginTop: 24 }}>
        {accounts.length === 0 ? (
          <p>No accounts yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Account</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Balance</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{a.accountNumber}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{String(a.balance)}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{a.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
