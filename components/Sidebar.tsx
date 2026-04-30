"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";

const navItems = [
    { href: "/", icon: "📊", label: "Dashboard" },
    { href: "/transactions", icon: "💸", label: "Transaksi" },
    { href: "/budgets", icon: "🎯", label: "Budget" },
    { href: "/allocation", icon: "⚖️", label: "Alokasi" },
    { href: "/recurring", icon: "🔁", label: "Rutin" },
    { href: "/goals", icon: "🏆", label: "Goals" },
];

// ─── Real-time Clock ───
function LiveClock() {
    const [now, setNow] = useState<Date | null>(null);

    // Render hanya di client untuk hindari hydration mismatch
    useEffect(() => {
        setNow(new Date());
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    if (!now) return null;

    const timeStr = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const dateStr = now.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div style={{
            padding: "12px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            marginBottom: 12,
            textAlign: "center",
        }}>
            <div style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--accent-primary)",
                letterSpacing: "0.5px",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
            }}>
                {timeStr}
            </div>
            <div style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 4,
                fontWeight: 500,
            }}>
                {dateStr}
            </div>
        </div>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        // Load collapsed state from localStorage if available
        const saved = localStorage.getItem("sidebarCollapsed");
        if (saved) setIsCollapsed(saved === "true");
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => {
            const newVal = !prev;
            localStorage.setItem("sidebarCollapsed", String(newVal));
            // Trigger custom event to notify main-content margin change
            window.dispatchEvent(new CustomEvent("sidebarToggle", { detail: newVal }));
            return newVal;
        });
    };

    return (
        <>
            {/* Top Bar for Mobile */}
            <header className="mobile-topbar hidden-desktop">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">💰</div>
                    <div className="sidebar-logo-text">
                        Duit<span>Ku</span>
                    </div>
                </div>
                <button
                    className="theme-toggle-icon"
                    onClick={toggleTheme}
                    aria-label="Toggle dark mode"
                >
                    {theme === "dark" ? "☀️" : "🌙"}
                </button>
            </header>

            <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
                <div className="sidebar-logo hidden-mobile" onClick={toggleSidebar} style={{ cursor: "pointer" }}>
                    <div className="sidebar-logo-icon">💰</div>
                    <div className="sidebar-logo-text">
                        Duit<span>Ku</span>
                    </div>
                </div>
                
                {/* Arrow Toggle Button */}
                <button 
                    className="sidebar-toggle hidden-mobile" 
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    {isCollapsed ? "»" : "«"}
                </button>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-link ${pathname === item.href ? "active" : ""} ${isCollapsed ? "collapsed-link" : ""}`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <span className="nav-link-icon">{item.icon}</span>
                            <span className="nav-link-text">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer hidden-mobile">
                    <div className="clock-wrapper">
                        <LiveClock />
                    </div>
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle dark mode"
                        id="theme-toggle-btn"
                        title={isCollapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
                    >
                        <span>{theme === "dark" ? "☀️" : "🌙"}</span>
                        <span className="theme-toggle-text">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
