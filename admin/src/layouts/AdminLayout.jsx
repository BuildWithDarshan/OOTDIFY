import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    BarChart3, BookOpenText, ChevronRight, ClipboardList,
    Compass, FolderHeart, LayoutDashboard, LogOut, Menu, Settings2,
    Shirt, Sparkles, Tags, UsersRound, X,
} from "lucide-react";
import { useAdminAuth } from "../context/useAdminAuth.js";

const groups = [
    { label: "Workspace", items: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/outfits", label: "Outfits", icon: Shirt },
        ...(import.meta.env.VITE_ENABLE_OUTFIT_ANALYZER === "true"
            ? [{ to: "/outfit-analyzer", label: "Outfit Analyzer", icon: Sparkles }]
            : []),
        { to: "/items", label: "Catalog items", icon: FolderHeart },
    ] },
    { label: "Editorial", items: [
        { to: "/trends", label: "Trends", icon: BarChart3 },
        { to: "/style-tips", label: "Styling tips", icon: BookOpenText },
        { to: "/occasions", label: "Occasions", icon: Compass },
        { to: "/outfit-types", label: "Outfit types", icon: Tags },
    ] },
    { label: "Administration", items: [
        { to: "/users", label: "Users", icon: UsersRound },
        { to: "/community-reports", label: "Community reports", icon: ClipboardList },
        { to: "/settings", label: "Settings", icon: Settings2 },
    ] },
];

const AdminLayout = () => {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return <div className="min-h-screen bg-[#f5f8f4] font-body text-green-900 lg:flex">
        {sidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-green-950/45 backdrop-blur-[2px] lg:hidden" />}

        <aside className={`fixed inset-y-0 left-0 z-40 flex w-[min(85vw,280px)] flex-col border-r border-green-100 bg-white shadow-2xl shadow-green-900/10 transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-[260px] lg:shrink-0 lg:translate-x-0 lg:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex items-center justify-between border-b border-green-100 px-5 py-5">
                <Link to="/dashboard" onClick={() => setSidebarOpen(false)} aria-label="OOTDIFY dashboard">
                    <img src="/ootdify-logo.png" alt="OOTDIFY" className="h-12 w-[155px] object-contain object-left" />
                </Link>
                <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close menu"
                    className="rounded-xl p-2 text-green-700 hover:bg-green-50 lg:hidden"><X size={20} /></button>
            </div>

            <nav aria-label="Admin navigation" className="mt-5 flex-1 space-y-5 overflow-y-auto px-3 pb-5">
                {groups.map((group) => <div key={group.label}>
                    <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-green-500">{group.label}</p>
                    <div className="space-y-1">
                        {group.items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? "bg-green-700 text-white shadow-sm" : "text-green-700 hover:bg-green-50 hover:text-green-900"}`}>
                            {({ isActive }) => <>
                                <Icon size={17} strokeWidth={1.9} className="shrink-0" />
                                <span className="min-w-0 flex-1 truncate">{label}</span>
                                {isActive && <ChevronRight size={15} className="shrink-0 text-green-200" />}
                            </>}
                        </NavLink>)}
                    </div>
                </div>)}
            </nav>

            <div className="border-t border-green-100 p-4">
                <div className="flex items-center gap-3 rounded-2xl bg-[#f5f8f4] p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-700 text-sm font-bold text-white">{admin?.name?.[0]?.toUpperCase() || "A"}</span>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-green-900">{admin?.name || "Admin"}</p><p className="truncate text-xs text-green-600">Administrator</p></div>
                </div>
                <button type="button" onClick={handleLogout} className="mt-2 inline-flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"><LogOut size={17} /> Log out</button>
            </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
            <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"
                className="fixed bottom-5 left-5 z-20 inline-flex items-center gap-2 rounded-full bg-green-800 px-4 py-3 text-sm font-semibold text-white shadow-xl lg:hidden"><Menu size={18} /> Menu</button>
            <main className="min-w-0 flex-1 px-4 py-6 pb-20 sm:px-7 lg:px-9 lg:py-8"><div className="mx-auto max-w-[1440px]"><Outlet /></div></main>
        </div>
    </div>;
};

export default AdminLayout;
