"use client";

// Dashboard Page — Summary cards, Area chart (trend), Pie chart (kategori), Recent transactions
import { useEffect, useState, useCallback } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// ─── Types ───
interface SummaryData {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    expenseByCategory: { name: string; icon: string; color: string; amount: number }[];
    trend: { month: string; income: number; expense: number }[];
    recentTransactions: {
        id: number;
        amount: number;
        type: string;
        description: string;
        date: string;
        category: { name: string; icon: string; color: string };
    }[];
    budgetAlerts: { name: string; icon: string; color: string; percentage: number }[];
}

// ─── Helpers ───
function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
    });
}

// ─── Custom Tooltip for Recharts ───
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: string | number }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            boxShadow: "var(--shadow-md)",
            fontSize: "13px",
        }}>
            <p style={{ fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.name === "income" ? "var(--income-color)" : "var(--expense-color)" }}>
                    {p.name === "income" ? "Pemasukan" : "Pengeluaran"}: {formatRupiah(Number(p.value))}
                </p>
            ))}
        </div>
    );
}

// ─── Main Page ───
export default function DashboardPage() {
    const [data, setData] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dismissAlerts, setDismissAlerts] = useState(false);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/summary?month=${month}&year=${year}`);
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);

    const monthName = now.toLocaleString("id-ID", { month: "long", year: "numeric" });

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Ringkasan keuangan bulan {monthName}</p>
            </div>

            {/* Budget Alert Banner */}
            {!loading && !dismissAlerts && (data?.budgetAlerts?.length ?? 0) > 0 && (
                <div style={{
                    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                    border: "1px solid #f59e0b",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 16px",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#92400e", marginBottom: 6 }}>
                            Budget hampir habis! Kontrol pengeluaran lo, ngab.
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {data!.budgetAlerts.map((alert) => (
                                <span
                                    key={alert.name}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        background: "rgba(255,255,255,0.6)",
                                        border: `1px solid ${alert.percentage >= 100 ? "#ef4444" : "#f59e0b"}`,
                                        borderRadius: 99,
                                        padding: "3px 10px",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: alert.percentage >= 100 ? "#dc2626" : "#92400e",
                                    }}
                                >
                                    {alert.icon} {alert.name} — {alert.percentage}%
                                    {alert.percentage >= 100 && " 🚨"}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => setDismissAlerts(true)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#92400e", flexShrink: 0, lineHeight: 1 }}
                        title="Tutup"
                        id="dismiss-budget-alert"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-icon income">💚</div>
                    <div className="stat-card-info">
                        <div className="stat-card-label">Total Pemasukan</div>
                        <div className="stat-card-value income">
                            {loading ? "..." : formatRupiah(data?.totalIncome ?? 0)}
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon expense">❤️</div>
                    <div className="stat-card-info">
                        <div className="stat-card-label">Total Pengeluaran</div>
                        <div className="stat-card-value expense">
                            {loading ? "..." : formatRupiah(data?.totalExpense ?? 0)}
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon balance">💜</div>
                    <div className="stat-card-info">
                        <div className="stat-card-label">Saldo</div>
                        <div className="stat-card-value balance">
                            {loading ? "..." : formatRupiah(data?.balance ?? 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                {/* Area Chart - Trend */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Tren 6 Bulan Terakhir</h2>
                    </div>
                    {loading ? (
                        <div className="skeleton" style={{ height: 220, borderRadius: "var(--radius-sm)" }} />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={data?.trend ?? []} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v: any) => `${(Number(v) / 1000000).toFixed(1)}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" name="income" />
                                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" name="expense" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart - Expense by Category */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Pengeluaran per Kategori</h2>
                    </div>
                    {loading ? (
                        <div className="skeleton" style={{ height: 220, borderRadius: "var(--radius-sm)" }} />
                    ) : !data?.expenseByCategory.length ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📊</div>
                            <div className="empty-state-text">Belum ada pengeluaran bulan ini</div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={data.expenseByCategory}
                                    dataKey="amount"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={3}
                                >
                                    {data.expenseByCategory.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: string | number | (string | number)[] | undefined) => formatRupiah(Number(v ?? 0))} />
                                <Legend iconType="circle" iconSize={8} formatter={(v: string | number) => <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{String(v)}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Transaksi Terbaru</h2>
                    <a href="/transactions" className="btn btn-sm btn-secondary">Lihat Semua →</a>
                </div>
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="skeleton" style={{ height: 50 }} />
                        ))}
                    </div>
                ) : !data?.recentTransactions.length ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💸</div>
                        <div className="empty-state-title">Belum ada transaksi</div>
                        <div className="empty-state-text">Catat pengeluaran dan pemasukan lo di halaman Transaksi</div>
                    </div>
                ) : (
                    <div className="transaction-list">
                        {data.recentTransactions.map((t) => (
                            <div key={t.id} className="transaction-item">
                                <div className="transaction-icon">{t.category.icon}</div>
                                <div className="transaction-info">
                                    <div className="transaction-desc">{t.description}</div>
                                    <div className="transaction-meta">{t.category.name} · {formatDate(t.date)}</div>
                                </div>
                                <div className={`transaction-amount ${t.type.toLowerCase()}`}>
                                    {t.type === "INCOME" ? "+" : "-"}{formatRupiah(t.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
