import { useState } from "react";
import { Search } from "lucide-react";
import { getItems } from "../services/itemService.js";

export default function CatalogItemSearch({ garment, outfitGender, selectedItem, onSelect }) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const gender = outfitGender || garment.genderSuggestion;
    const searchWords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = (items ?? []).filter((item) => {
        const searchable = [item.name, item.brand, item.itemSubType, item.shoppingSite]
            .filter(Boolean).join(" ").toLowerCase();
        return searchWords.every((word) => searchable.includes(word));
    });

    const loadItems = async () => {
        setOpen(true);
        setLoading(true);
        setError("");
        if (!["men", "women"].includes(gender)) {
            setError("Choose the outfit gender before searching saved items.");
            setLoading(false);
            return;
        }
        try {
            const response = await getItems({ gender, itemType: garment.itemType });
            if (!response.success || !Array.isArray(response.items)) {
                throw new Error("Catalog items returned an unexpected response.");
            }
            setItems(response.items);
        } catch (requestError) {
            setError(requestError.response?.data?.message || requestError.message ||
                "Could not load catalog items.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <button type="button" onClick={open ? () => setOpen(false) : loadItems}
                aria-expanded={open}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-900 hover:bg-sky-100">
                <Search size={16} /> {open ? "Close saved item search" : "Search saved items"}
            </button>

            {open && <div className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
                <div className="flex flex-wrap items-end gap-2">
                    <label className="min-w-48 flex-1 text-sm text-text-secondary">
                        Search {gender || "outfit"} {garment.itemType} items
                        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                            placeholder="Name, brand, type, or store"
                            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none" />
                    </label>
                    <button type="button" onClick={loadItems} disabled={loading}
                        className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary disabled:opacity-60">
                        {loading ? "Loading..." : "Refresh items"}
                    </button>
                </div>
                <p className="text-xs text-text-muted">Choose an existing item that matches the garment's color and subtype.</p>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                {items && !loading && (matches.length === 0
                    ? <p className="text-sm text-text-muted">No saved items match this search.</p>
                    : <ul className="max-h-72 space-y-2 overflow-y-auto">
                        {matches.map((item) => <li key={item._id}>
                            <button type="button" onClick={() => onSelect(item)}
                                aria-pressed={selectedItem?._id === item._id}
                                className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left text-sm ${
                                    selectedItem?._id === item._id
                                        ? "border-accent bg-bg"
                                        : "border-border bg-bg hover:border-accent"
                                }`}>
                                {item.image?.url && <img src={item.image.url} alt=""
                                    className="h-12 w-12 shrink-0 rounded object-cover" />}
                                <span className="min-w-0 flex-1">
                                    <span className="block font-medium text-text-primary">{item.name}</span>
                                    <span className="text-text-secondary">{item.itemSubType} · {item.shoppingSite} · ₹{item.price}</span>
                                </span>
                                <span className="text-xs text-accent-hover">
                                    {selectedItem?._id === item._id ? "Selected" : "Select"}
                                </span>
                            </button>
                        </li>)}
                    </ul>)}
            </div>}
        </div>
    );
}
