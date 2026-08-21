"use client";

// Budgets Page — budget per kategori + progress bar
import { useEffect, useState, useCallback, useRef } from "react";
import anime from "animejs";

// ─── Types ───
interface Category {
    id: number;
    name: string;
    type: string;
    icon: string;
    color: string;
}

interface Budget {
    id: number;
    categoryId: number;
    limitAmount: number;
    month: number;
    year: number;
    spent: number;
    percentage: number;
    category: Category;
}

// ─── Helpers ───
function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function getProgressClass(pct: number) {
    if (pct >= 90) return "danger";
    if (pct >= 70) return "warning";
    return "safe";
}

// ─── Toast ───
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    const toastRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (toastRef.current) {
            anime({
                targets: toastRef.current,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                easing: 'easeOutExpo'
            });
        }
        const t = setTimeout(() => {
            if (toastRef.current) {
                anime({
                    targets: toastRef.current,
                    opacity: [1, 0],
                    translateY: [0, -20],
                    duration: 300,
                    easing: 'easeInExpo',
                    complete: onClose
                });
            } else {
                onClose();
            }
        }, 2700);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div ref={toastRef} className={`toast ${type}`}>
            <span>{type === "success" ? "✅" : "❌"}</span>
            <span>{message}</span>
        </div>
    );
}

