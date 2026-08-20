"use client";

// Savings Goals Page — tracking target tabungan
import { useEffect, useState, useCallback, useRef } from "react";
import anime from "animejs";

// ─── Types ───
interface SavingsGoal {
    id: number;
    name: string;
    icon: string;
    targetAmount: number;
    savedAmount: number;
    deadline: string | null;
    createdAt: string;
}

// ─── Helpers ───
function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDeadline(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function daysLeft(dateStr: string) {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Sudah lewat deadline";
    if (days === 0) return "Deadline hari ini!";
    return `${days} hari lagi`;
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
        }, 3200);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div ref={toastRef} className={`toast ${type}`}>
            <span>{type === "success" ? "✅" : "❌"}</span>
            <span>{message}</span>
        </div>
    );
}

// ─── Setor Modal ───
function SetorModal({
    goal,
    onClose,
    onSuccess,
}: {
    goal: SavingsGoal;
    onClose: () => void;
    onSuccess: (msg: string) => void;
}) {
    const [amount, setAmount] = useState("");
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

    const remaining = goal.targetAmount - goal.savedAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseInt(amount) <= 0) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/goals/${goal.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ addAmount: amount }),
            });
            if (!res.ok) throw new Error();
            onSuccess(`Setoran ${formatRupiah(parseInt(amount))} berhasil dicatat!`);
            onClose();
        } catch {
            onSuccess("Gagal catat setoran");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" ref={modalRef} style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{goal.icon} Setor ke "{goal.name}"</h2>
                    <button className="btn-icon" onClick={onClose} id="close-setor-modal">✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div style={{
                            padding: "12px 14px",
                            background: "var(--bg-secondary)",
                            borderRadius: "var(--radius-sm)",
                            marginBottom: 16,
                            fontSize: 13,
                        }}>
                            <div style={{ color: "var(--text-muted)" }}>Sisa yang perlu dikumpulkan:</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-primary)", marginTop: 2 }}>
                                {formatRupiah(remaining)}
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="setor-amount">Jumlah Setoran (Rp)</label>
                            <input
                                id="setor-amount"
                                type="number"
                                min="1"
                                max={remaining}
                                placeholder="Contoh: 500000"
                                className="form-input"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} id="submit-setor">
                            {loading ? "Menyimpan..." : "Catat Setoran"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Add Goal Modal ───
function AddGoalModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: (msg: string) => void;
}) {
    const [form, setForm] = useState({
        name: "",
        icon: "🎯",
        targetAmount: "",
        deadline: "",
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

    const iconOptions = ["🎯", "🏠", "✈️", "💻", "🚗", "📱", "👜", "🎓", "💍", "🏖️", "🎮", "💰"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.targetAmount) return;
        setLoading(true);
        try {
            const res = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            onSuccess("Goal berhasil dibuat! Semangat nabungnya 💪");
            onClose();
        } catch {
            onSuccess("Gagal buat goal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Buat Savings Goal</h2>
                    <button className="btn-icon" onClick={onClose} id="close-goal-modal">✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Icon Picker */}
                        <div className="form-group">
                            <label className="form-label">Icon</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {iconOptions.map((ic) => (
                                    <button
                                        key={ic}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, icon: ic }))}
                                        style={{
                                            fontSize: 22,
                                            padding: "6px 10px",
                                            borderRadius: "var(--radius-sm)",
                                            border: form.icon === ic ? "2px solid var(--accent-primary)" : "2px solid var(--border-color)",
                                            background: form.icon === ic ? "var(--accent-primary-light)" : "transparent",
                                            cursor: "pointer",
                                            lineHeight: 1,
                                        }}
                                    >
                                        {ic}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="goal-name">Nama Goal</label>
                            <input id="goal-name" type="text" placeholder="Contoh: Beli Laptop Gaming"
                                className="form-input" value={form.name}
                                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="goal-target">Target (Rp)</label>
                            <input id="goal-target" type="number" min="1" placeholder="Contoh: 15000000"
                                className="form-input" value={form.targetAmount}
                                onChange={(e) => setForm(p => ({ ...p, targetAmount: e.target.value }))} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="goal-deadline">Deadline (opsional)</label>
                            <input id="goal-deadline" type="date"
                                className="form-input" value={form.deadline}
                                onChange={(e) => setForm(p => ({ ...p, deadline: e.target.value }))} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} id="submit-goal">
                            {loading ? "Menyimpan..." : "Buat Goal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Goal Card ───
function GoalCard({
    goal,
    onSetor,
    onDelete,
}: {
    goal: SavingsGoal;
    onSetor: (goal: SavingsGoal) => void;
    onDelete: (id: number) => void;
}) {
    const pct = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
    const isDone = goal.savedAmount >= goal.targetAmount;

    return (
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            {/* Completed badge */}
            {isDone && (
                <div style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "var(--success)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 99,
                    letterSpacing: "0.5px",
                }}>
                    ✅ TERCAPAI!
                </div>
            )}

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius-md)",
                    background: "var(--accent-primary-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                }}>
                    {goal.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 2 }}>
                        {goal.name}
                    </div>
                    {goal.deadline && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            📅 {formatDeadline(goal.deadline)} · {daysLeft(goal.deadline)}
                        </div>
                    )}
                </div>
            </div>

            {/* Amounts */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                <div>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
                        Terkumpul
                    </div>
                    <div style={{ fontWeight: 700, color: "var(--accent-primary)", fontSize: 16, marginTop: 2 }}>
                        {formatRupiah(goal.savedAmount)}
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
                        Target
                    </div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 16, marginTop: 2 }}>
                        {formatRupiah(goal.targetAmount)}
                    </div>
                </div>
            </div>

            {/* Progress */}
            <div className="progress-bar" style={{ marginBottom: 14, height: 8 }}>
                <div
                    className={`progress-fill ${pct >= 100 ? "safe" : pct >= 60 ? "warning" : "danger"}`}
                    style={{ width: `${pct}%`, transition: "width 0.4s ease" }}
                />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: pct >= 100 ? "var(--success)" : "var(--text-muted)",
                }}>
                    {pct}% tercapai
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {!isDone && (
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => onSetor(goal)}
                            id={`setor-goal-${goal.id}`}
                        >
                            + Setor
                        </button>
                    )}
                    <button
                        className="btn-icon danger"
                        onClick={() => onDelete(goal.id)}
                        id={`delete-goal-${goal.id}`}
                        title="Hapus goal"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ───
