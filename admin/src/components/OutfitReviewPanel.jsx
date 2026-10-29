import { useEffect, useState } from "react";
import {
    createOccasion, createOutfitType, getOccasions, getOutfitTypes,
} from "../services/taxonomyService.js";

const fieldClass =
    "w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none";

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
        <section aria-labelledby="outfit-review-heading" className="space-y-5 rounded-xl border border-border bg-bg p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="outfit-review-heading" className="font-display text-2xl text-text-primary">
                    Review and save outfit
                </h2>
                <button type="button" onClick={onBack} disabled={saving}
                    className="rounded-lg border border-border px-3 py-2 text-sm text-text-primary disabled:opacity-60">
                    Back to draft
                </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                {imagePreview && <img src={imagePreview} alt="Outfit cover preview"
                    className="max-h-64 w-full rounded-lg border border-border object-contain" />}
                <div className="space-y-2 text-sm text-text-secondary">
                    <p className="text-lg font-medium text-text-primary">{title || "Untitled outfit"}</p>
                    <p>{outfitDraft.description || "No description"}</p>
                    <p>Gender: {gender || "Not chosen"} · Season: {outfitDraft.seasonSuggestion || "all-season"}</p>
                    <p>Cover image: {imageFile?.name || "Not chosen"}</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
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
                            className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm text-text-primary disabled:opacity-60">
                            {adding === "occasion" ? "Adding..." : "Add occasion"}
                        </button>
                    </form>
                </div>
                <div className="space-y-2">
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
                            className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm text-text-primary disabled:opacity-60">
                            {adding === "outfit type" ? "Adding..." : "Add outfit type"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="font-medium text-text-primary">Selected products ({choices.filter(Boolean).length}/{itemSuggestions.length})</h3>
                {itemSuggestions.map((garment, index) => {
                    const item = choices[index];
                    return <div key={garment.localSlotId} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        {item?.image?.url && <img src={item.image.url} alt="" className="h-14 w-14 rounded object-cover" />}
                        <div className="min-w-0 flex-1 text-sm">
                            <p className="font-medium text-text-primary">{index + 1}. {garment.name}</p>
                            <p className={item ? "text-text-secondary" : "text-amber-700"}>
                                {item ? `${item.name} · ${item.shoppingSite} · ₹${item.price}` : "No saved item selected"}
                            </p>
                        </div>
                    </div>;
                })}
                <p className="text-sm font-medium text-text-primary">Estimated total: ₹{totalPrice.toLocaleString("en-IN")}</p>
                <p className="text-xs text-text-muted">The server will calculate the final total from the saved item prices.</p>
            </div>

            {loading && <p role="status" className="text-sm text-text-secondary">Loading outfit options...</p>}
            {loadError && <div className="space-y-1 text-sm">
                <p role="alert" className="text-red-600">{loadError}</p>
                <button type="button" onClick={retryOptions} className="text-accent-hover underline">
                    Reload options
                </button>
            </div>}
            {validationMessage && !loading && <p role="alert" className="text-sm text-amber-700">{validationMessage}</p>}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <form onSubmit={handleSubmit}>
                <button type="submit" disabled={saving || loading || Boolean(validationMessage) || Boolean(error && occasions.length === 0)}
                    className="rounded-lg bg-accent px-5 py-2.5 font-medium text-on-accent disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? "Saving outfit..." : "Save outfit"}
                </button>
            </form>
        </section>
    );
}
