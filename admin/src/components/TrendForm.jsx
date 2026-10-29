import { useState, useEffect } from "react";
import { ImageIcon, Search, X } from "lucide-react";
import { getOutfits } from "../services/outfitService.js";

const GENDERS = ["men", "women", "unisex"];


const TrendForm = ({ initialData, onSubmit, submitting, submitLabel = "Save" }) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [gender, setGender] = useState(initialData?.gender || "unisex");
    const [stylingTipsText, setStylingTipsText] = useState((initialData?.stylingTips || []).join("\n"));
    const [selectedOutfitIds, setSelectedOutfitIds] = useState(() => (initialData?.relatedOutfits || []).map((o) => o._id || o));
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState("");

    const [outfits, setOutfits] = useState([]);
    const [outfitSearch, setOutfitSearch] = useState("");
    const [outfitLoadError, setOutfitLoadError] = useState("");
    const [loadingOutfits, setLoadingOutfits] = useState(true);

    useEffect(() => {
        const loadOutfits = async () => {
            try {
                const data = await getOutfits();
                if (!Array.isArray(data.outfits)) throw new Error("The outfit list is unavailable.");
                setOutfits(data.outfits);
            } catch (requestError) {
                setOutfitLoadError(requestError.response?.data?.message || "Could not load outfits. Try reopening this form.");
            } finally {
                setLoadingOutfits(false);
            }
        };
        loadOutfits();
    }, []);

    const toggleOutfit = (outfitId) => {
        setSelectedOutfitIds((prev) =>
            prev.includes(outfitId) ? prev.filter((id) => id !== outfitId) : [...prev, outfitId]
        );
    };
    const searchWords = outfitSearch.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matchingOutfits = outfits.filter((outfit) => {
        const text = [outfit.title, outfit.gender, outfit.occasion?.name, outfit.outfitType?.name]
            .filter(Boolean).join(" ").toLowerCase();
        return searchWords.every((word) => text.includes(word));
    });
    const selectedOutfits = outfits.filter((outfit) => selectedOutfitIds.includes(outfit._id));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title || !description) {
            setError("Title and description are required");
            return;
        }

        if (!initialData && !imageFile) {
            setError("A cover image is required");
            return;
        }

        const stylingTips = stylingTipsText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", description);
        formData.append("gender", gender);
        formData.append("stylingTips", JSON.stringify(stylingTips));
        formData.append("relatedOutfits", JSON.stringify(selectedOutfitIds));
        if (imageFile) formData.append("image", imageFile);

        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong while saving the trend");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form max-w-3xl space-y-5">
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div>
                <label className="block text-sm text-text-secondary mb-1">Cover Image</label>
                {initialData?.coverImage?.url && !imageFile && (
                    <img
                        src={initialData.coverImage.url}
                        alt={initialData.title}
                        className="w-20 h-20 rounded-lg object-cover mb-2"
                    />
                )}
                <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => setImageFile(e.target.files[0])}
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
                    placeholder="Korean Pants"
                />
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-1">Gender</label>
                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                >
                    {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                    placeholder="Wide-leg trousers with a relaxed drape..."
                />
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-1">
                    Styling Tips (one per line)
                </label>
                <textarea
                    value={stylingTipsText}
                    onChange={(e) => setStylingTipsText(e.target.value)}
                    rows={3}
                    className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                    placeholder={"Pair with a cropped top\nCinch at the waist with a belt"}
                />
            </div>

            <div className="space-y-3 rounded-2xl border border-green-100 bg-[#fbfdfb] p-4">
                <div className="flex items-center justify-between gap-2"><div><h3 className="font-display text-xl text-green-900">Related outfits</h3><p className="text-xs text-green-600">Choose looks that belong with this trend.</p></div><span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">{selectedOutfitIds.length} selected</span></div>
                <label className="relative block">
                    <span className="sr-only">Search related outfits</span>
                    <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                    <input type="search" value={outfitSearch} onChange={(event) => setOutfitSearch(event.target.value)}
                        placeholder="Search title, gender, occasion, or style..." style={{ paddingLeft: "2.5rem" }} />
                </label>
                {selectedOutfits.length > 0 && <div className="flex flex-wrap gap-2">{selectedOutfits.map((outfit) => <button key={outfit._id} type="button" onClick={() => toggleOutfit(outfit._id)} aria-label={`Remove ${outfit.title}`} className="inline-flex max-w-full items-center gap-2 rounded-xl border border-green-200 bg-white p-1.5 pr-2 text-xs font-semibold text-green-800 hover:border-rose-200 hover:text-rose-700">
                    {outfit.coverImage?.url ? <img src={outfit.coverImage.url} alt="" className="h-8 w-8 rounded-lg object-cover" /> : <ImageIcon size={17} />}
                    <span className="max-w-36 truncate">{outfit.title}</span><X size={13} />
                </button>)}</div>}
                {loadingOutfits ? (
                    <p className="text-text-muted text-sm">Loading outfits...</p>
                ) : outfitLoadError ? (
                    <p role="alert" className="text-sm text-red-700">{outfitLoadError}</p>
                ) : outfits.length === 0 ? (
                    <p className="text-text-muted text-sm">No outfits exist yet.</p>
                ) : matchingOutfits.length === 0 ? (
                    <p className="rounded-xl bg-white p-3 text-sm text-green-600">No outfits match this search.</p>
                ) : (
                    <div className="max-h-72 divide-y divide-green-100 overflow-y-auto rounded-xl border border-green-100 bg-white">
                        {matchingOutfits.map((outfit) => (
                            <label
                                key={outfit._id}
                                className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-green-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedOutfitIds.includes(outfit._id)}
                                    onChange={() => toggleOutfit(outfit._id)}
                                    className="rounded border-border"
                                />
                                {outfit.coverImage?.url ? <img src={outfit.coverImage.url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-400"><ImageIcon size={20} /></span>}
                                <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-green-900">{outfit.title}</span><span className="block truncate text-xs capitalize text-green-600">{[outfit.gender, outfit.occasion?.name].filter(Boolean).join(" · ")}</span></span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60 sm:w-auto"
            >
                {submitting ? "Saving..." : submitLabel}
            </button>
        </form>
    );
};

export default TrendForm;
