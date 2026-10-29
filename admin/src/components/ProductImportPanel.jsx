import { useRef, useState } from "react";
import { Link2 } from "lucide-react";
import ItemForm from "./ItemForm.jsx";
import { createItem } from "../services/itemService.js";
import { previewProductImport } from "../services/productImportService.js";

const inputClass =
    "w-full rounded-lg border border-border bg-bg px-3 py-2 text-text-primary focus:border-accent focus:outline-none";

const errorMessage = (error, fallback) =>
    error.response?.data?.message || error.message || fallback;

function ExistingItemDetails({ item }) {
    return (
        <div className="flex items-start gap-3">
            {item.image?.url && (
                <img
                    src={item.image.url}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
            )}
            <div className="min-w-0 space-y-1 text-sm text-text-secondary">
                <p className="font-medium text-text-primary">{item.name}</p>
                <p>{item.shoppingSite} · ₹{item.price}</p>
                <p>{item.gender} · {item.itemType} · {item.itemSubType}</p>
                {/^https:\/\//i.test(item.referralLink ?? "") && (
                    <a
                        href={item.referralLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-accent-hover underline"
                    >
                        Open product page
                    </a>
                )}
            </div>
        </div>
    );
}

export default function ProductImportPanel({ garment, outfitGender, selectedItem, revision, onSelectItem }) {
    const [open, setOpen] = useState(false);
    const [productUrl, setProductUrl] = useState("");
    const [preview, setPreview] = useState(null);
    const [formSeed, setFormSeed] = useState(null);
    const [previewError, setPreviewError] = useState("");
    const [duplicateItem, setDuplicateItem] = useState(null);
    const [savedItem, setSavedItem] = useState(null);
    const [checking, setChecking] = useState(false);
    const [saving, setSaving] = useState(false);
    const requestRevision = useRef(0);
    const saveInFlight = useRef(false);

    const changeProductUrl = (event) => {
        requestRevision.current += 1;
        setProductUrl(event.target.value);
        setPreview(null);
        setFormSeed(null);
        setPreviewError("");
        setDuplicateItem(null);
        setSavedItem(null);
        setChecking(false);
    };

    const checkProductUrl = async (event) => {
        event.preventDefault();
        const revision = ++requestRevision.current;
        setChecking(true);
        setPreviewError("");
        setDuplicateItem(null);
        setPreview(null);
        setFormSeed(null);

        try {
            const result = await previewProductImport(productUrl.trim());
            if (revision !== requestRevision.current) return;
            if (!result.success || !result.source || !result.productUrl) {
                throw new Error("The product preview returned an unexpected response.");
            }

            setPreview(result);
            setFormSeed({
                name: garment.name?.trim() ?? "",
                price: "",
                referralLink: result.productUrl,
                shoppingSite: result.source.displayName,
                brand: result.source.sourceType === "brand"
                    ? result.source.displayName : "",
                gender: ["men", "women"].includes(outfitGender)
                    ? outfitGender
                    : (["men", "women"].includes(garment.genderSuggestion)
                        ? garment.genderSuggestion : ""),
                itemType: garment.itemType,
                itemSubType: garment.itemSubType,
                isWardrobeEssential: false,
            });
        } catch (error) {
            if (revision === requestRevision.current) {
                setPreviewError(errorMessage(error, "Could not check this product URL."));
            }
        } finally {
            if (revision === requestRevision.current) setChecking(false);
        }
    };

    const saveNewItem = async (formData) => {
        if (saveInFlight.current) return;
        const selectionRevision = revision;
        saveInFlight.current = true;
        setSaving(true);
        setDuplicateItem(null);

        try {
            // Recheck the final edited link before saving. The preview is
            // read-only and the item form lets the administrator correct it.
            const finalPreview = await previewProductImport(formData.get("referralLink"));
            if (!finalPreview.success || finalPreview.productUrl !== preview.productUrl) {
                throw new Error("The product URL changed. Check the new URL before saving.");
            }
            if (finalPreview.existingItem) {
                setDuplicateItem(finalPreview.existingItem);
                throw new Error("This product is already in the catalog. Use the existing item below.");
            }
            if (formData.get("shoppingSite")?.trim() !== finalPreview.source.displayName) {
                throw new Error("Shopping site must match the validated product URL.");
            }

            const result = await createItem(formData);
            if (!result.success || !result.item?._id) {
                throw new Error("The item was not confirmed as saved. Please try again.");
            }

            setSavedItem(result.item);
            onSelectItem(result.item, selectionRevision);
        } finally {
            saveInFlight.current = false;
            setSaving(false);
        }
    };

    const garmentChanged = formSeed && (
        garment.name?.trim() !== formSeed.name ||
        garment.itemType !== formSeed.itemType ||
        garment.itemSubType !== formSeed.itemSubType ||
        (["men", "women"].includes(outfitGender || garment.genderSuggestion)
            ? (outfitGender || garment.genderSuggestion) : "") !== formSeed.gender
    );

    return (
        <section className="space-y-4 border-t border-green-100 pt-4" aria-label="Product import">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-100 disabled:opacity-50"
                aria-expanded={open}
            >
                <Link2 size={16} /> {open ? "Hide product import" : "Import a product URL"}
            </button>

            {open && (
                <div className="space-y-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                    <div>
                        <h4 className="font-medium text-text-primary">Product from an approved source</h4>
                        <p className="mt-1 text-sm text-text-secondary">
                            Paste a direct product page URL after finding the item. The URL is checked against approved sources; no product details are fetched from the retailer.
                        </p>
                    </div>

                    <form onSubmit={checkProductUrl} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <label className="flex-1 text-sm text-text-secondary">
                            Product URL
                            <input
                                type="url"
                                required
                                disabled={saving}
                                value={productUrl}
                                onChange={changeProductUrl}
                                placeholder="https://www.myntra.com/.../buy"
                                className={`mt-1 ${inputClass}`}
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={checking || saving}
                            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent disabled:opacity-60"
                        >
                            {checking ? "Checking..." : "Check product URL"}
                        </button>
                    </form>

                    {previewError && <p role="alert" className="text-sm text-red-600">{previewError}</p>}

                    {preview && (
                        <div className="space-y-4">
                            <p className="text-sm text-text-secondary">
                                Approved source: <strong className="text-text-primary">{preview.source.displayName}</strong>
                            </p>

                            {preview.existingItem ? (
                                <div className="space-y-2 rounded-lg border border-border bg-bg p-3">
                                    <p className="text-sm font-medium text-text-primary">Already in OOTDIFY catalog</p>
                                    <ExistingItemDetails item={preview.existingItem} />
                                    <p className="text-xs text-text-muted">Review its garment type, color, and price before selecting it.</p>
                                    <button
                                        type="button"
                                        onClick={() => onSelectItem(preview.existingItem, revision)}
                                        className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-primary hover:bg-bg-subtle"
                                    >
                                        Use existing item
                                    </button>
                                </div>
                            ) : savedItem ? (
                                <div className="space-y-2 rounded-lg border border-border bg-bg p-3">
                                    <p role="status" className="text-sm font-medium text-text-primary">
                                        {selectedItem?._id === savedItem._id
                                            ? "Item saved and selected for this garment."
                                            : "Item saved in the catalog."}
                                    </p>
                                    <p className="text-sm text-text-secondary">{savedItem.name}</p>
                                    {selectedItem?._id !== savedItem._id && (
                                        <button type="button" onClick={() => onSelectItem(savedItem, revision)} className="text-sm text-accent-hover underline">
                                            Select saved item
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-text-secondary">
                                        The title starts with the identified garment name. Review it against the linked product, then add its current price and image before saving.
                                    </p>
                                    {garmentChanged && (
                                        <p role="alert" className="text-sm text-amber-700">
                                            The garment name, category, or gender changed after this preview. Review those fields in the form before saving.
                                        </p>
                                    )}
                                    {duplicateItem && (
                                        <div className="space-y-2 rounded-lg border border-border bg-bg p-3">
                                            <p className="text-sm text-text-primary">This product is already in the catalog.</p>
                                            <ExistingItemDetails item={duplicateItem} />
                                            <button type="button" onClick={() => onSelectItem(duplicateItem, revision)} className="text-sm text-accent-hover underline">
                                                Use existing item
                                            </button>
                                        </div>
                                    )}
                                    <ItemForm
                                        key={preview.productUrl}
                                        initialData={formSeed}
                                        onSubmit={saveNewItem}
                                        submitting={saving}
                                        submitLabel="Save reviewed item"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
