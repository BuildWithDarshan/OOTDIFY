import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeOutfit } from "../services/outfitAnalyzerService.js";
import { SearchOutfitCatalog } from "../services/outfitCatalogSearchService.js";
import { getRetailerSearchLinks } from "../services/retailerSearchLinksService.js";
import { createOutfit } from "../services/outfitService.js";
import ProductImportPanel from "../components/ProductImportPanel.jsx";
import CatalogItemSearch from "../components/CatalogItemSearch.jsx";
import OutfitReviewPanel from "../components/OutfitReviewPanel.jsx";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const MAX_GARMENTS = 12;
const MAX_QUERIES = 5;

const fieldClass =
    "w-full border border-border rounded-lg px-3 py-2 text-text-primary bg-bg focus:outline-none focus:border-accent";

function safeProductUrl(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

function withGenderSuffix(value, gender, forSearch = false) {
    const base = String(value ?? "")
        .trim()
        .replace(/\s+(?:for\s+)?(?:men|women)$/i, "")
        .trim();
    if (!base || !["men", "women"].includes(gender)) return base;
    return forSearch ? `${base} for ${gender}` : `${base} ${gender[0].toUpperCase()}${gender.slice(1)}`;
}

const ALLOWED_SUBTYPES_BY_TYPE = {
    top: [
        "t-shirt",
        "shirt",
        "button-up-shirt",
        "polo-shirt",
        "tank-top",
        "sweater",
        "hoodie",
        "sweatshirt",
        "kurta",
        "blouse",
        "crop-top",
    ],
    bottom: [
        "jeans",
        "trousers",
        "pants",
        "chinos",
        "shorts",
        "joggers",
        "cargo-pants",
        "wide-leg-jeans",
        "skirt",
        "leggings",
        "wide-leg-trousers",
        "wide-leg-pants",
    ],
    footwear: [
        "sneakers",
        "boots",
        "loafers",
        "sandals",
        "formal-shoes",
        "slides",
    ],
    outerwear: [
        "jacket",
        "blazer",
        "coat",
        "bomber-jacket",
        "denim-jacket",
        "cardigan",
        "overshirt",
        "open-shirt-layer",
        "shirt",
        "button-up-shirt",
    ],
};

const ITEM_TYPES = ["top", "bottom", "footwear", "outerwear"];

const OutfitAnalyzer = () => {
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const previewUrl = useRef("");
    const discoveryRevision = useRef(0);
    const [discoveryVersion, setDiscoveryVersion] = useState(0);
    const nextSlotId = useRef(0);
    const [draft, setDraft] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [catalogResults, setCatalogResults] = useState({});
    const [selectedCatalogItems, setSelectedCatalogItems] = useState({});
    const [catalogSearching, setCatalogSearching] = useState(false);
    const [catalogError, setCatalogError] = useState("");
    const [retailerLinkResults, setRetailerLinkResults] = useState({});
    const [retailerLinksLoading, setRetailerLinksLoading] = useState({});
    const [retailerLinksError, setRetailerLinksError] = useState("");
    const [error, setError] = useState("");
    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewOccasionId, setReviewOccasionId] = useState("");
    const [reviewOutfitTypeId, setReviewOutfitTypeId] = useState("");
    const [savingOutfit, setSavingOutfit] = useState(false);
    const saveInFlight = useRef(false);

    useEffect(() => () => {
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    }, []);

    const invalidateDiscovery = () => {
        discoveryRevision.current += 1;
        setDiscoveryVersion(discoveryRevision.current);
        setCatalogResults({});
        setSelectedCatalogItems({});
        setCatalogSearching(false);
        setCatalogError("");
        setRetailerLinkResults({});
        setRetailerLinksLoading({});
        setRetailerLinksError("");
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0] ?? null;
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
        previewUrl.current = "";
        setImagePreview("");
        setError("");
        setDraft(null);
        setReviewOpen(false);
        setReviewOccasionId("");
        setReviewOutfitTypeId("");
        invalidateDiscovery();

        if (file && file.size > MAX_IMAGE_SIZE) {
            setImageFile(null);
            event.target.value = "";
            setError("Choose an image smaller than 4 MB.");
            return;
        }

        setImageFile(file);
        if (file) {
            previewUrl.current = URL.createObjectURL(file);
            setImagePreview(previewUrl.current);
        }
    };

    const handleAnalyze = async (event) => {
        event.preventDefault();
        setError("");
        setReviewOpen(false);

        if (!imageFile) {
            setError("Choose an outfit image first.");
            return;
        }

        const formData = new FormData();
        formData.append("image", imageFile);

        setAnalyzing(true);

        try {
            const response = await analyzeOutfit(formData);

            if (!response.success || !response.data) {
                throw new Error("The analyzer returned an unexpected response.");
            }

            setDraft({
                ...response.data,
                itemSuggestions: response.data.itemSuggestions.map((item) => ({
                    ...item,
                    localSlotId: ++nextSlotId.current,
                })),
            });
            setReviewOccasionId("");
            setReviewOutfitTypeId("");
            invalidateDiscovery();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    requestError.message ||
                    "Failed to analyze the outfit."
            );
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSaveOutfit = async (formData) => {
        if (saveInFlight.current) return;
        saveInFlight.current = true;
        setSavingOutfit(true);
        try {
            const response = await createOutfit(formData);
            if (!response.success || !response.outfit?._id) {
                throw new Error("The server did not confirm that the outfit was saved.");
            }
            navigate("/outfits", { replace: true });
        } finally {
            saveInFlight.current = false;
            setSavingOutfit(false);
        }
    };

    const updateOutfitField = (field, value) => {
        if (field === "genderSuggestion") invalidateDiscovery();
        setDraft((current) => ({
            ...current,
            outfitDraft: {
                ...current.outfitDraft,
                [field]: value,
            },
            itemSuggestions: field === "genderSuggestion"
                ? current.itemSuggestions.map((item) => ({
                    ...item,
                    genderSuggestion: value,
                    name: withGenderSuffix(item.name, value),
                    searchQueries: item.searchQueries.map((query) =>
                        withGenderSuffix(query, value, true)
                    ),
                }))
                : current.itemSuggestions,
        }));
    };

    const updateItemField = (index, field, value) => {
        invalidateDiscovery();
        setDraft((current) => ({
            ...current,
            itemSuggestions: current.itemSuggestions.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const updateItemType = (index, itemType) => {
    invalidateDiscovery();
    setDraft((current) => ({
        ...current,
        itemSuggestions: current.itemSuggestions.map((item, itemIndex) =>
            itemIndex === index
                ? {
                      ...item,
                      itemType,
                      itemSubType: ALLOWED_SUBTYPES_BY_TYPE[itemType][0],
                  }
                : item
        ),
    }));
};

   const updateItemSubType = (index, itemSubType) => {
    updateItemField(index, "itemSubType", itemSubType);
};

const addGarment = () => {
    if (draft.itemSuggestions.length >= MAX_GARMENTS) return;
    const localSlotId = ++nextSlotId.current;
    invalidateDiscovery();
    setDraft((current) => ({
        ...current,
        itemSuggestions: [
            ...current.itemSuggestions,
            {
                localSlotId,
                name: withGenderSuffix("T-Shirt", current.outfitDraft.genderSuggestion),
                brand: null,
                genderSuggestion:
                    current.outfitDraft.genderSuggestion ?? null,
                itemType: "top",
                itemSubType: "t-shirt",
                visualAnalysis: {
                    colors: [],
                    visualDescription: "",
                    fit: null,
                    pattern: null,
                },
                searchQueries: [withGenderSuffix("t-shirt", current.outfitDraft.genderSuggestion, true)],
                isWardrobeEssential: false,
                missingRequiredItemFields: [
                    "image",
                    "price",
                    "referralLink",
                    "shoppingSite",
                ],
            },
        ],
    }));
};

const removeGarment = (index) => {
      invalidateDiscovery();
      setDraft((current) => ({
          ...current,
          itemSuggestions: current.itemSuggestions.filter(
              (_, itemIndex) => itemIndex !== index
          ),
      }));
  };

    const updateVisualField = (index, field, value) => {
        invalidateDiscovery();
        setDraft((current) => ({
            ...current,
            itemSuggestions: current.itemSuggestions.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          visualAnalysis: {
                              ...item.visualAnalysis,
                              [field]: value,
                          },
                      }
                    : item
            ),
        }));
    };

    const updateColors = (index, value) => {
        updateVisualField(
            index,
            "colors",
            value
                .split(",")
                .map((color) => color.trim())
                .filter(Boolean)
        );
    };

    const updateSearchQuery = (itemIndex, queryIndex, value) => {
        invalidateDiscovery();
        setDraft((current) => ({
            ...current,
            itemSuggestions: current.itemSuggestions.map((item, index) => {
                if (index !== itemIndex) return item;

                const searchQueries = [...item.searchQueries];
                searchQueries[queryIndex] = value;

                return { ...item, searchQueries };
            }),
        }));
    };

    const addSearchQuery = (itemIndex) => {
        invalidateDiscovery();
        setDraft((current) => ({
            ...current,
            itemSuggestions: current.itemSuggestions.map((item, index) =>
                index === itemIndex && item.searchQueries.length < MAX_QUERIES
                    ? { ...item, searchQueries: [...item.searchQueries, ""] }
                    : item
            ),
        }));
    };

    const removeSearchQuery = (itemIndex, queryIndex) => {
        invalidateDiscovery();
        setDraft((current) => ({
            ...current,
            itemSuggestions: current.itemSuggestions.map((item, index) =>
                index === itemIndex
                    ? { ...item, searchQueries: item.searchQueries.filter((_, i) => i !== queryIndex) }
                    : item
            ),
        }));
    };

    const buildGarmentPayload = (item) => {
      const gender =
          draft?.outfitDraft?.genderSuggestion ||
          item.genderSuggestion ||
          null;
      return {
          itemType: item.itemType,
          itemSubType: item.itemSubType,
          ...(gender === "men" || gender === "women" ? { gender } : {}),
          colors: item.visualAnalysis?.colors ?? [],
          name: item.name || undefined,
          fit: item.visualAnalysis?.fit || undefined,
          pattern: item.visualAnalysis?.pattern || undefined,
          visualDescription: item.visualAnalysis?.visualDescription || undefined,
          searchQueries: (item.searchQueries ?? [])
              .map((query) => query.trim())
              .filter(Boolean)
              .slice(0, 5),
      };
  };

  const handleSearchCatalog = async (indexes) => {
      if (!draft?.itemSuggestions?.length) return;
      const missingColor = indexes.find((index) =>
          !draft.itemSuggestions[index].visualAnalysis?.colors?.length
      );
      if (missingColor !== undefined) {
          setCatalogError(`Add a visible color for garment ${missingColor + 1} before searching the catalog.`);
          return;
      }
      const revision = discoveryRevision.current;
      setCatalogError("");
      setCatalogSearching(true);
      setCatalogResults((current) => Object.fromEntries(
          Object.entries(current).filter(([key]) => !indexes.includes(Number(key)))
      ));
      setSelectedCatalogItems((current) => Object.fromEntries(
          Object.entries(current).filter(([key]) => !indexes.includes(Number(key)))
      ));
      try {
          const garments = indexes.map((index) =>
              buildGarmentPayload(draft.itemSuggestions[index])
          );
          const response = await SearchOutfitCatalog(garments);
          if (!response.success || !Array.isArray(response.results)) {
              throw new Error("Catalog search returned an unexpected response.");
          }
          if (revision !== discoveryRevision.current) return;
          setCatalogResults((current) => {
              const next = { ...current };
              response.results.forEach((result) => {
                  const originalIndex = indexes[result.garmentIndex];
                  next[originalIndex] = result.matches ?? [];
              });
              return next;
          });
      } catch (requestError) {
          if (revision !== discoveryRevision.current) return;
          setCatalogError(
              requestError.response?.data?.message ||
                  requestError.message ||
                  "Failed to search the item catalog."
          );
      } finally {
          if (revision === discoveryRevision.current) setCatalogSearching(false);
      }
  };
  const searchAllGarments = () => {
      const indexes = draft.itemSuggestions.map((_, index) => index);
      handleSearchCatalog(indexes);
  };
  const searchOneGarment = (index) => {
      handleSearchCatalog([index]);
  };

  const loadRetailerSearchLinks = async (index) => {
      const item = draft?.itemSuggestions?.[index];
      if (!item) return;

      const queries = (item.searchQueries ?? [])
          .map((query) => query.trim())
          .filter(Boolean)
          .slice(0, 5);

      if (queries.length === 0) {
          setRetailerLinksError(
              "Add at least one search query before opening retailer searches."
          );
          return;
      }

      setRetailerLinksError("");
      const revision = discoveryRevision.current;
      setRetailerLinksLoading((current) => ({ ...current, [index]: true }));

      try {
          const response = await getRetailerSearchLinks({ queries });

          if (!response.success || !Array.isArray(response.results)) {
              throw new Error(
                  "Retailer search links returned an unexpected response."
              );
          }

          if (revision !== discoveryRevision.current) return;

          setRetailerLinkResults((current) => ({
              ...current,
              [index]: response.results,
          }));
      } catch (requestError) {
          if (revision !== discoveryRevision.current) return;
          setRetailerLinksError(
              requestError.response?.data?.message ||
                  requestError.message ||
                  "Failed to load retailer search links."
          );
      } finally {
          if (revision === discoveryRevision.current) setRetailerLinksLoading((current) => ({
              ...current,
              [index]: false,
          }));
      }
  };

    return (
        <div className="max-w-5xl">
            <div className="mb-6">
                <h1 className="font-display text-3xl text-text-primary">
                    Outfit Analyzer
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                    Analyze an outfit image, review garments, and select or save products.
                    The outfit draft is not saved yet.
                </p>
            </div>

            <form
                onSubmit={handleAnalyze}
                className="mb-8 space-y-4 rounded-xl border border-border bg-bg p-4 sm:p-6"
            >
                <div>
                    <label className="mb-2 block text-sm text-text-secondary">
                        Outfit image
                    </label>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="w-full text-sm text-text-secondary"
                    />
                    <p className="mt-1 text-xs text-text-muted">
                        JPEG, PNG, or WEBP. Maximum size: 4 MB.
                    </p>
                </div>

                {imagePreview && (
                    <img
                        src={imagePreview}
                        alt="Selected outfit"
                        className="max-h-96 max-w-full rounded-lg border border-border object-contain"
                    />
                )}

                {error && (
                    <p
                        role="alert"
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white"
                    >
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={!imageFile || analyzing}
                    className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-on-accent hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {analyzing ? "Analyzing image..." : "Analyze Outfit"}
                </button>

                {analyzing && (
                    <p role="status" className="text-sm text-text-secondary">
                        Analysis may take a few minutes on this computer.
                    </p>
                )}
            </form>

            {draft && (
                <section aria-labelledby="draft-heading" className="space-y-6">
                    <h2
                        id="draft-heading"
                        className="font-display text-2xl text-text-primary"
                    >
                        Editable Draft
                    </h2>

                    <div className="space-y-5 rounded-xl border border-border bg-bg p-4 sm:p-6">
                        <div>
                            <label className="mb-1 block text-sm text-text-secondary">
                                Title
                            </label>
                            <input
                                value={draft.outfitDraft.title ?? ""}
                                onChange={(event) =>
                                    updateOutfitField("title", event.target.value)
                                }
                                className={fieldClass}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-text-secondary">
                                Description
                            </label>
                            <textarea
                                rows={3}
                                value={draft.outfitDraft.description ?? ""}
                                onChange={(event) =>
                                    updateOutfitField(
                                        "description",
                                        event.target.value
                                    )
                                }
                                className={fieldClass}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm text-text-secondary">
                                    Gender suggestion
                                </label>
                                <select
                                    value={
                                        draft.outfitDraft.genderSuggestion ?? ""
                                    }
                                    onChange={(event) =>
                                        updateOutfitField(
                                            "genderSuggestion",
                                            event.target.value || null
                                        )
                                    }
                                    className={fieldClass}
                                >
                                    <option value="">Not specified</option>
                                    <option value="men">Men</option>
                                    <option value="women">Women</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-text-secondary">
                                    Season suggestion
                                </label>
                                <select
                                    value={
                                        draft.outfitDraft.seasonSuggestion ?? ""
                                    }
                                    onChange={(event) =>
                                        updateOutfitField(
                                            "seasonSuggestion",
                                            event.target.value || null
                                        )
                                    }
                                    className={fieldClass}
                                >
                                    <option value="">Not specified</option>
                                    <option value="summer">Summer</option>
                                    <option value="winter">Winter</option>
                                    <option value="monsoon">Monsoon</option>
                                    <option value="all-season">All season</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-text-secondary">
                                    Occasion suggestion
                                </label>
                                <input
                                    value={
                                        draft.outfitDraft.occasionSuggestion ?? ""
                                    }
                                    onChange={(event) =>
                                        updateOutfitField(
                                            "occasionSuggestion",
                                            event.target.value
                                        )
                                    }
                                    className={fieldClass}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-text-secondary">
                                    Outfit type suggestion
                                </label>
                                <input
                                    value={
                                        draft.outfitDraft.outfitTypeSuggestion ??
                                        ""
                                    }
                                    onChange={(event) =>
                                        updateOutfitField(
                                            "outfitTypeSuggestion",
                                            event.target.value
                                        )
                                    }
                                    className={fieldClass}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="font-display text-xl text-text-primary">
          Suggested Items ({draft.itemSuggestions.length})
      </h3>
      <div className="flex flex-wrap gap-2">
          <button
              type="button"
              onClick={searchAllGarments}
              disabled={catalogSearching || draft.itemSuggestions.length === 0}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
              {catalogSearching ? "Searching catalog..." : "Search catalog"}
          </button>
          <button
              type="button"
              onClick={addGarment}
              disabled={draft.itemSuggestions.length >= MAX_GARMENTS}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-60"
          >
              + Add Garment ({draft.itemSuggestions.length}/{MAX_GARMENTS})
          </button>
      </div>
  </div>
  {catalogError && (
      <p role="alert" className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white">
          {catalogError}
      </p>
  )}
  {retailerLinksError && (
      <p role="alert" className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white">
          {retailerLinksError}
      </p>
  )}

                        {draft.itemSuggestions.map((item, index) => (
                            <article
                                key={item.localSlotId}
                                className="space-y-4 rounded-xl border border-border bg-bg p-4 sm:p-6"
                            >
                                <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
    <div>
        <label className="mb-1 block text-sm text-text-secondary">
            Category
        </label>
        <select
            value={item.itemType}
            onChange={(event) =>
                updateItemType(index, event.target.value)
            }
            className={fieldClass}
        >
            {ITEM_TYPES.map((type) => (
                <option key={type} value={type}>
                    {type}
                </option>
            ))}
        </select>
    </div>

    <div>
        <label className="mb-1 block text-sm text-text-secondary">
            Subtype
        </label>
        <select
            value={item.itemSubType}
            onChange={(event) =>
                updateItemSubType(index, event.target.value)
            }
            className={fieldClass}
        >
            {ALLOWED_SUBTYPES_BY_TYPE[item.itemType].map((subtype) => (
                <option key={subtype} value={subtype}>
                    {subtype.replaceAll("-", " ")}
                </option>
            ))}
        </select>
    </div>

    <button
        type="button"
        onClick={() => removeGarment(index)}
        className="rounded-lg border border-border px-4 py-2 text-sm text-red-600 hover:bg-bg-subtle"
        aria-label={`Remove ${item.name || "garment"}`}
    >
        Remove
    </button>
</div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm text-text-secondary">
                                            Item name
                                        </label>
                                        <input
                                            value={item.name}
                                            onChange={(event) =>
                                                updateItemField(
                                                    index,
                                                    "name",
                                                    event.target.value
                                                )
                                            }
                                            className={fieldClass}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm text-text-secondary">
                                            Visible colors (comma-separated)
                                        </label>
                                        <input
                                            value={item.visualAnalysis.colors.join(
                                                ", "
                                            )}
                                            onChange={(event) =>
                                                updateColors(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            className={fieldClass}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm text-text-secondary">
                                        Visual description
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={
                                            item.visualAnalysis.visualDescription
                                        }
                                        onChange={(event) =>
                                            updateVisualField(
                                                index,
                                                "visualDescription",
                                                event.target.value
                                            )
                                        }
                                        className={fieldClass}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {item.searchQueries.map((query, queryIndex) => (
                                        <div key={queryIndex}>
                                            <label className="mb-1 block text-sm text-text-secondary">
                                                Search query {queryIndex + 1}
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={query}
                                                    maxLength={120}
                                                    onChange={(event) =>
                                                        updateSearchQuery(index, queryIndex, event.target.value)
                                                    }
                                                    className={fieldClass}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSearchQuery(index, queryIndex)}
                                                    className="rounded-lg border border-border px-3 text-sm text-red-600 hover:bg-bg-subtle"
                                                    aria-label={`Remove search query ${queryIndex + 1}`}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addSearchQuery(index)}
                                    disabled={item.searchQueries.length >= MAX_QUERIES}
                                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-primary hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    + Add search query
                                </button>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => searchOneGarment(index)}
                                        disabled={catalogSearching}
                                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Find in catalog
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            loadRetailerSearchLinks(index)
                                        }
                                        disabled={Boolean(
                                            retailerLinksLoading[index]
                                        )}
                                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {retailerLinksLoading[index]
                                            ? "Loading retailer links..."
                                            : "Open retailer searches"}
                                    </button>
                                </div>

                                <CatalogItemSearch
                                    key={`${item.localSlotId}-${discoveryVersion}`}
                                    garment={item}
                                    outfitGender={draft.outfitDraft.genderSuggestion}
                                    selectedItem={selectedCatalogItems[index]}
                                    onSelect={(selectedItem) => setSelectedCatalogItems((current) => ({
                                        ...current,
                                        [index]: selectedItem,
                                    }))}
                                />

  {catalogResults[index] && (
      <div className="space-y-3 border-t border-border pt-4">
          <h4 className="text-sm font-medium text-text-primary">
              From OOTDIFY catalog
          </h4>
          {catalogResults[index].length === 0 ? (
              <p className="text-sm text-text-muted">No catalog item matches this garment type and visible color.</p>
          ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {catalogResults[index].map((match) => {
                      const selectedId = selectedCatalogItems[index]?._id;
                      const isSelected = selectedId === match._id;
                      return (
                          <li key={match._id}>
                              <button
                                  type="button"
                                  onClick={() =>
                                      setSelectedCatalogItems((current) => ({
                                          ...current,
                                          [index]: match,
                                      }))
                                  }
                                  aria-pressed={isSelected}
                                  className={`flex w-full gap-3 rounded-lg border p-3 text-left ${
                                      isSelected
                                          ? "border-accent bg-bg-subtle"
                                          : "border-border hover:bg-bg-subtle"
                                  }`}
                              >
                                  {match.image?.url ? (
                                      <img
                                          src={match.image.url}
                                          alt={match.name}
                                          className="h-16 w-16 rounded object-cover"
                                      />
                                  ) : (
                                      <div className="flex h-16 w-16 items-center justify-center rounded bg-bg-subtle text-xs text-text-muted">
                                          No image
                                      </div>
                                  )}
                                  <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-text-primary">
                                          {match.name}
                                      </p>
                                      <p className="text-xs text-text-secondary">
                                          {[match.brand, match.shoppingSite]
                                              .filter(Boolean)
                                              .join(" · ") || "—"}
                                      </p>
                                      <p className="text-xs text-text-muted">
                                          {match.price != null
                                              ? `₹${match.price}`
                                              : "Price unavailable"}
                                      </p>
                                      <p className="text-xs text-text-muted">
                                          {[match.gender, match.itemSubType].filter(Boolean).join(" · ")}
                                      </p>
                                      {isSelected && (
                                          <p className="text-xs font-medium text-accent-hover">Selected</p>
                                      )}
                                  </div>
                              </button>
                              {safeProductUrl(match.referralLink) && (
                                  <a
                                      href={safeProductUrl(match.referralLink)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-1 inline-block text-xs text-accent-hover underline"
                                  >
                                      View saved product link
                                  </a>
                              )}
                          </li>
                      );
                  })}
              </ul>
          )}
      </div>
  )}

  {retailerLinkResults[index] && (
      <div className="space-y-4 border-t border-border pt-4">
          <div>
              <h4 className="text-sm font-medium text-text-primary">
                  Approved retailer search links
              </h4>
              <p className="mt-1 text-xs text-text-muted">
                  External search pages only — not imported product results.
              </p>
          </div>

          {retailerLinkResults[index].length === 0 ? (
              <p className="text-sm text-text-muted">
                  No retailer search links available.
              </p>
          ) : (
              retailerLinkResults[index].map((queryResult) => {
                   const marketplaces = (queryResult.links ?? []).filter(
                       (link) => link.available && link.sourceType === "marketplace"
                  );
                  const brands = (queryResult.links ?? []).filter(
                       (link) => link.available && link.sourceType === "brand"
                  );
                   const unavailable = (queryResult.links ?? []).filter(
                       (link) => !link.available
                   );

                  return (
                      <div
                          key={`${index}-${queryResult.query}`}
                          className="space-y-3"
                      >
                          <p className="text-sm text-text-secondary">
                              Query:{" "}
                              <span className="font-medium text-text-primary">
                                  {queryResult.query}
                              </span>
                          </p>

                          {marketplaces.length > 0 && (
                              <div className="space-y-2">
                                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                                      Marketplaces
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                      {marketplaces.map((link) => (
                                          <a
                                              key={`${queryResult.query}-${link.sourceId}`}
                                              href={link.searchUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-primary hover:border-accent hover:bg-bg-subtle"
                                          >
                                              {link.displayName}
                                          </a>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {brands.length > 0 && (
                              <div className="space-y-2">
                                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                                      Brands
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                      {brands.map((link) => (
                                          <a
                                              key={`${queryResult.query}-${link.sourceId}`}
                                              href={link.searchUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-primary hover:border-accent hover:bg-bg-subtle"
                                          >
                                              {link.displayName}
                                          </a>
                                      ))}
                                  </div>
                              </div>
                          )}
                           {unavailable.length > 0 && (
                               <div className="text-xs text-text-muted">
                                   <p>Search link unavailable. Visit the source and search manually:</p>
                                   <div className="mt-1 flex flex-wrap gap-3">
                                       {unavailable.map((link) => (
                                           <a
                                               key={link.sourceId}
                                               href={link.homepageUrl}
                                               target="_blank"
                                               rel="noopener noreferrer"
                                               className="text-accent-hover underline"
                                           >
                                               {link.displayName}
                                           </a>
                                       ))}
                                   </div>
                               </div>
                           )}
                      </div>
                  );
              })
          )}
      </div>
  )}
                                {selectedCatalogItems[index] && (
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                                        <div className="flex items-center gap-3">
                                            {selectedCatalogItems[index].image?.url && (
                                                <img
                                                    src={selectedCatalogItems[index].image.url}
                                                    alt=""
                                                    className="h-12 w-12 rounded object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="text-xs font-medium text-text-muted">Selected saved item</p>
                                                <p className="text-sm text-text-primary">{selectedCatalogItems[index].name}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCatalogItems((current) => {
                                                const next = { ...current };
                                                delete next[index];
                                                return next;
                                            })}
                                            className="text-sm text-accent-hover underline"
                                        >
                                            Clear selection
                                        </button>
                                    </div>
                                )}
                                <ProductImportPanel
                                    garment={item}
                                    outfitGender={draft.outfitDraft.genderSuggestion}
                                    selectedItem={selectedCatalogItems[index]}
                                    revision={discoveryVersion}
                                    onSelectItem={(selectedItem, selectionRevision) => {
                                        if (selectionRevision !== discoveryRevision.current) return;
                                        setSelectedCatalogItems((current) => ({
                                            ...current,
                                            [index]: selectedItem,
                                        }));
                                    }}
                                />
                            </article>
                        ))}
                    </div>

                    {reviewOpen ? (
                        <OutfitReviewPanel
                            draft={draft}
                            imageFile={imageFile}
                            imagePreview={imagePreview}
                            selectedItems={selectedCatalogItems}
                            occasionId={reviewOccasionId}
                            onOccasionChange={setReviewOccasionId}
                            outfitTypeId={reviewOutfitTypeId}
                            onOutfitTypeChange={setReviewOutfitTypeId}
                            saving={savingOutfit}
                            onBack={() => setReviewOpen(false)}
                            onSave={handleSaveOutfit}
                        />
                    ) : (
                        <button type="button" onClick={() => setReviewOpen(true)}
                            className="rounded-lg bg-accent px-5 py-2.5 font-medium text-on-accent hover:bg-accent-hover">
                            Review outfit
                        </button>
                    )}

                    <p className="text-sm text-text-muted">
                        The outfit draft and garment selections are held in this page and will be lost on refresh.
                        Items you explicitly save are stored in the catalog.
                    </p>
                </section>
            )}
        </div>
    );
};

export default OutfitAnalyzer;
