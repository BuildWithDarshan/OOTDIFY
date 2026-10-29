import { useState, useEffect, useRef } from "react";
import { getOccasions, getOutfitTypes } from "../services/taxonomyService.js";
import { getItems } from "../services/itemService.js";
import { ImagePlus, Search, ShoppingBag, Sparkles } from "lucide-react";

const GENDERS = ["men", "women"];
const SEASONS = ["summer", "winter", "monsoon", "all-season"];

// Shared form for AddOutfit.jsx and EditOutfit.jsx. Pulls Occasions, OutfitTypes,
// and Items from their own endpoints since Outfit references all three by id.
const OutfitForm = ({ initialData, onSubmit, submitting, submitLabel = "Save" }) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [gender, setGender] = useState(initialData?.gender || "men");
    const [occasion, setOccasion] = useState(initialData?.occasion?._id || initialData?.occasion || "");
    const [outfitType, setOutfitType] = useState(initialData?.outfitType?._id || initialData?.outfitType || "");
    const [season, setSeason] = useState(initialData?.season || "all-season");
    const [description, setDescription] = useState(initialData?.description || "");
    const [isTrending, setIsTrending] = useState(Boolean(initialData?.isTrending));
    const [isCelebrityInspired, setIsCelebrityInspired] = useState(Boolean(initialData?.isCelebrityInspired));
    const [inspiredByLabel, setInspiredByLabel] = useState(initialData?.inspiredByLabel || "");
    const [selectedItemIds, setSelectedItemIds] = useState(() => (initialData?.items || []).map((item) => item._id || item));
    const [itemSearch, setItemSearch] = useState("");
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const previewUrl = useRef("");
    const [error, setError] = useState("");

    const [occasions, setOccasions] = useState([]);
    const [outfitTypes, setOutfitTypes] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Load dropdown/picker data once on mount
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [occasionData, outfitTypeData, itemData] = await Promise.all([
                    getOccasions(),
                    getOutfitTypes(),
                    getItems(),
                ]);
                setOccasions(occasionData.occasions);
                setOutfitTypes(outfitTypeData.outfitTypes);
                setAllItems(itemData.items);
            } catch {
                setError("Failed to load form options (occasions, outfit types, or items)");
            } finally {
                setLoadingOptions(false);
            }
        };
        loadOptions();
    }, []);

    useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);
    const changeImage = (event) => {
        const file = event.target.files?.[0] ?? null;
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
        previewUrl.current = file ? URL.createObjectURL(file) : "";
        setCoverImageFile(file);
        setImagePreview(previewUrl.current);
    };

    // Only show items matching the currently selected gender — an outfit
    // shouldn't mix men's and women's items
    const genderItems = allItems.filter((item) => item.gender === gender);
    const searchWords = itemSearch.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matchingItems = genderItems.filter((item) => {
        const searchable = [item.name, item.brand, item.itemSubType, item.shoppingSite]
            .filter(Boolean).join(" ").toLowerCase();
        return searchWords.every((word) => searchable.includes(word));
    });
    const selectedItems = genderItems.filter((item) => selectedItemIds.includes(item._id));

    const toggleItem = (itemId) => {
        setSelectedItemIds((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
        );
    };

    const totalPrice = allItems
        .filter((item) => selectedItemIds.includes(item._id))
        .reduce((sum, item) => sum + item.price, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title || !occasion || !outfitType) {
            setError("Title, occasion, and outfit type are all required");
            return;
        }

        if (selectedItemIds.length === 0) {
            setError("Select at least one item to build the outfit");
            return;
        }

        if (!initialData && !coverImageFile) {
            setError("A cover image is required");
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("gender", gender);
        formData.append("occasion", occasion);
        formData.append("outfitType", outfitType);
        formData.append("season", season);
        formData.append("description", description);
        formData.append("items", JSON.stringify(selectedItemIds));
        formData.append("isTrending", isTrending ? "true" : "false");
        formData.append("isCelebrityInspired", isCelebrityInspired ? "true" : "false");
        formData.append("inspiredByLabel", isCelebrityInspired ? inspiredByLabel.trim() : "");
        if (coverImageFile) formData.append("coverImage", coverImageFile);

        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong while saving the outfit");
        }
    };

    if (loadingOptions) {
        return <p className="text-text-secondary">Loading form...</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="admin-form max-w-5xl space-y-6 rounded-3xl border border-green-100 bg-white p-5 shadow-sm sm:p-8">
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="flex items-center gap-3 border-b border-green-100 pb-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-800"><Sparkles size={19} /></span><div><h2 className="font-display text-2xl text-green-900">The look</h2><p className="text-xs text-green-600">Start with an image and the details people will see.</p></div></div>

            <div className="grid gap-4 rounded-2xl bg-[#f8fbf7] p-4 sm:grid-cols-[120px_1fr] sm:items-center">
                <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-white text-green-400">
                    {imagePreview || initialData?.coverImage?.url ? <img src={imagePreview || initialData.coverImage.url} alt="Outfit cover preview" className="h-full w-full object-cover" /> : <ImagePlus size={28} />}
                </div>
                <div>
                <label className="block text-sm text-text-secondary mb-1">Cover Image</label>
                <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={changeImage}
                    className="w-full text-sm text-text-secondary"
                />
                {initialData && (
                    <p className="text-xs text-text-muted mt-1">Leave empty to keep the current image.</p>
                )}
                </div>
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-1">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                    placeholder="Weekend Streetwear Combo"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Gender</label>
                    <select
                        value={gender}
                        onChange={(e) => {
                            setGender(e.target.value);
                            setSelectedItemIds([]); // items differ per gender, so reset the picker
                        }}
                        className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                    >
                        {GENDERS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-text-secondary mb-1">Occasion</label>
                    <select
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                    >
                        <option value="">Select...</option>
                        {occasions.map((o) => (
                            <option key={o._id} value={o._id}>{o.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-text-secondary mb-1">Outfit Type</label>
                    <select
                        value={outfitType}
                        onChange={(e) => setOutfitType(e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                    >
                        <option value="">Select...</option>
                        {outfitTypes.map((t) => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Season</label>
                    <select
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                    >
                        {SEASONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <div className="mt-6 space-y-3">
    <label className="flex items-center gap-2 text-sm text-text-primary">
        <input
            type="checkbox"
            checked={isTrending}
            onChange={(e) => setIsTrending(e.target.checked)}
            className="rounded border-border"
        />
        Mark as Trending
    </label>

    <label className="flex items-center gap-2 text-sm text-text-primary">
        <input
            type="checkbox"
            checked={isCelebrityInspired}
            onChange={(e) => setIsCelebrityInspired(e.target.checked)}
            className="rounded border-border"
        />
        Celebrity-Inspired
    </label>

    {isCelebrityInspired && (
        <div>
            <label className="block text-sm text-text-secondary mb-1">Inspired By Label</label>
            <input
                type="text"
                value={inspiredByLabel}
                onChange={(e) => setInspiredByLabel(e.target.value)}
                placeholder='e.g. "Off-duty athlete style"'
                className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
            />
        </div>
    )}
</div>
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                    placeholder="A relaxed weekend look with a graphic tee and cargo pants"
                />
            </div>

            <div className="rounded-2xl border border-green-100 bg-[#fbfdfb] p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2 text-green-800"><ShoppingBag size={18} /><h3 className="font-display text-xl">Choose the pieces</h3></div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-text-secondary">
                        Items ({gender}) — select at least one
                    </label>
                    <span className="rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white">
                        Total: ₹{totalPrice}
                    </span>
                </div>

                {selectedItems.length > 0 && (
                    <div className="mb-3 rounded-lg border border-border bg-bg-subtle p-3 text-sm text-text-primary">
                        <p className="mb-2 font-medium">Selected ({selectedItems.length})</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedItems.map((item) => (
                                <button key={item._id} type="button" onClick={() => toggleItem(item._id)}
                                    aria-label={`Remove ${item.name} from outfit`}
                                    className="rounded-lg border border-border bg-bg px-2 py-1 text-left text-xs hover:border-accent">
                                    {item.name} ×
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <label className="mb-2 block text-sm text-text-secondary">
                    <span className="inline-flex items-center gap-1.5"><Search size={15} /> Search catalog items</span>
                    <input type="search" value={itemSearch} onChange={(event) => setItemSearch(event.target.value)}
                        placeholder="Search name, brand, type, or store"
                        className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none" />
                </label>

                {genderItems.length === 0 ? (
                    <p className="text-text-muted text-sm">
                        No {gender}'s items exist yet — add some in Items first.
                    </p>
                ) : matchingItems.length === 0 ? (
                    <p className="text-text-muted text-sm">No catalog items match this search for {gender}.</p>
                ) : (
                    <div className="max-h-72 divide-y divide-green-100 overflow-y-auto rounded-xl border border-green-100 bg-white">
                        {matchingItems.map((item) => (
                            <label
                                key={item._id}
                                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-green-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(item._id)}
                                    onChange={() => toggleItem(item._id)}
                                    className="rounded border-border"
                                />
                                <img
                                    src={item.image?.url}
                                    alt={item.name}
                                    className="h-10 w-10 rounded-lg object-cover"
                                />
                                <span className="flex-1 text-text-primary">{item.name}</span>
                                <span className="text-text-secondary">₹{item.price}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-green-700 px-6 py-3 font-semibold text-white shadow-sm hover:bg-green-800 disabled:opacity-60 sm:w-auto"
            >
                {submitting ? "Saving..." : submitLabel}
            </button>
        </form>
    );
};

export default OutfitForm;
