import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight, BarChart3, BookOpenText, ClipboardList, FolderHeart,
    Plus, Shirt, Sparkles, Star, UsersRound,
} from "lucide-react";
import api from "../services/api.js";

const statCards = [
    { key: "totalOutfits", label: "Outfits", icon: Shirt, to: "/outfits", tone: "bg-green-50 text-green-700" },
    { key: "totalItems", label: "Catalog items", icon: FolderHeart, to: "/items", tone: "bg-sky-50 text-sky-700" },
    { key: "totalTrends", label: "Trends", icon: BarChart3, to: "/trends", tone: "bg-violet-50 text-violet-700" },
    { key: "totalStyleTips", label: "Styling tips", icon: BookOpenText, to: "/style-tips", tone: "bg-amber-50 text-amber-700" },
    { key: "totalUsers", label: "Members", icon: UsersRound, to: "/users", tone: "bg-rose-50 text-rose-700" },
];

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentOutfits, setRecentOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let current = true;
        api.get("/admin/dashboard").then(({ data }) => {
            if (!current) return;
            setStats(data.stats);
            setRecentOutfits(data.recentOutfits ?? []);
        }).catch((requestError) => {
            if (current) setError(requestError.response?.data?.message || "Could not load the dashboard.");
        }).finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, []);

    if (loading) return <p role="status" className="rounded-2xl bg-white p-6 text-sm text-green-700">Loading dashboard...</p>;
    if (error || !stats) return <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error || "Dashboard data is unavailable."}</p>;

    return <div className="space-y-7">
        <section className="relative overflow-hidden rounded-[2rem] bg-green-800 px-6 py-8 text-white shadow-xl shadow-green-800/10 sm:px-9 sm:py-10">
            <div aria-hidden="true" className="absolute -right-16 -top-20 h-72 w-72 rounded-full border border-white/10" />
            <div aria-hidden="true" className="absolute bottom-0 right-20 h-44 w-44 rounded-full bg-green-400/15 blur-3xl" />
            <div className="relative flex flex-wrap items-end justify-between gap-5">
                <div><p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-green-200"><Sparkles size={15} /> Studio overview</p>
                    <h1 className="mt-3 font-display text-4xl sm:text-5xl">Your creative workspace.</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-green-100">A clear view of the looks, products, and stories shaping OOTDIFY.</p>
                </div>
                <Link to="/outfits/add" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-green-900 shadow-sm transition hover:bg-green-50"><Plus size={17} /> Create outfit</Link>
            </div>
        </section>

        <section aria-label="Content totals" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {statCards.map(({ key, label, icon: Icon, to, tone }) => <Link key={key} to={to} className="group rounded-2xl border border-green-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md sm:p-5">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={20} /></span>
                <p className="mt-4 font-display text-3xl text-green-900">{Number(stats[key] ?? 0).toLocaleString("en-IN")}</p>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs font-medium text-green-600"><span>{label}</span><ArrowRight size={15} className="opacity-0 transition group-hover:opacity-100" /></div>
            </Link>)}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
            <section className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-green-100 px-5 py-5 sm:px-6">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-500">Latest additions</p><h2 className="font-display text-2xl text-green-900">Recent outfits</h2></div>
                    <Link to="/outfits" className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline">View all <ArrowRight size={14} /></Link>
                </div>
                {recentOutfits.length === 0 ? <p className="p-6 text-sm text-green-600">No outfits yet. Create the first look to get started.</p> :
                    <div className="divide-y divide-green-100">{recentOutfits.map((outfit) => <Link key={outfit._id} to={`/outfits/edit/${outfit._id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-green-50/50 sm:px-6">
                        {outfit.coverImage?.url ? <img src={outfit.coverImage.url} alt="" className="h-16 w-14 shrink-0 rounded-xl object-cover" /> : <span className="h-16 w-14 shrink-0 rounded-xl bg-green-50" />}
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-green-900">{outfit.title}</p><p className="mt-1 truncate text-xs capitalize text-green-600">{[outfit.gender, outfit.occasion?.name, outfit.outfitType?.name].filter(Boolean).join(" · ")}</p></div>
                        <div className="text-right"><p className="text-sm font-semibold text-green-800">₹{Number(outfit.totalPrice ?? 0).toLocaleString("en-IN")}</p><p className="mt-1 text-[11px] text-green-500">{outfit.createdAt ? new Date(outfit.createdAt).toLocaleDateString("en-IN") : ""}</p></div>
                    </Link>)}</div>}
            </section>

            <div className="space-y-5">
                <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-500">Needs attention</p>
                    <h2 className="mt-1 font-display text-2xl text-green-900">Today in the studio</h2>
                    <div className="mt-5 space-y-3">
                        <Link to="/community-reports" className="flex items-center gap-3 rounded-xl bg-amber-50 p-3 text-amber-900 hover:bg-amber-100"><ClipboardList size={18} /><span className="flex-1 text-sm">Pending community reports</span><strong>{stats.pendingReports ?? 0}</strong></Link>
                        <Link to="/outfits" className="flex items-center gap-3 rounded-xl bg-green-50 p-3 text-green-900 hover:bg-green-100"><Star size={18} /><span className="flex-1 text-sm">Outfits marked OOTD</span><strong>{stats.ootdOutfits ?? 0}</strong></Link>
                        <Link to="/outfits" className="flex items-center gap-3 rounded-xl bg-violet-50 p-3 text-violet-900 hover:bg-violet-100"><Sparkles size={18} /><span className="flex-1 text-sm">Trending outfits</span><strong>{stats.trendingOutfits ?? 0}</strong></Link>
                    </div>
                </section>
                <section className="rounded-3xl border border-green-100 bg-[#e9f5e9] p-5 sm:p-6">
                    <p className="font-display text-2xl text-green-900">Keep the edit moving.</p>
                    <p className="mt-2 text-sm leading-6 text-green-700">Add pieces to the catalog, then put together a new outfit for your audience.</p>
                    <div className="mt-4 flex flex-wrap gap-2"><Link to="/items/add" className="rounded-xl bg-green-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-green-800">Add an item</Link><Link to="/trends/add" className="rounded-xl border border-green-300 bg-white px-4 py-2.5 text-xs font-semibold text-green-800 hover:bg-green-50">Create a trend</Link></div>
                </section>
            </div>
        </div>
    </div>;
}
