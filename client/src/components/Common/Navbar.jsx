import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import navPreview from '../../assets/images/footer-banner.png';
import logo from "../../assets/logos/ootdify-logo-trimmed.png"


const navLinks = [
    { to: '/', label: "Home" },
    { to: '/men', label: "Men" },
    { to: '/women', label: "Women" },
    { to: '/trends', label: "Trends" },
    { to: '/style-tips', label: "Style Tips" },
    { to: '/wardrobe-essentials', label: "Wardrobe" },
];

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <header className='fixed top-3 left-3 sm:top-4 sm:left-4 z-50'>
            {/* Navbar Header / branding */}
            <div className='w-[min(85vw,16rem)] bg-bg border border-border rounded-2xl shadow-sm flex items-center gap-4 sm:gap-6 pl-4 pr-2 py-2 sm:pl-5 sm:pr-3 sm:py-2 justify-between'>
                <Link
                    to='/'
                    onClick={() => setOpen(false)}
                    className='flex h-10 min-w-0 shrink-0 items-center justify-center sm:h-11'
                >
                    <img
                        src={logo}
                        alt="OOTDIFY"
                        className='block h-auto w-[7.75rem] object-contain object-center sm:w-[8.75rem]'
                    />
                </Link>
                <button
                    type='button'
                    aria-label={open ? "Close Menu" : "Open Menu"}
                    onClick={() => setOpen((v) => !v)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors duration-300 shrink-0 ${
                        open
                            ? "border-accent bg-accent text-on-accent"
                            : "border-border text-text-primary hover:border-accent hover:text-accent-hover"
                    }`}
                >
                    <span className="relative w-4 h-4 block">
                        <Menu className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${open ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
                        <X className={`absolute inset-0 w-4 h-4 transition-all duration-300 ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`} />
                    </span>
                </button>
            </div>

            {/* Sliding dropdown — grid-rows trick for smooth height animation */}
            <div
                className={`grid w-[min(85vw,16rem)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    open ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"
                }`}
            >
                <nav className="overflow-hidden">
                    <div className="bg-bg border border-border rounded-2xl shadow-sm p-5 sm:p-6 max-h-[calc(100dvh-6rem)] overflow-y-auto">
                        <ul className="space-y-1">
                            {navLinks.map((link, idx) => (
                                <li
                                    key={link.to}
                                    className={`transition-all duration-500 ease-out ${
                                        open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                                    }`}
                                    style={{ transitionDelay: open ? `${(idx + 1) * 60}ms` : "0ms" }}
                                >
                                    <Link
                                        to={link.to}
                                        onClick={() => setOpen(false)}
                                        className="group relative inline-flex items-center py-1.5 text-sm font-semibold text-text-primary transition-colors duration-300 hover:text-accent-hover"
                                    >
                                        {link.label.toUpperCase()}
                                        <span className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 bg-accent transition-all duration-300 ease-out group-hover:w-full" />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Auth section */}
                        <div
                            className={`mt-5 pt-4 border-t border-border transition-all duration-500 ease-out ${
                                open ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
                            }`}
                            style={{ transitionDelay: open ? `${(navLinks.length + 1) * 60}ms` : "0ms" }}
                        >
                            {isAuthenticated ? (
                                <div className="flex items-center justify-between gap-2">
                                    <Link
                                        to="/profile"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-2 group min-w-0"
                                    >
                                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg-subtle)] border border-border group-hover:border-accent group-hover:text-accent-hover transition-colors shrink-0">
                                            <User className="w-4 h-4" />
                                        </span>
                                        <span className="text-sm font-medium text-text-secondary group-hover:text-accent-hover transition-colors truncate">
                                            {user?.name?.split(" ")[0] || "Profile"}
                                        </span>
                                    </Link>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link
                                            to="/favourites"
                                            onClick={() => setOpen(false)}
                                            aria-label="Your Favourites"
                                            className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:border-accent transition-colors"
                                        >
                                            <Heart className="w-4 h-4 fill-accent text-accent" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => { logout(); setOpen(false); }}
                                            aria-label="Logout"
                                            className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-text-muted hover:border-accent hover:text-accent-hover hover:bg-accent-subtle transition-all"
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setOpen(false)}
                                        className="flex-1 text-center border border-border rounded-full py-2 text-xs font-medium text-text-primary hover:border-accent hover:text-accent-hover transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setOpen(false)}
                                        className="flex-1 text-center bg-text-primary text-bg rounded-full py-2 text-xs font-medium hover:bg-accent hover:text-on-accent transition-colors"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Bottom teaser image — links to About */}
                        <Link
                            to="/about"
                            onClick={() => setOpen(false)}
                            className="block mt-5 group"
                        >
                            <p className="text-sm text-text-muted mb-2 font-semibold">About Us</p>
                            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[var(--color-bg-subtle)]">
                                <img
                                    src={navPreview}
                                    alt="Learn more about OOTDIFY"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
