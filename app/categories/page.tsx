"use client";

// Master Data Kategori Page
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

// ─── Add Category Modal ───
function AddCategoryModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: (msg: string) => void;
}) {
    const [form, setForm] = useState({
        name: "",
        type: "EXPENSE",
        icon: "🍔",
        color: "#f4845f",
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

    const iconOptions = ["🍔", "🛒", "⛽", "🏥", "📚", "🎮", "👗", "💸", "💡", "✈️", "🎁", "💼"];
    const colorOptions = ["#f4845f", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;
        setLoading(true);
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            onSuccess("Kategori berhasil ditambahkan!");
            onClose();
        } catch {
            onSuccess("Gagal nambah kategori");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Buat Kategori Baru</h2>
                    <button className="btn-icon" onClick={onClose} id="close-category-modal">✕</button>
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
                                        onClick={() => setForm((p) => ({ ...p, type: t }))}
                                    >
                                        {t === "INCOME" ? "💚 Pemasukan" : "❤️ Pengeluaran"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nama */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="cat-name">Nama Kategori</label>
                            <input id="cat-name" type="text" placeholder="Contoh: Makanan, Bensin, Gaji"
                                className="form-input" value={form.name}
                                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
                        </div>

                        {/* Icon Picker */}
                        <div className="form-group">
                            <label className="form-label">Pilih Icon</label>
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

                        {/* Color Picker */}
                        <div className="form-group">
                            <label className="form-label">Pilih Warna</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {colorOptions.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, color: c }))}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            border: form.color === c ? "3px solid var(--text-primary)" : "2px solid transparent",
                                            background: c,
                                            cursor: "pointer",
                                            boxShadow: form.color === c ? "0 0 0 2px var(--bg-primary)" : "none",
                                        }}
                                        aria-label={`Pilih warna ${c}`}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} id="submit-category">
                            {loading ? "Menyimpan..." : "Simpan Kategori"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Page ───
export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => setToast({ msg, type });

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/categories");
            setCategories(await res.json());
        } catch {
            showToast("Gagal memuat kategori", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const incomeCats = categories.filter(c => c.type === "INCOME");
    const expenseCats = categories.filter(c => c.type === "EXPENSE");

    return (
        <div>
            {/* Header */}
            <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                    <h1 className="page-title">Master Data Kategori</h1>
                    <p className="page-subtitle">Atur pos-pos keuangan lo di sini</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)} id="add-category-btn">
                    + Kategori Baru
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {[1, 2].map(section => (
                        <div key={section}>
                            <div className="skeleton" style={{ width: 150, height: 24, borderRadius: 4, marginBottom: 16 }} />
                            <div className="budgets-grid">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
                                        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: "50%" }} />
                                        <div className="skeleton" style={{ flex: 1, height: 16, borderRadius: 4 }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    
                    {/* Pengeluaran Section */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: 20 }}>❤️</span>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>Kategori Pengeluaran</h2>
                            <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 8, fontWeight: 600 }}>({expenseCats.length})</span>
                        </div>
                        <div className="budgets-grid">
                            {expenseCats.map(c => (
                                <div key={c.id} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: "50%", background: c.color + "22",
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0
                                    }}>
                                        {c.icon}
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                                        {c.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pemasukan Section */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: 20 }}>💚</span>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>Kategori Pemasukan</h2>
                            <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 8, fontWeight: 600 }}>({incomeCats.length})</span>
                        </div>
                        <div className="budgets-grid">
                            {incomeCats.map(c => (
                                <div key={c.id} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: "50%", background: c.color + "22",
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0
                                    }}>
                                        {c.icon}
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                                        {c.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}

            {/* Modal */}
            {showAdd && (
                <AddCategoryModal
                    onClose={() => setShowAdd(false)}
                    onSuccess={(msg) => { showToast(msg); fetchCategories(); }}
                />
            )}

            {/* Toast */}
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
