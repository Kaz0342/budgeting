"use client";

import { useEffect, useState, useRef } from "react";
import anime from "animejs";

interface Category {
    id: number;
    name: string;
    type: string;
    icon: string;
    color: string;
}

export function ManageCategoriesModal({
    categories,
    onClose,
    onSuccess,
}: {
    categories: Category[];
    onClose: () => void;
    onSuccess: (msg: string) => void;
}) {
    // Mode: "list" | "add" | "edit"
    const [mode, setMode] = useState<"list" | "add" | "edit">("list");
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState({ name: "", type: "EXPENSE", icon: "🍔", color: "#f4845f" });
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (modalRef.current) {
            anime({ targets: modalRef.current, scale: [0.95, 1], opacity: [0, 1], duration: 300, easing: 'easeOutExpo' });
        }
    }, []);

    const iconOptions = ["🍔", "🛒", "⛽", "🏥", "📚", "🎮", "👗", "💸", "💡", "✈️", "🎁", "💼", "💰", "🏠", "🚗", "📱"];
    const colorOptions = ["#f4845f", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;
        setLoading(true);
        try {
            const url = mode === "edit" ? `/api/categories/${editId}` : "/api/categories";
            const method = mode === "edit" ? "PATCH" : "POST";
            
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            onSuccess(mode === "edit" ? "Kategori diperbarui!" : "Kategori ditambahkan!");
            setMode("list");
        } catch {
            onSuccess("Gagal menyimpan kategori");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        // Karena modal pakai z-index tinggi, custom modal lebih baik, tapi confirm browser cukup aman di sini.
        if (!confirm("Yakin mau hapus kategori ini? Jika kategori sudah dipakai, penghapusan akan gagal.")) return;
        try {
            const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Gagal menghapus");
                return;
            }
            onSuccess("Kategori dihapus!");
        } catch {
            onSuccess("Gagal menghapus kategori");
        }
    };

    const openEdit = (c: Category) => {
        setForm({ name: c.name, type: c.type, icon: c.icon, color: c.color });
        setEditId(c.id);
        setMode("edit");
    };

    const openAdd = () => {
        setForm({ name: "", type: "EXPENSE", icon: "🍔", color: "#f4845f" });
        setMode("add");
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {mode === "list" ? "Kelola Kategori" : mode === "add" ? "Tambah Kategori" : "Edit Kategori"}
                    </h2>
                    <button className="btn-icon" onClick={() => mode === "list" ? onClose() : setMode("list")}>
                        {mode === "list" ? "✕" : "←"}
                    </button>
                </div>

                {mode === "list" ? (
                    <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                        <button className="btn btn-primary" style={{ width: "100%", marginBottom: 16 }} onClick={openAdd}>
                            + Kategori Baru
                        </button>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {categories.map(c => (
                                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                            {c.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{c.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <button className="btn-icon" style={{ fontSize: 14 }} onClick={() => openEdit(c)}>✏️</button>
                                        <button className="btn-icon danger" style={{ fontSize: 14 }} onClick={() => handleDelete(c.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSave}>
                        <div className="modal-body">
                            {/* Type Toggle */}
                            <div className="form-group">
                                <label className="form-label">Jenis</label>
                                <div style={{ display: "flex", gap: 8 }}>
                                    {["EXPENSE", "INCOME"].map((t) => (
                                        <button
                                            key={t} type="button"
                                            className={`btn ${form.type === t ? (t === "INCOME" ? "btn-primary" : "btn-danger") : "btn-secondary"}`}
                                            style={{ flex: 1, justifyContent: "center", ...(form.type === t && t === "INCOME" ? { background: "var(--income-color)" } : {}) }}
                                            onClick={() => setForm((p) => ({ ...p, type: t }))}
                                        >
                                            {t === "INCOME" ? "💚 Pemasukan" : "❤️ Pengeluaran"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nama Kategori</label>
                                <input type="text" className="form-input" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pilih Icon</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {iconOptions.map((ic) => (
                                        <button key={ic} type="button" onClick={() => setForm(p => ({ ...p, icon: ic }))} style={{ fontSize: 22, padding: "6px 10px", borderRadius: "var(--radius-sm)", border: form.icon === ic ? "2px solid var(--accent-primary)" : "2px solid var(--border-color)", background: form.icon === ic ? "var(--accent-primary-light)" : "transparent", cursor: "pointer", lineHeight: 1 }}>{ic}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pilih Warna</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {colorOptions.map((c) => (
                                        <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 32, height: 32, borderRadius: "50%", border: form.color === c ? "3px solid var(--text-primary)" : "2px solid transparent", background: c, cursor: "pointer", boxShadow: form.color === c ? "0 0 0 2px var(--bg-primary)" : "none" }} aria-label={c} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setMode("list")}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Menyimpan..." : "Simpan"}</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