export default function GoalsPage() {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [setorGoal, setSetorGoal] = useState<SavingsGoal | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => setToast({ msg, type });

    const fetchGoals = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/goals");
            setGoals(await res.json());
        } catch {
            showToast("Gagal memuat goals", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchGoals(); }, [fetchGoals]);

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            showToast("Goal dihapus");
            fetchGoals();
        } catch {
            showToast("Gagal hapus goal", "error");
        }
    };

    const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
    const completedCount = goals.filter(g => g.savedAmount >= g.targetAmount).length;

    return (
        <div>
            {/* Header */}
            <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                    <h1 className="page-title">Savings Goals</h1>
                    <p className="page-subtitle">Nabung punya tujuan, hidup lebih terarah</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)} id="add-goal-btn">
                    + Buat Goal
                </button>
            </div>

            {/* Summary */}
            {!loading && goals.length > 0 && (
                <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                    <div className="card" style={{ flex: 1, padding: "14px 18px" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Goal</div>
                        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{goals.length}</div>
                    </div>
                    <div className="card" style={{ flex: 1, padding: "14px 18px" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Sudah Tercapai</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--success)", marginTop: 4 }}>{completedCount}</div>
                    </div>
                    <div className="card" style={{ flex: 2, padding: "14px 18px" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Terkumpul / Target</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent-primary)", marginTop: 4 }}>
                            {formatRupiah(totalSaved)} <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 13 }}>dari</span> {formatRupiah(totalTarget)}
                        </div>
                    </div>
                </div>
            )}

            {/* Goals Grid */}
            {loading ? (
                <div className="budgets-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card" style={{ padding: 18 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                                    <div className="skeleton" style={{ width: "70%", height: 16, borderRadius: 4 }} />
                                    <div className="skeleton" style={{ width: "50%", height: 12, borderRadius: 4 }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 4 }} />
                                    <div className="skeleton" style={{ width: 100, height: 18, borderRadius: 4 }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                                    <div className="skeleton" style={{ width: 40, height: 10, borderRadius: 4 }} />
                                    <div className="skeleton" style={{ width: 100, height: 18, borderRadius: 4 }} />
                                </div>
                            </div>
                            <div className="skeleton" style={{ width: "100%", height: 8, borderRadius: 99, marginBottom: 14 }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 4 }} />
                                <div style={{ display: "flex", gap: 8 }}>
                                    <div className="skeleton" style={{ width: 70, height: 30, borderRadius: "var(--radius-sm)" }} />
                                    <div className="skeleton" style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)" }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !goals.length ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🏆</div>
                        <div className="empty-state-title">Belum ada savings goal</div>
                        <div className="empty-state-text">
                            Mau beli apa? Laptop? HP baru? Liburan? Set goalnya sekarang, nabung dikit-dikit.
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>
                            + Buat Goal Pertama
                        </button>
                    </div>
                </div>
            ) : (
                <div className="budgets-grid">
                    {goals.map((g) => (
                        <GoalCard
                            key={g.id}
                            goal={g}
                            onSetor={(goal) => setSetorGoal(goal)}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showAdd && (
                <AddGoalModal
                    onClose={() => setShowAdd(false)}
                    onSuccess={(msg) => { showToast(msg); fetchGoals(); }}
                />
            )}
            {setorGoal && (
                <SetorModal
                    goal={setorGoal}
                    onClose={() => setSetorGoal(null)}
                    onSuccess={(msg) => { showToast(msg); fetchGoals(); }}
                />
            )}

            {/* Toast */}
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
