"use client";

// Halaman Alokasi — metode pengelolaan keuangan (50/30/20, 40/40/20, dll)
// Tidak butuh API baru, pakai data dari /api/summary
import { useEffect, useState, useCallback } from "react";

// ─── Tipe ───
interface AllocationRule {
    id: string;
    label: string;
    description: string;
    needs: number;   // % untuk Kebutuhan
    wants: number;   // % untuk Keinginan
    savings: number; // % untuk Tabungan
}

interface SummaryData {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    allocationBreakdown: {
        Kebutuhan: number;
        Keinginan: number;
        Tabungan: number;
    };
}

// ─── Preset Rules ───
const PRESET_RULES: AllocationRule[] = [
    {
        id: "50-30-20",
        label: "50 / 30 / 20",
        description: "Kebutuhan 50% · Keinginan 30% · Tabungan 20%",
        needs: 50, wants: 30, savings: 20,
    },
    {
        id: "40-40-20",
        label: "40 / 40 / 20",
        description: "Kebutuhan 40% · Keinginan 40% · Tabungan 20%",
        needs: 40, wants: 40, savings: 20,
    },
    {
        id: "40-30-30",
        label: "40 / 30 / 30",
        description: "Kebutuhan 40% · Keinginan 30% · Tabungan 30%",
        needs: 40, wants: 30, savings: 30,
    },
    {
        id: "70-20-10",
        label: "70 / 20 / 10",
        description: "Kebutuhan 70% · Keinginan 20% · Tabungan 10%",
        needs: 70, wants: 20, savings: 10,
    },
    {
        id: "custom",
        label: "Custom",
        description: "Atur sendiri persentasenya",
        needs: 50, wants: 30, savings: 20,
    },
];

const LS_KEY_RULE = "duitku_allocation_rule_id";
const LS_KEY_CUSTOM = "duitku_allocation_custom";

// ─── Helpers ───
function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}

// ─── Bucket Card ───
function BucketCard({
    emoji,
    label,
    sublabel,
    recommended,
    actual,
    color,
    isOver,
    isSavings = false,
}: {
    emoji: string;
    label: string;
    sublabel: string;
    recommended: number;
    actual: number;
    color: string;
    isOver: boolean;
    isSavings?: boolean;
}) {
    const pct = recommended > 0 ? clamp(Math.round((actual / recommended) * 100), 0, 999) : 0;
    const barPct = clamp(pct, 0, 100);
    const diff = actual - recommended;
    
    // For savings, actual < recommended is BAD (short). For expenses, actual > recommended is BAD (over).
    const isBad = isSavings ? diff < 0 : isOver;

    return (
        <div className="card" style={{ border: isBad ? `2px solid var(--danger)` : "1px solid var(--border-color)" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md)",
                    background: color + "22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                }}>
                    {emoji}
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sublabel}</div>
                </div>
                {isBad && (
                    <div style={{
                        marginLeft: "auto",
                        background: "#fee2e2",
                        color: "#dc2626",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 99,
                    }}>
                        ⚠️ {isSavings ? "KURANG" : "LEWAT"}
                    </div>
                )}
            </div>

            {/* Amounts */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Aktual</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: isBad ? "var(--danger)" : color, marginTop: 2 }}>
                        {formatRupiah(actual)}
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Rekomendasi</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                        {formatRupiah(recommended)}
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="progress-bar" style={{ marginBottom: 10, height: 8 }}>
                <div
                    style={{
                        height: "100%",
                        width: `${barPct}%`,
                        borderRadius: 99,
                        background: isBad ? "var(--danger)" : color,
                        transition: "width 0.5s ease",
                    }}
                />
            </div>

            {/* Diff */}
            <div style={{ fontSize: 12, color: isBad ? "var(--danger)" : "var(--success)", fontWeight: 600 }}>
                {diff === 0
                    ? "✅ Pas banget!"
                    : isSavings
                        ? diff > 0
                            ? `✅ Lebihan nabung ${formatRupiah(diff)}`
                            : `😬 Kurang nabung ${formatRupiah(Math.abs(diff))}`
                        : diff > 0
                            ? `😬 Kelebihan ${formatRupiah(diff)}`
                            : `✅ Hemat ${formatRupiah(Math.abs(diff))}`
                }
            </div>
        </div>
    );
}