// ─── Set Budget Modal ───
function SetBudgetModal({
    categories,
    existing,
    month,
    year,
    onClose,
    onSuccess,
}: {
    categories: Category[];
    existing?: Budget;
    month: number;
    year: number;
    onClose: () => void;
    onSuccess: (msg: string) => void;
}) {
    const [form, setForm] = useState({
        categoryId: existing?.categoryId ? String(existing.categoryId) : "",
        limitAmount: existing?.limitAmount ? String(existing.limitAmount) : "",
    });
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (modalRef.current) {
            anime({
                targets: modalRef.current,
                scale: [0.95, 1],
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutExpo'
            });
        }
    }, []);

    const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.categoryId || !form.limitAmount) return;
        setLoading(true);
        try {
            const res = await fetch("/api/budgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, month, year }),
            });
            if (!res.ok) throw new Error();
            onSuccess("Budget berhasil disimpan!");
            onClose();
        } catch {
            onSuccess("Gagal simpan budget");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{existing ? "Edit Budget" : "Set Budget Baru"}</h2>
                    <button className="btn-icon" onClick={onClose} id="close-budget-modal">✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label" htmlFor="budget-category">Kategori Pengeluaran</label>
                            <select
                                id="budget-category"
                                className="form-select"
                                value={form.categoryId}
                                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                                disabled={!!existing}
                                required
                            >
                                <option value="">Pilih kategori...</option>
                                {expenseCategories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="budget-limit">Batas Budget (Rp)</label>
                            <input
                                id="budget-limit"
                                type="text"
                                inputMode="numeric"
                                placeholder="Contoh: 800.000"
                                className="form-input"
                                value={form.limitAmount ? Number(form.limitAmount).toLocaleString('id-ID') : ""}
                                onChange={(e) => setForm((p) => ({ ...p, limitAmount: e.target.value.replace(/\D/g, "") }))}
                                required
                            />
                        </div>

                        <div style={{
                            padding: "12px",
                            background: "var(--accent-primary-light)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: 13,
                            color: "var(--accent-primary)"
                        }}>
                            💡 Budget ini berlaku untuk bulan ini. Setiap bulan bisa di-set ulang.
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} id="submit-budget">
                            {loading ? "Menyimpan..." : "Simpan Budget"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Page ───
export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [editBudget, setEditBudget] = useState<Budget | undefined>(undefined);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [bRes, cRes] = await Promise.all([
                fetch(`/api/budgets?month=${month}&year=${year}`),
                fetch("/api/categories"),
            ]);
            setBudgets(await bRes.json());
            setCategories(await cRes.json());
        } catch {
            showToast("Gagal memuat data", "error");
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const totalBudget = budgets.reduce((s, b) => s + b.limitAmount, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const monthName = now.toLocaleString("id-ID", { month: "long", year: "numeric" });

    return (
        <div>
            {/* Header */}
            <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                    <h1 className="page-title">Budget</h1>
                    <p className="page-subtitle">Kelola batas pengeluaran bulan {monthName}</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditBudget(undefined); setShowAdd(true); }} id="add-budget-btn">
                    + Set Budget
                </button>
            </div>

            {/* Overall Summary Card */}
            {!loading && budgets.length > 0 && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Total Budget Bulan Ini
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
                                {formatRupiah(totalBudget)}
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Terpakai
                            </div>
                            <div style={{
                                fontSize: 22,
                                fontWeight: 800,
                                marginTop: 4,
                                color: overallPct >= 90 ? "var(--danger)" : overallPct >= 70 ? "var(--warning)" : "var(--success)"
                            }}>
                                {formatRupiah(totalSpent)} <span style={{ fontSize: 14, fontWeight: 600 }}>({overallPct}%)</span>
                            </div>
                        </div>
                    </div>
                    <div className="progress-bar" style={{ height: 10 }}>
                        <div
                            className={`progress-fill ${getProgressClass(overallPct)}`}
                            style={{ width: `${Math.min(overallPct, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Budget Cards Grid */}
            {loading ? (
                <div className="budgets-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card" style={{ padding: 18 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                                    <div className="skeleton" style={{ width: 90, height: 16, borderRadius: 4 }} />
                                </div>
                                <div className="skeleton" style={{ width: 36, height: 16, borderRadius: 4 }} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 4 }} />
                                <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4 }} />
                            </div>
                            <div className="skeleton" style={{ width: "100%", height: 8, borderRadius: 99 }} />
                        </div>
                    ))}
                </div>
            ) : !budgets.length ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🎯</div>
                        <div className="empty-state-title">Belum ada budget</div>
                        <div className="empty-state-text">
                            Set budget biar lo tau kapan harus ngerem pengeluaran, ngab.
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>
                            + Set Budget Pertama
                        </button>
                    </div>
                </div>
            ) : (
                <div className="budgets-grid">
                    {budgets.map((b) => {
                        const pct = Math.min(b.percentage, 100);
                        const progressClass = getProgressClass(b.percentage);
                        return (
                            <div key={b.id} className="budget-card">
                                <div className="budget-header">
                                    <div className="budget-category">
                                        <span className="budget-icon">{b.category.icon}</span>
                                        <span className="budget-name">{b.category.name}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: b.percentage >= 90 ? "var(--danger)" : b.percentage >= 70 ? "var(--warning)" : "var(--success)"
                                        }}>
                                            {b.percentage}%
                                        </span>
                                        <button
                                            className="btn-icon"
                                            onClick={() => { setEditBudget(b); setShowAdd(true); }}
                                            title="Edit budget"
                                            id={`edit-budget-${b.id}`}
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                </div>

                                <div className="budget-amounts">
                                    <span>
                                        Terpakai: <span className="budget-spent">{formatRupiah(b.spent)}</span>
                                    </span>
                                    <span>Limit: {formatRupiah(b.limitAmount)}</span>
                                </div>

                                <div className="progress-bar">
                                    <div
                                        className={`progress-fill ${progressClass}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>

                                {b.percentage >= 90 && (
                                    <div style={{
                                        marginTop: 10,
                                        fontSize: 12,
                                        color: "var(--danger)",
                                        fontWeight: 500,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4
                                    }}>
                                        ⚠️ Budget hampir habis!
                                    </div>
                                )}
                                {b.percentage >= 100 && (
                                    <div style={{
                                        marginTop: 4,
                                        fontSize: 12,
                                        color: "var(--danger)",
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4
                                    }}>
                                        🚨 Budget udah kelewat batas!
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showAdd && (
                <SetBudgetModal
                    categories={categories}
                    existing={editBudget}
                    month={month}
                    year={year}
                    onClose={() => { setShowAdd(false); setEditBudget(undefined); }}
                    onSuccess={(msg) => {
                        showToast(msg);
                        fetchAll();
                    }}
                />
            )}

            {/* Toast */}
            {toast && (
                <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}
