import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Compass, Plus, Shirt, UserRound, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const CommunityActionDock = () => {
    const { user, isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);
    const dockRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const closeOnOutsideClick = (event) => {
            if (!dockRef.current?.contains(event.target)) setOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("pointerdown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [open]);

    const actions = [
        {
            to: "/community/create",
            label: "Create your own outfit",
            icon: Shirt,
            primary: true,
        },
        {
            to: "/community",
            label: "Discover outfits",
            icon: Compass,
        },
        {
            to:
                isAuthenticated && user?.id
                    ? `/community/creator/${user.id}`
                    : "/login",
            label: "Creator profile",
            icon: UserRound,
        },
    ];

    return (
        <div
            ref={dockRef}
            className="fixed bottom-5 right-[5px] z-[60]"
        >
            <div
                id="community-action-menu"
                aria-hidden={!open}
                className={`absolute bottom-0 right-full mr-3 flex min-w-max flex-col items-end gap-2 transition-all duration-200 ${
                    open
                        ? "translate-x-0 scale-100 opacity-100"
                        : "pointer-events-none translate-x-2 scale-95 opacity-0"
                }`}
            >
                {actions.map(({ to, label, icon: Icon, primary }) => (
                    <Link
                        key={label}
                        to={to}
                        tabIndex={open ? 0 : -1}
                        onClick={() => setOpen(false)}
                        className={`inline-flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                            primary
                                ? "bg-text-primary text-bg hover:bg-accent-hover"
                                : "border border-border bg-bg text-text-primary hover:border-accent hover:text-accent-hover"
                        }`}
                    >
                        {label}
                        <Icon aria-hidden="true" className="h-4 w-4" />
                    </Link>
                ))}
            </div>

            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-label={open ? "Close community actions" : "Open community actions"}
                aria-expanded={open}
                aria-controls="community-action-menu"
                className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                    open
                        ? "bg-text-primary text-bg shadow-[0_12px_32px_rgba(27,67,50,0.32)]"
                        : "bg-accent text-white shadow-[0_12px_32px_rgba(27,67,50,0.32)] hover:bg-accent-hover"
                }`}
            >
                {open ? (
                    <X aria-hidden="true" className="h-6 w-6" />
                ) : (
                    <Plus aria-hidden="true" className="h-7 w-7" />
                )}
            </button>
        </div>
    );
};

export default CommunityActionDock;