// ─── Main Page ───
export default function AllocationPage() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const monthName = now.toLocaleString("id-ID", { month: "long", year: "numeric" });

    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRuleId, setSelectedRuleId] = useState<string>("50-30-20");
    const [customRule, setCustomRule] = useState({ needs: 50, wants: 30, savings: 20 });
    const [customError, setCustomError] = useState("");

    // Load dari localStorage
    useEffect(() => {
        const savedId = localStorage.getItem(LS_KEY_RULE);
        if (savedId) setSelectedRuleId(savedId);
        const savedCustom = localStorage.getItem(LS_KEY_CUSTOM);
        if (savedCustom) {
            try { setCustomRule(JSON.parse(savedCustom)); } catch { /* ignore */ }
        }
    }, []);

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/summary?month=${month}&year=${year}`);
            setSummary(await res.json());
        } catch {
            console.error("Gagal fetch summary");
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);

    // Pilih rule yang aktif
    const activeRule = selectedRuleId === "custom"
        ? { ...PRESET_RULES.find(r => r.id === "custom")!, ...customRule }
        : PRESET_RULES.find(r => r.id === selectedRuleId) ?? PRESET_RULES[0];

    const handleSelectRule = (id: string) => {
        setSelectedRuleId(id);
        localStorage.setItem(LS_KEY_RULE, id);
    };

    const handleCustomChange = (field: "needs" | "wants" | "savings", value: number) => {
        const updated = { ...customRule, [field]: value };
        setCustomRule(updated);
        const total = updated.needs + updated.wants + updated.savings;
        if (total !== 100) {
            setCustomError(`Total harus 100% (sekarang ${total}%)`);
        } else {
            setCustomError("");
            localStorage.setItem(LS_KEY_CUSTOM, JSON.stringify(updated));
        }
    };

    // Hitung alokasi berdasarkan data REAL per-bucket
    const income = summary?.totalIncome ?? 0;
    const alloc = summary?.allocationBreakdown ?? { Kebutuhan: 0, Keinginan: 0, Tabungan: 0 };

    const recNeeds = Math.round(income * activeRule.needs / 100);
    const recWants = Math.round(income * activeRule.wants / 100);
    const recSavings = Math.round(income * activeRule.savings / 100);

    const actualNeeds = alloc.Kebutuhan;
    const actualWants = alloc.Keinginan;
    const actualSavings = alloc.Tabungan;

    const isNeedsOver = actualNeeds > recNeeds;
    const isWantsOver = actualWants > recWants;

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Metode Alokasi</h1>
                <p className="page-subtitle">Atur keuangan lo pakai aturan yang terbukti · {monthName}</p>
            </div>

            {/* Rule Selector */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 12 }}>
                    Pilih Metode Alokasi
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: selectedRuleId === "custom" ? 16 : 0 }}>
                    {PRESET_RULES.map((rule) => (
                        <button
                            key={rule.id}
                            onClick={() => handleSelectRule(rule.id)}
                            id={`rule-${rule.id}`}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "var(--radius-md)",
                                border: selectedRuleId === rule.id
                                    ? "2px solid var(--accent-primary)"
                                    : "2px solid var(--border-color)",
                                background: selectedRuleId === rule.id
                                    ? "var(--accent-primary-light)"
                                    : "var(--bg-secondary)",
                                color: selectedRuleId === rule.id ? "var(--accent-primary)" : "var(--text-secondary)",
                                fontWeight: selectedRuleId === rule.id ? 700 : 500,
                                fontSize: 13,
                                cursor: "pointer",
                                transition: "all 0.15s",
                            }}
                        >
                            {rule.label}
                        </button>
                    ))}
                </div>

                {/* Description */}
                {selectedRuleId !== "custom" && (
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                        📐 {activeRule.description}
                    </div>
                )}

                {/* Custom Rule Inputs */}
                {selectedRuleId === "custom" && (
                    <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            {(["needs", "wants", "savings"] as const).map((field) => (
                                <div key={field} className="form-group" style={{ flex: 1, minWidth: 100, marginBottom: 0 }}>
                                    <label className="form-label" style={{ fontSize: 11 }}>
                                        {field === "needs" ? "🏠 Kebutuhan %" : field === "wants" ? "🎮 Keinginan %" : "💰 Tabungan %"}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="form-input"
                                        value={customRule[field]}
                                        onChange={(e) => handleCustomChange(field, parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            ))}
                        </div>
                        {customError && (
                            <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 8, fontWeight: 600 }}>
                                ⚠️ {customError}
                            </div>
                        )}
                        {!customError && (
                            <div style={{ color: "var(--success)", fontSize: 12, marginTop: 8, fontWeight: 600 }}>
                                ✅ Total 100% — valid!
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Income Banner */}
            {!loading && (
                <div style={{
                    background: "linear-gradient(135deg, var(--accent-primary), #6366f1)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px 24px",
                    marginBottom: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "#fff",
                }}>
                    <div>
                        <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Total Pemasukan Bulan Ini
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4, letterSpacing: "-0.5px" }}>
                            {formatRupiah(income)}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                            Dasar perhitungan alokasi {activeRule.label}
                        </div>
                    </div>
                    <div style={{ fontSize: 48, opacity: 0.4 }}>💰</div>
                </div>
            )}

            {/* Overview Rule Breakdown */}
            {!loading && income > 0 && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 14 }}>
                        Rincian Alokasi Ideal · {activeRule.label}
                    </div>
                    <div style={{ display: "flex", gap: 0 }}>
                        {[
                            { label: "Kebutuhan", pct: activeRule.needs, color: "#6366f1", amount: recNeeds },
                            { label: "Keinginan", pct: activeRule.wants, color: "#f59e0b", amount: recWants },
                            { label: "Tabungan", pct: activeRule.savings, color: "#10b981", amount: recSavings },
                        ].map((item, i, arr) => (
                            <div
                                key={item.label}
                                style={{
                                    flex: item.pct,
                                    background: item.color,
                                    padding: "10px 12px",
                                    borderRadius: i === 0 ? "var(--radius-md) 0 0 var(--radius-md)" : i === arr.length - 1 ? "0 var(--radius-md) var(--radius-md) 0" : "0",
                                    color: "#fff",
                                    minWidth: 0,
                                    overflow: "hidden",
                                }}
                            >
                                <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>{item.label}</div>
                                <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>{item.pct}%</div>
                                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
                                    {formatRupiah(item.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="budgets-grid">
                    {[1, 2].map(i => (
                        <div key={i} className="card" style={{ padding: 18 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                                    <div className="skeleton" style={{ width: "50%", height: 16, borderRadius: 4 }} />
                                    <div className="skeleton" style={{ width: "70%", height: 12, borderRadius: 4 }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <div className="skeleton" style={{ width: 50, height: 10, borderRadius: 4 }} />
                                    <div className="skeleton" style={{ width: 110, height: 20, borderRadius: 4 }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                                    <div className="skeleton" style={{ width: 70, height: 10, borderRadius: 4 }} />
                                    <div className="skeleton" style={{ width: 110, height: 20, borderRadius: 4 }} />
                                </div>
                            </div>
                            <div className="skeleton" style={{ width: "100%", height: 8, borderRadius: 99, marginBottom: 10 }} />
                            <div className="skeleton" style={{ width: 120, height: 12, borderRadius: 4 }} />
                        </div>
                    ))}
                </div>
            ) : income === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">💰</div>
                        <div className="empty-state-title">Belum ada pemasukan bulan ini</div>
                        <div className="empty-state-text">Catat pemasukan dulu baru bisa lihat rincian alokasi keuangan lo.</div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Bucket Cards — 3 Induk Alokasi */}
                    <div className="budgets-grid" style={{ marginBottom: 20, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                        <BucketCard
                            emoji="🏠"
                            label="Kebutuhan"
                            sublabel={`Biaya hidup wajib (${activeRule.needs}% ideal)`}
                            recommended={recNeeds}
                            actual={actualNeeds}
                            color="#6366f1"
                            isOver={isNeedsOver}
                        />
                        <BucketCard
                            emoji="🎮"
                            label="Keinginan"
                            sublabel={`Hobi, lifestyle, wishlist (${activeRule.wants}% ideal)`}
                            recommended={recWants}
                            actual={actualWants}
                            color="#f59e0b"
                            isOver={isWantsOver}
                        />
                        <BucketCard
                            emoji="💰"
                            label="Tabungan"
                            sublabel={`Dana darurat & simpanan (${activeRule.savings}% ideal)`}
                            recommended={recSavings}
                            actual={actualSavings}
                            color="#10b981"
                            isOver={false}
                            isSavings={true}
                        />
                    </div>

                    {/* Summary status */}
                    <div className="card" style={{
                        background: (!isNeedsOver && !isWantsOver)
                            ? "linear-gradient(135deg, #d1fae5, #a7f3d0)"
                            : "linear-gradient(135deg, #fef3c7, #fde68a)",
                        border: "none",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 32 }}>
                                {!isNeedsOver && !isWantsOver ? "🎉" : "⚠️"}
                            </span>
                            <div>
                                <div style={{
                                    fontWeight: 700,
                                    fontSize: 15,
                                    color: !isNeedsOver && !isWantsOver ? "#065f46" : "#92400e",
                                }}>
                                    {!isNeedsOver && !isWantsOver
                                        ? "Lo on track! Keuangan bulan ini sesuai metode " + activeRule.label
                                        : `Ada yang perlu diperbaiki — review pengeluaran lo, King`}
                                </div>
                                <div style={{
                                    fontSize: 13,
                                    marginTop: 4,
                                    color: !isNeedsOver && !isWantsOver ? "#047857" : "#b45309",
                                }}>
                                    {isNeedsOver && `Kebutuhan kelebihan ${formatRupiah(actualNeeds - recNeeds)} dari target. `}
                                    {isWantsOver && `Keinginan kelebihan ${formatRupiah(actualWants - recWants)} dari target. `}
                                    {!isNeedsOver && !isWantsOver && `Semua bucket alokasi lo sesuai target metode ${activeRule.label} bulan ini.`}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
