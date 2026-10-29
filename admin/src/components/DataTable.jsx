import { useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Search, Trash2 } from "lucide-react";

const PAGE_SIZE = 20;
const defaultSearchFields = ["name", "title", "email", "slug", "gender", "category", "brand", "shoppingSite", "itemType", "itemSubType"];

function textForSearch(value) {
    if (Array.isArray(value)) return value.map(textForSearch).join(" ");
    if (value && typeof value === "object") return value.name || value.title || "";
    return String(value ?? "");
}

export default function DataTable({ columns, rows = [], onEdit, onDelete, emptyMessage = "Nothing here yet.", searchFields = defaultSearchFields, searchPlaceholder = "Search records..." }) {
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const showActions = Boolean(onEdit || onDelete);
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = rows.filter((row) => {
        if (words.length === 0) return true;
        const haystack = searchFields.map((field) =>
            textForSearch(typeof field === "function" ? field(row) : row[field])
        ).join(" ").toLowerCase();
        return words.every((word) => haystack.includes(word));
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const visibleRows = filtered.slice(start, start + PAGE_SIZE);

    return <section aria-label="Records" className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm shadow-green-800/5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-green-100 bg-[#fbfdfb] p-4 sm:px-6">
            <label className="relative min-w-0 flex-1 sm:max-w-sm">
                <span className="sr-only">Search records</span>
                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                    placeholder={searchPlaceholder} className="w-full rounded-xl border border-green-200 bg-white py-2.5 pl-10 pr-3 text-sm text-green-900 outline-none placeholder:text-green-400 focus:border-green-600 focus:ring-2 focus:ring-green-100" />
            </label>
            <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </span>
        </div>

        {visibleRows.length === 0 ? <div className="px-5 py-16 text-center">
            <Search size={28} className="mx-auto text-green-300" />
            <p className="mt-3 font-display text-xl text-green-900">{rows.length === 0 ? emptyMessage : "No matching records"}</p>
            {rows.length > 0 && <p className="mt-1 text-sm text-green-600">Try another search term.</p>}
        </div> : <>
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[650px] text-left text-sm">
                    <thead><tr className="border-b border-green-100 bg-green-50/35">
                        {columns.map((col) => <th key={col.key} scope="col" className="whitespace-nowrap px-5 py-3.5 text-[11px] font-bold uppercase tracking-wide text-green-600">{col.label}</th>)}
                        {showActions && <th scope="col" className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wide text-green-600">Actions</th>}
                    </tr></thead>
                    <tbody>{visibleRows.map((row) => <tr key={row._id} className="border-b border-green-100/70 transition hover:bg-green-50/35 last:border-0">
                        {columns.map((col) => <td key={col.key} className="px-5 py-3.5 align-middle text-green-900">{col.render ? col.render(row) : row[col.key]}</td>)}
                        {showActions && <td className="whitespace-nowrap px-5 py-3.5 text-right">
                            <div className="inline-flex items-center gap-1">
                                {onEdit && <button type="button" onClick={() => onEdit(row)} aria-label={`Edit ${row.title || row.name || "record"}`} className="rounded-lg p-2 text-green-700 hover:bg-green-100"><Pencil size={16} /></button>}
                                {onDelete && <button type="button" onClick={() => onDelete(row)} aria-label={`Delete ${row.title || row.name || "record"}`} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={16} /></button>}
                            </div>
                        </td>}
                    </tr>)}</tbody>
                </table>
            </div>
            <div className="space-y-3 p-3 md:hidden">{visibleRows.map((row) => <article key={row._id} className="rounded-2xl border border-green-100 bg-white p-4">
                <dl className="space-y-2.5">{columns.map((col) => <div key={col.key} className="flex min-w-0 items-start justify-between gap-4 text-sm">
                    <dt className="shrink-0 text-xs font-medium text-green-600">{col.label}</dt>
                    <dd className="min-w-0 break-words text-right font-medium text-green-900">{col.render ? col.render(row) : row[col.key]}</dd>
                </div>)}</dl>
                {showActions && <div className="mt-4 flex gap-2 border-t border-green-100 pt-3">
                    {onEdit && <button type="button" onClick={() => onEdit(row)} className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-800"><Pencil size={14} /> Edit</button>}
                    {onDelete && <button type="button" onClick={() => onDelete(row)} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"><Trash2 size={14} /> Delete</button>}
                </div>}
            </article>)}</div>
        </>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-green-100 bg-[#fbfdfb] px-4 py-3 sm:px-6">
            <p className="text-xs text-green-600">{filtered.length ? `${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length}` : "0 results"} · 20 per page</p>
            <div className="flex items-center gap-2 text-xs font-semibold text-green-800">
                <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page" className="rounded-lg border border-green-200 bg-white p-2 hover:bg-green-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
                <span className="min-w-20 text-center">{currentPage} of {totalPages}</span>
                <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page" className="rounded-lg border border-green-200 bg-white p-2 hover:bg-green-50 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
        </div>
    </section>;
}
