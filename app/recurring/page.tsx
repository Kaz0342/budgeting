"use client";

// Recurring Transactions Page — manage tagihan/pemasukan rutin bulanan
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

interface RecurringTransaction {
    id: number;
    amount: number;
    type: string;
    description: string;
    categoryId: number;
    dayOfMonth: number;
    isActive: boolean;
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

function ordinalDay(day: number) {
    return `Setiap tanggal ${day}`;
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

// ─── Add Modal ───
function AddRecurringModal({
    categories,
    onClose,
    onSuccess,
}: {
    categories: Category[];
    onClose: () => void;
    onSuccess: (msg: string) => void;
}) {
    const [form, setForm] = useState({
        type: "EXPENSE",
        amount: "",
        description: "",
        categoryId: "",
        dayOfMonth: "1",
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

    const filteredCats = categories.filter((c) => c.type === form.type);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value, ...(name === "type" ? { categoryId: "" } : {}) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.amount || !form.description || !form.categoryId) return;
        setLoading(true);
        try {
            const res = await fetch("/api/recurring", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            onSuccess("Transaksi rutin berhasil ditambahkan!");
            onClose();
        } catch {
            onSuccess("Gagal tambah transaksi rutin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Tambah Transaksi Rutin</h2>
                    <button className="btn-icon" onClick={onClose} id="close-recurring-modal">✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* Type Toggle */}
                        <div className="form-group">
                            <label className="form-label">Jenis</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                {["EXPENSE", "INCOME"].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        className={`btn ${form.type === t ? (t === "INCOME" ? "btn-primary" : "btn-danger") : "btn-secondary"}`}
                                        style={{ flex: 1, justifyContent: "center", ...(form.type === t && t === "INCOME" ? { background: "var(--income-color)" } : {}) }}
                                        onClick={() => setForm((p) => ({ ...p, type: t, categoryId: "" }))}
                                    >
                                        {t === "INCOME" ? "💚 Pemasukan" : "❤️ Pengeluaran"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="rec-amount">Jumlah (Rp)</label>
                            <input id="rec-amount" name="amount" type="number" min="1" placeholder="Contoh: 150000"
                                className="form-input" value={form.amount} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="rec-desc">Keterangan</label>
                            <input id="rec-desc" name="description" type="text" placeholder="Contoh: Langganan Netflix"
                                className="form-input" value={form.description} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="rec-category">Kategori</label>
                            <select id="rec-category" name="categoryId" className="form-select"
                                value={form.categoryId} onChange={handleChange} required>
                                <option value="">Pilih kategori...</option>
                                {filteredCats.map((c) => (
                                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="rec-day">Tanggal Setiap Bulan</label>
                            <input id="rec-day" name="dayOfMonth" type="number" min="1" max="28"
                                className="form-input" value={form.dayOfMonth} onChange={handleChange} required />
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                                Pilih 1-28 biar aman untuk semua bulan
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} id="submit-recurring">
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Page ───
export default function RecurringPage() {
    const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [applying, setApplying] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const monthName = now.toLocaleString("id-ID", { month: "long", year: "numeric" });

    const showToast = (msg: string, type: "success" | "error" = "success") => setToast({ msg, type });

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [rRes, cRes] = await Promise.all([
                fetch("/api/recurring"),
                fetch("/api/categories"),
            ]);
            setRecurrings(await rRes.json());
            setCategories(await cRes.json());
        } catch {
            showToast("Gagal memuat data", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Toggle aktif/nonaktif
    const handleToggle = async (r: RecurringTransaction) => {
        try {
            const res = await fetch(`/api/recurring/${r.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !r.isActive }),
            });
            if (!res.ok) throw new Error();
            showToast(r.isActive ? "Dinonaktifkan" : "Diaktifkan kembali");
            fetchAll();
        } catch {
            showToast("Gagal update status", "error");
        }
    };

    // Hapus recurring
    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            showToast("Transaksi rutin dihapus");
            fetchAll();
        } catch {
            showToast("Gagal hapus", "error");
        }
    };

    // Apply ke bulan ini
    const handleApply = async () => {
        setApplying(true);
        try {
            const res = await fetch(`/api/recurring/apply?month=${month}&year=${year}`, { method: "POST" });
            if (!res.ok) throw new Error();
            const data = await res.json();
            showToast(data.message ?? "Berhasil di-apply!");
        } catch {
            showToast("Gagal apply recurring", "error");
        } finally {
            setApplying(false);
        }
    };

    const activeCount = recurrings.filter(r => r.isActive).length;
    const totalMonthly = recurrings
        .filter(r => r.isActive && r.type === "EXPENSE")
        .reduce((s, r) => s + r.amount, 0);

    return (
        <div>
            {/* Header */}
            <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                    <h1 className="page-title">Transaksi Rutin</h1>
                    <p className="page-subtitle">Tagihan & pemasukan otomatis setiap bulan</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        className="btn btn-secondary"
                        onClick={handleApply}
                        disabled={applying || activeCount === 0}
                        id="apply-recurring-btn"
                    >
                        {applying ? "⏳ Applying..." : `🔄 Apply ${monthName}`}
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAdd(true)} id="add-recurring-btn">
                        + Tambah
                    </button>
                </div>
            </div>

            {/* Summary Mini Cards */}
            {!loading && (
                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                    <div className="card" style={{ flex: 1, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>🔁</span>
                        <div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Aktif</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{activeCount}</div>
                        </div>
                    </div>
                    <div className="card" style={{ flex: 2, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>❤️</span>
                        <div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Pengeluaran Rutin / Bulan</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--expense-color)" }}>{formatRupiah(totalMonthly)}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Banner */}
            <div style={{
                background: "var(--accent-primary-light)",
                border: "1px solid var(--accent-primary)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                fontSize: 13,
                color: "var(--accent-primary)",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
            }}>
                💡 Klik <strong>"Apply {monthName}"</strong> untuk generate transaksi dari semua entri rutin aktif ke bulan ini. Transaksi yang sudah ada tidak akan di-duplikat.
            </div>

            {/* List */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                            <div className="skeleton" style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0 }} />
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                                <div className="skeleton" style={{ width: "60%", height: 14, borderRadius: 4 }} />
                                <div className="skeleton" style={{ width: "40%", height: 12, borderRadius: 4 }} />
                            </div>
                            <div className="skeleton" style={{ width: 100, height: 16, borderRadius: 4, flexShrink: 0 }} />
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)" }} />
                                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)" }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : !recurrings.length ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🔁</div>
                        <div className="empty-state-title">Belum ada transaksi rutin</div>
                        <div className="empty-state-text">Tambah tagihan bulanan (listrik, internet, dll) biar nggak lupa input tiap bulan, ngab.</div>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>
                            + Tambah Pertama
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {recurrings.map((r) => (
                        <div key={r.id} className="card" style={{
                            padding: "14px 18px",
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            opacity: r.isActive ? 1 : 0.55,
                            transition: "opacity 0.2s",
                        }}>
                            {/* Icon */}
                            <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: "50%",
                                background: r.category.color + "22",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 20,
                                flexShrink: 0,
                            }}>
                                {r.category.icon}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>
                                    {r.description}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                    {r.category.name} · {ordinalDay(r.dayOfMonth)}
                                    {!r.isActive && <span style={{ marginLeft: 8, color: "var(--text-muted)", fontStyle: "italic" }}>(nonaktif)</span>}
                                </div>
                            </div>

                            {/* Amount */}
                            <div style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: r.type === "INCOME" ? "var(--income-color)" : "var(--expense-color)",
                                flexShrink: 0,
                            }}>
                                {r.type === "INCOME" ? "+" : "-"}{formatRupiah(r.amount)}
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleToggle(r)}
                                    id={`toggle-recurring-${r.id}`}
                                    title={r.isActive ? "Nonaktifkan" : "Aktifkan"}
                                    style={{ fontSize: 16, padding: "4px 8px" }}
                                >
                                    {r.isActive ? "⏸️" : "▶️"}
                                </button>
                                <button
                                    className="btn-icon danger"
                                    onClick={() => handleDelete(r.id)}
                                    id={`delete-recurring-${r.id}`}
                                    title="Hapus"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showAdd && (
                <AddRecurringModal
                    categories={categories}
                    onClose={() => setShowAdd(false)}
                    onSuccess={(msg) => { showToast(msg); fetchAll(); }}
                />
            )}

            {/* Toast */}
            {toast && (
                <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}
