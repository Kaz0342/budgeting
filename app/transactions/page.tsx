"use client";

// Transactions Page — full list, filter, add/delete modal
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

interface Transaction {
    id: number;
    amount: number;
    type: string;
    description: string;
    date: string;
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

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
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

// ─── Add Transaction Modal ───
function AddTransactionModal({
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
        date: new Date().toISOString().split("T")[0],
        categoryId: "",
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
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            onSuccess("Transaksi berhasil ditambahkan!");
            onClose();
        } catch {
            onSuccess("Gagal tambah transaksi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Tambah Transaksi</h2>
                    <button className="btn-icon" onClick={onClose} id="close-add-modal">✕</button>
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
                                        id={`type-${t.toLowerCase()}`}
                                    >
                                        {t === "INCOME" ? "💚 Pemasukan" : "❤️ Pengeluaran"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="amount">Jumlah (Rp)</label>
                            <input
                                id="amount"
                                name="amount"
                                type="number"
                                min="1"
                                placeholder="Contoh: 85000"
                                className="form-input"
                                value={form.amount}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="description">Keterangan</label>
                            <input
                                id="description"
                                name="description"
                                type="text"
                                placeholder="Contoh: Makan siang"
                                className="form-input"
                                value={form.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="categoryId">Kategori</label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                className="form-select"
                                value={form.categoryId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Pilih kategori...</option>
                                {filteredCats.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.icon} {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="date">Tanggal</label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                className="form-input"
                                value={form.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} id="submit-transaction">
                            {loading ? "Menyimpan..." : "Simpan Transaksi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ───
function DeleteModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" ref={modalRef} style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Hapus Transaksi?</h2>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                    Transaksi ini akan dihapus permanen dan tidak bisa dibatalkan.
                </p>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Batal</button>
                    <button className="btn btn-danger" onClick={onConfirm} id="confirm-delete">Hapus</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ───
export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [filterType, setFilterType] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    const now = new Date();
    const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1));
    const [filterYear] = useState(String(now.getFullYear()));

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterType) params.set("type", filterType);
        if (filterCategory) params.set("categoryId", filterCategory);
        if (filterMonth) {
            params.set("month", filterMonth);
            params.set("year", filterYear);
        }
        try {
            const [tRes, cRes] = await Promise.all([
                fetch(`/api/transactions?${params}`),
                fetch("/api/categories"),
            ]);
            const tData = await tRes.json();
            const cData = await cRes.json();
            setTransactions(Array.isArray(tData) ? tData : []);
            setCategories(Array.isArray(cData) ? cData : []);
        } catch {
            showToast("Gagal memuat data", "error");
        } finally {
            setLoading(false);
        }
    }, [filterType, filterCategory, filterMonth, filterYear]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/transactions/${deleteId}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            showToast("Transaksi dihapus");
            setDeleteId(null);
            fetchAll();
        } catch {
            showToast("Gagal hapus transaksi", "error");
        }
    };

    const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

    const months = [
        { v: "1", l: "Januari" }, { v: "2", l: "Februari" }, { v: "3", l: "Maret" },
        { v: "4", l: "April" }, { v: "5", l: "Mei" }, { v: "6", l: "Juni" },
        { v: "7", l: "Juli" }, { v: "8", l: "Agustus" }, { v: "9", l: "September" },
        { v: "10", l: "Oktober" }, { v: "11", l: "November" }, { v: "12", l: "Desember" },
    ];

    return (
        <div>
            {/* Header */}
            <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                    <h1 className="page-title">Transaksi</h1>
                    <p className="page-subtitle">Catat setiap pemasukan dan pengeluaran lo</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <a
                        href={`/api/export?month=${filterMonth}&year=${filterYear}`}
                        className="btn btn-secondary"
                        id="export-csv-btn"
                        download
                    >
                        ⬇️ Export CSV
                    </a>
                    <button className="btn btn-primary" onClick={() => setShowAdd(true)} id="add-transaction-btn">
                        + Tambah Transaksi
                    </button>
                </div>
            </div>

            {/* Summary Row */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div className="card" style={{ flex: 1, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>💚</span>
                    <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Pemasukan</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--income-color)" }}>{formatRupiah(totalIncome)}</div>
                    </div>
                </div>
                <div className="card" style={{ flex: 1, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>❤️</span>
                    <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Pengeluaran</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--expense-color)" }}>{formatRupiah(totalExpense)}</div>
                    </div>
                </div>
                <div className="card" style={{ flex: 1, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>💜</span>
                    <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Selisih</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--balance-color)" }}>{formatRupiah(totalIncome - totalExpense)}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <select className="form-select" style={{ width: "auto", minWidth: 130 }} value={filterType} onChange={(e) => setFilterType(e.target.value)} id="filter-type">
                    <option value="">Semua Jenis</option>
                    <option value="INCOME">Pemasukan</option>
                    <option value="EXPENSE">Pengeluaran</option>
                </select>
                <select className="form-select" style={{ width: "auto", minWidth: 160 }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} id="filter-category">
                    <option value="">Semua Kategori</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                </select>
                <select className="form-select" style={{ width: "auto", minWidth: 130 }} value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} id="filter-month">
                    {months.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                </select>
                {(filterType || filterCategory) && (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setFilterType(""); setFilterCategory(""); }}>
                        Reset Filter
                    </button>
                )}
            </div>

            {/* Transactions List */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Table Header */}
                <div className="table-header">
                    <div className="table-row" style={{ padding: "12px 16px" }}>
                        <div />
                        <div>Keterangan</div>
                        <div>Kategori</div>
                        <div>Tanggal</div>
                        <div>Jumlah</div>
                        <div style={{ textAlign: "center" }}>Aksi</div>
                    </div>
                </div>

                {/* Rows */}
                {loading ? (
                    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="skeleton" style={{ height: 40 }} />
                        ))}
                    </div>
                ) : !transactions.length ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💸</div>
                        <div className="empty-state-title">Nggak ada transaksi</div>
                        <div className="empty-state-text">Belum ada transaksi yang cocok sama filter yang lo pilih</div>
                    </div>
                ) : (
                    <div className="transactions-full-list">
                        {transactions.map((t) => (
                            <div key={t.id} className="table-row" style={{ borderBottom: "1px solid var(--border-color)" }}>
                                <div className="transaction-icon" style={{ width: 36, height: 36, fontSize: 16 }}>
                                    {t.category.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{t.description}</div>
                                </div>
                                <div>
                                    <span className="badge" style={{ background: t.category.color + "22", color: t.category.color }}>
                                        {t.category.name}
                                    </span>
                                </div>
                                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{formatDate(t.date)}</div>
                                <div className={`transaction-amount ${t.type.toLowerCase()}`} style={{ fontSize: 14 }}>
                                    {t.type === "INCOME" ? "+" : "-"}{formatRupiah(t.amount)}
                                </div>
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <button
                                        className="btn-icon danger"
                                        onClick={() => setDeleteId(t.id)}
                                        title="Hapus"
                                        id={`delete-${t.id}`}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAdd && (
                <AddTransactionModal
                    categories={categories}
                    onClose={() => setShowAdd(false)}
                    onSuccess={(msg) => {
                        showToast(msg);
                        fetchAll();
                    }}
                />
            )}
            {deleteId && (
                <DeleteModal onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
            )}

            {/* Toast */}
            {toast && (
                <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}
