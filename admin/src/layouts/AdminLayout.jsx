import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/outfits", label: "Outfits" },
    { to: "/items", label: "Items" },
    { to: "/trends", label: "Trends" },
    { to: "/style-tips", label: "Style Tips" },
    { to: "/occasions", label: "Occasions" },
    { to: "/outfit-types", label: "Outfit Types" },
    { to: "/users", label: "Users" },
    { to: "/settings", label: "Settings"},
];

const AdminLayout = () => {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Sidebar is a slide-in drawer on mobile/tablet, permanently visible on desktop.
    // Closed by default on small screens so it never blocks content on first load.
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const currentLabel = navItems.find((item) => item.to === location.pathname)?.label ?? "Menu";

    return (
        <div className="min-h-screen flex bg-bg font-body">
            {/* Overlay behind the drawer on mobile/tablet — click to close */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — fixed drawer on mobile/tablet, static column on desktop (lg+) */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 lg:w-60 border-r border-border
                    flex flex-col bg-bg transform transition-transform duration-200 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                    <span className="font-display text-2xl text-text-primary">OOTDIFY</span>
                    <button
                        className="lg:hidden text-text-secondary"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `block px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive
                                        ? "bg-accent-subtle text-accent-hover font-medium"
                                        : "text-text-secondary hover:bg-bg-subtle"
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main content — full width on mobile, offset by sidebar width on desktop */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            className="lg:hidden text-text-primary text-xl leading-none"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            ☰
                        </button>
                        <span className="text-sm text-text-secondary truncate hidden sm:inline">
                            Welcome back, <span className="text-text-primary font-medium">{admin?.name}</span>
                        </span>
                        <span className="text-sm font-medium text-text-primary sm:hidden">
                            {currentLabel}
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-text-secondary hover:text-accent-hover transition-colors shrink-0 cursor-pointer"
                    >
                        Log out
                    </button>
                </header>

                {/* Routed page content renders here */}
                <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;