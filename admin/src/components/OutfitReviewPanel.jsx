import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, Save, Sparkles } from "lucide-react";
import {
    createOccasion, createOutfitType, getOccasions, getOutfitTypes,
} from "../services/taxonomyService.js";

const fieldClass =
    "w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm text-green-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100";

function matchingOption(options, suggestion) {
    const name = String(suggestion ?? "").trim().toLowerCase();
    return options.find((option) => option.name.trim().toLowerCase() === name)?._id ?? "";
}

export default function OutfitReviewPanel({
    draft, imageFile, imagePreview, selectedItems, occasionId, onOccasionChange,
    outfitTypeId, onOutfitTypeChange, onBack, onSave, saving,
}) {
    const [occasions, setOccasions] = useState([]);
    const [outfitTypes, setOutfitTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loadError, setLoadError] = useState("");
    const [reloadOptions, setReloadOptions] = useState(0);
    const [newOccasion, setNewOccasion] = useState("");
    const [newOutfitType, setNewOutfitType] = useState("");
    const [adding, setAdding] = useState("");

    const { outfitDraft, itemSuggestions } = draft;

    useEffect(() => {
        let current = true;
        Promise.all([getOccasions(), getOutfitTypes()])
            .then(([occasionData, typeData]) => {
                if (!current) return;
                if (!occasionData.success || !Array.isArray(occasionData.occasions) ||
                    !typeData.success || !Array.isArray(typeData.outfitTypes)) {
                    throw new Error("The occasion or outfit type list returned an unexpected response.");
                }
                const availableOccasions = occasionData.occasions;
                const availableTypes = typeData.outfitTypes;
                setOccasions(availableOccasions);
                setOutfitTypes(availableTypes);
                setLoadError("");
                onOccasionChange((value) => value || matchingOption(
                    availableOccasions, outfitDraft.occasionSuggestion
                ));
                onOutfitTypeChange((value) => value || matchingOption(
                    availableTypes, outfitDraft.outfitTypeSuggestion
                ));
            })
            .catch((requestError) => {
                if (current) setLoadError(
                    requestError.response?.data?.message ||
                    requestError.message || "Could not load occasions and outfit types."
                );
            })
            .finally(() => {
                if (current) setLoading(false);
            });
        return () => { current = false; };
    }, [outfitDraft.occasionSuggestion, outfitDraft.outfitTypeSuggestion,
        onOccasionChange, onOutfitTypeChange, reloadOptions]);

    const retryOptions = () => {
        setLoading(true);
        setLoadError("");
        setReloadOptions((value) => value + 1);
    };

    const addOption = async (event, kind) => {
        event.preventDefault();
        const name = (kind === "occasion" ? newOccasion : newOutfitType).trim();
        if (!name || adding || saving) return;
        setAdding(kind);
        setError("");
        try {
            const response = kind === "occasion"
                ? await createOccasion({ name })
                : await createOutfitType({ name });
            const option = kind === "occasion" ? response.occasion : response.outfitType;
            if (!response.success || !option?._id) {
                throw new Error(`The server did not confirm the new ${kind}.`);
            }
            if (kind === "occasion") {
                setOccasions((current) => [...current, option]);
                onOccasionChange(option._id);
                setNewOccasion("");
            } else {
                setOutfitTypes((current) => [...current, option]);
                onOutfitTypeChange(option._id);
                setNewOutfitType("");
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || requestError.message ||
                `Could not add the ${kind}.`);
        } finally {
            setAdding("");
        }
    };

    const gender = outfitDraft.genderSuggestion;
    const choices = itemSuggestions.map((_, index) => selectedItems[index] ?? null);
    const missingIndexes = choices.flatMap((item, index) => item?._id ? [] : [index + 1]);
    const selectedIds = choices.filter(Boolean).map((item) => item._id);
    const repeatedItem = new Set(selectedIds).size !== selectedIds.length;
    const wrongGender = choices.some((item) => item && item.gender !== gender);
    const wrongCategory = choices.some((item, index) =>
        item && item.itemType !== itemSuggestions[index].itemType
    );
    const title = outfitDraft.title?.trim() ?? "";
    const validationMessage = !imageFile
        ? "Choose an outfit cover image."
        : !title
            ? "Add an outfit title in the draft."
            : !["men", "women"].includes(gender)
                ? "Choose Men or Women in the draft."
                : itemSuggestions.length === 0
                    ? "Add at least one garment."
                    : missingIndexes.length
                        ? `Select a saved catalog item for garment ${missingIndexes.join(", ")}.`
                        : repeatedItem
                            ? "Choose a different saved item for each garment."
                            : wrongGender
                                ? "A selected item's gender differs from the outfit. Choose a matching item."
                                : wrongCategory
                                    ? "A selected item's category differs from its garment slot. Choose a matching item."
                                    : !occasionId || !outfitTypeId
                                        ? "Choose an existing occasion and outfit type."
                                        : "";
    const totalPrice = choices.reduce((sum, item) =>
        sum + (Number(item?.price) || 0), 0
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (saving || loading || validationMessage) return;
        setError("");

        const formData = new FormData();
        formData.append("coverImage", imageFile);
        formData.append("title", title);
        formData.append("description", outfitDraft.description?.trim() ?? "");
        formData.append("gender", gender);
        formData.append("season", outfitDraft.seasonSuggestion || "all-season");
        formData.append("occasion", occasionId);
        formData.append("outfitType", outfitTypeId);
        formData.append("items", JSON.stringify(selectedIds));
        formData.append("isTrending", "false");
        formData.append("isCelebrityInspired", "false");

        try {
            await onSave(formData);
        } catch (requestError) {
            setError(requestError.response?.data?.message || requestError.message ||
                "Could not save the outfit. Please try again.");
        }
    };

    return (
        <section aria-labelledby="outfit-review-heading" className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-lg shadow-green-800/5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-green-100 bg-green-50/60 px-5 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-700 text-white"><CheckCircle2 size={21} /></span>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-green-600">Step 04 · Final review</p>
                        <h2 id="outfit-review-heading" className="font-display text-3xl text-green-900">The finished look</h2>
                    </div>
                </div>
                <button type="button" onClick={onBack} disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-50 disabled:opacity-60">
                    <ArrowLeft size={16} /> Back to garments
                </button>
            </div>

            <div className="space-y-6 p-5 sm:p-8">
            <div className="grid gap-5 rounded-2xl border border-green-100 bg-[#f8fbf7] p-4 sm:grid-cols-[180px_1fr]">
                {imagePreview && <img src={imagePreview} alt="Outfit cover preview"
                    className="max-h-64 w-full rounded-xl bg-white object-contain" />}
                <div className="space-y-2 text-sm text-text-secondary">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-800"><Sparkles size={12} /> Outfit draft</span>
                    <p className="font-display text-3xl text-green-900">{title || "Untitled outfit"}</p>
                    <p>{outfitDraft.description || "No description"}</p>
                    <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-green-600">
                        {gender || "Gender needed"} · {outfitDraft.seasonSuggestion || "all-season"}
                    </p>
                    <p className="text-xs text-green-600">Cover: {imageFile?.name || "Not chosen"}</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-2xl border border-green-100 p-4">
                    <label className="block space-y-1 text-sm text-text-secondary">
                        <span>Occasion {outfitDraft.occasionSuggestion && `(suggested: ${outfitDraft.occasionSuggestion})`}</span>
                        <select value={occasionId} onChange={(event) => onOccasionChange(event.target.value)}
                            disabled={loading || saving} className={fieldClass}>
                            <option value="">Select an occasion</option>
                            {occasions.map((option) => <option key={option._id} value={option._id}>{option.name}</option>)}
                        </select>
                    </label>
                    {!loading && !loadError && occasions.length === 0 &&
                        <p className="text-sm text-text-muted">No active occasions are saved in this database. Add one below.</p>}
                    <form onSubmit={(event) => addOption(event, "occasion")} className="flex gap-2">
                        <input type="text" aria-label="New occasion name" value={newOccasion}
                            onChange={(event) => setNewOccasion(event.target.value)}
                            placeholder="e.g. Casual" className={fieldClass} />
                        <button type="submit" disabled={!newOccasion.trim() || Boolean(adding) || saving}
                            className="shrink-0 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-100 disabled:opacity-60">
                            {adding === "occasion" ? "Adding..." : "Add occasion"}
                        </button>
                    </form>
                </div>
                <div className="space-y-2 rounded-2xl border border-green-100 p-4">
                    <label className="block space-y-1 text-sm text-text-secondary">
                        <span>Outfit type {outfitDraft.outfitTypeSuggestion && `(suggested: ${outfitDraft.outfitTypeSuggestion})`}</span>
                        <select value={outfitTypeId} onChange={(event) => onOutfitTypeChange(event.target.value)}
                            disabled={loading || saving} className={fieldClass}>
                            <option value="">Select an outfit type</option>
                            {outfitTypes.map((option) => <option key={option._id} value={option._id}>{option.name}</option>)}
                        </select>
                    </label>
                    {!loading && !loadError && outfitTypes.length === 0 &&
                        <p className="text-sm text-text-muted">No active outfit types are saved in this database. Add one below.</p>}
                    <form onSubmit={(event) => addOption(event, "outfit type")} className="flex gap-2">
                        <input type="text" aria-label="New outfit type name" value={newOutfitType}
                            onChange={(event) => setNewOutfitType(event.target.value)}
                            placeholder="e.g. Streetwear" className={fieldClass} />
                        <button type="submit" disabled={!newOutfitType.trim() || Boolean(adding) || saving}
                            className="shrink-0 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-100 disabled:opacity-60">
                            {adding === "outfit type" ? "Adding..." : "Add outfit type"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-2xl text-green-900">Selected pieces</h3>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                        {choices.filter(Boolean).length}/{itemSuggestions.length} ready
                    </span>
                </div>
                {itemSuggestions.map((garment, index) => {
                    const item = choices[index];
                    return <div key={garment.localSlotId} className={`flex items-center gap-3 rounded-xl border p-3 ${
                        item ? "border-green-200 bg-white" : "border-amber-200 bg-amber-50"
                    }`}>
                        {item?.image?.url ? <img src={item.image.url} alt="" className="h-14 w-14 rounded-lg object-cover" /> :
                            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><CircleAlert size={20} /></span>}
                        <div className="min-w-0 flex-1 text-sm">
                            <p className="font-semibold text-green-900">{index + 1}. {garment.name}</p>
                            <p className={item ? "text-text-secondary" : "text-amber-700"}>
                                {item ? `${item.name} · ${item.shoppingSite} · ₹${item.price}` : "No saved item selected"}
                            </p>
                        </div>
                        {item && <CheckCircle2 size={18} className="shrink-0 text-green-600" />}
                    </div>;
                })}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-green-800 px-5 py-4 text-white">
                    <span className="text-sm">Estimated outfit total</span>
                    <strong className="text-xl">₹{totalPrice.toLocaleString("en-IN")}</strong>
                </div>
                <p className="text-xs text-text-muted">The server calculates the final total from saved item prices.</p>
            </div>

            {loading && <p role="status" className="text-sm text-text-secondary">Loading outfit options...</p>}
            {loadError && <div className="space-y-1 text-sm">
                <p role="alert" className="text-red-600">{loadError}</p>
                <button type="button" onClick={retryOptions} className="text-accent-hover underline">
                    Reload options
                </button>
            </div>}
            {validationMessage && !loading && <p role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><CircleAlert size={17} className="mt-0.5 shrink-0" /> {validationMessage}</p>}
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <form onSubmit={handleSubmit}>
                <button type="submit" disabled={saving || loading || Boolean(validationMessage) || Boolean(error && occasions.length === 0)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                    <Save size={17} /> {saving ? "Saving outfit..." : "Save this outfit"}
                </button>
            </form>
            </div>
        </section>
    );
}
