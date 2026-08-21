"use client";

import { useEffect, useState, useRef } from "react";
import anime from "animejs";

export function AddCategoryModal({
    onClose,
    onSuccess,
    initialType = "EXPENSE",
}: {
    onClose: () => void;
    onSuccess: (msg: string) => void;
    initialType?: string;
}) {
    const [form, setForm] = useState({
        name: "",
        type: initialType,
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
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
            <div className="modal" ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Buat Kategori Baru</h2>
                    <button className="btn-icon" onClick={onClose}>✕</button>
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
                            <input id="cat-name" type="text" placeholder="Contoh: Makan, Gaji"
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
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan Kategori"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
