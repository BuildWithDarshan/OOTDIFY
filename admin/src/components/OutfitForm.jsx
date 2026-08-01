import { useState, useEffect } from "react";
import { getOccasions, getOutfitTypes } from "../services/taxonomyService.js";
import { getItems } from "../services/itemService.js";

const GENDERS = ["men", "women"];
const SEASONS = ["summer", "winter", "monsoon", "all-season"];

// Shared form for AddOutfit.jsx and EditOutfit.jsx. Pulls Occasions, OutfitTypes,
// and Items from their own endpoints since Outfit references all three by id.
const OutfitForm = ({ initialData, onSubmit, submitting, submitLabel = "Save" }) => {
    const [title, setTitle] = useState("");
    const [gender, setGender] = useState("men");
    const [occasion, setOccasion] = useState("");
    const [outfitType, setOutfitType] = useState("");
    const [season, setSeason] = useState("all-season");
    const [description, setDescription] = useState("");
    const [isTrending, setIsTrending] = useState(false);
    const [isCelebrityInspired, setIsCelebrityInspired] = useState(false);
    const [inspiredByLabel, setInspiredByLabel] = useState("");
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [coverImageFile, setCoverImageFile] = useState(null);
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

    // Pre-fill when editing — note occasion/outfitType/items arrive as populated
    // objects from getOutfitById, so we extract just the ids for the form state
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "");
            setGender(initialData.gender || "men");
            setOccasion(initialData.occasion?._id || initialData.occasion || "");
            setOutfitType(initialData.outfitType?._id || initialData.outfitType || "");
            setSeason(initialData.season || "all-season");
            setDescription(initialData.description || "");
            setIsTrending(!!initialData.isTrending);
            setIsCelebrityInspired(!!initialData.isCelebrityInspired);
            setInspiredByLabel(initialData.inspiredByLabel || "");
            setSelectedItemIds(
                (initialData.items || []).map((item) => item._id || item)
            );
        }
    }, [initialData]);

    // Only show items matching the currently selected gender — an outfit
    // shouldn't mix men's and women's items
    const genderItems = allItems.filter((item) => item.gender === gender);

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
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            {error && <div className="text-sm text-white bg-red-500 rounded-lg px-4 py-2">{error}</div>}

            <div>
                <label className="block text-sm text-text-secondary mb-1">Cover Image</label>
                {initialData?.coverImage?.url && !coverImageFile && (
                    <img
                        src={initialData.coverImage.url}
                        alt={initialData.title}
                        className="w-24 h-24 rounded-lg object-cover mb-2"
                    />
                )}
                <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setCoverImageFile(e.target.files[0])}
                    className="w-full text-sm text-text-secondary"
                />
                {initialData && (
                    <p className="text-xs text-text-muted mt-1">Leave empty to keep the current image.</p>
                )}
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

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-text-secondary">
                        Items ({gender}) — select at least one
                    </label>
                    <span className="text-sm text-accent-hover font-medium">
                        Total: ₹{totalPrice}
                    </span>
                </div>

                {genderItems.length === 0 ? (
                    <p className="text-text-muted text-sm">
                        No {gender}'s items exist yet — add some in Items first.
                    </p>
                ) : (
                    <div className="border border-border rounded-lg max-h-64 overflow-y-auto divide-y divide-border">
                        {genderItems.map((item) => (
                            <label
                                key={item._id}
                                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-bg-subtle"
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
                                    className="w-8 h-8 rounded object-cover"
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
                className="w-full sm:w-auto bg-accent text-on-accent rounded-lg px-6 py-2.5 font-medium hover:bg-accent-hover disabled:opacity-60"
            >
                {submitting ? "Saving..." : submitLabel}
            </button>
        </form>
    );
};

export default OutfitForm;