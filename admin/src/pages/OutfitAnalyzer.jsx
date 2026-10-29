import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, ImagePlus, LoaderCircle,
    Plus, Search, Shirt, Sparkles, Tag, Trash2, WandSparkles,
} from "lucide-react";
import { analyzeOutfit } from "../services/outfitAnalyzerService.js";
import { SearchOutfitCatalog } from "../services/outfitCatalogSearchService.js";
import { getRetailerSearchLinks } from "../services/retailerSearchLinksService.js";
import { createOutfit } from "../services/outfitService.js";
import ProductImportPanel from "../components/ProductImportPanel.jsx";
import CatalogItemSearch from "../components/CatalogItemSearch.jsx";
import OutfitReviewPanel from "../components/OutfitReviewPanel.jsx";
import AnalyzerStepNav from "../components/AnalyzerStepNav.jsx";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const MAX_GARMENTS = 12;
const MAX_QUERIES = 5;

const fieldClass =
    "w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm text-green-900 shadow-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100";
const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-800 transition hover:border-green-500 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50";

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
    const [activeStep, setActiveStep] = useState(1);
    const [expandedGarments, setExpandedGarments] = useState({});
    const [reviewOccasionId, setReviewOccasionId] = useState("");
    const [reviewOutfitTypeId, setReviewOutfitTypeId] = useState("");
    const [savingOutfit, setSavingOutfit] = useState(false);
    const saveInFlight = useRef(false);

    useEffect(() => () => {
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    }, []);

    const goToStep = (step) => {
        if (step > 1 && !draft) return;
        setActiveStep(step);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

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
        setActiveStep(1);
        setExpandedGarments({});
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

            const suggestions = response.data.itemSuggestions.map((item) => ({
                ...item,
                localSlotId: ++nextSlotId.current,
            }));
            setDraft({
                ...response.data,
                itemSuggestions: suggestions,
            });
            setExpandedGarments(suggestions[0] ? { [suggestions[0].localSlotId]: true } : {});
            setReviewOccasionId("");
            setReviewOutfitTypeId("");
            invalidateDiscovery();
            setActiveStep(2);
            window.scrollTo({ top: 0, behavior: "smooth" });
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
    setExpandedGarments((current) => ({ ...current, [localSlotId]: true }));
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

    const selectedCount = draft?.itemSuggestions.filter((_, index) =>
        Boolean(selectedCatalogItems[index]?._id)).length ?? 0;

    return (
        <div className="mx-auto max-w-6xl space-y-7 pb-16">
            <header className="relative overflow-hidden rounded-[2rem] bg-green-800 p-6 text-white shadow-xl shadow-green-800/10 sm:p-9">
                <div aria-hidden="true" className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
                <div aria-hidden="true" className="absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-green-500/20 blur-3xl" />
                <div className="relative max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-green-300/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-green-100">
                        <Sparkles size={13} /> OOTDIFY Studio
                    </span>
                    <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
                        Turn inspiration into an outfit.
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-green-100 sm:text-base">
                        Analyze the image, shape the draft, discover real pieces, and save a look you love.
                    </p>
                </div>
                <div className="relative mt-7 flex items-center gap-3 text-xs text-green-100">
                    <span className="h-1.5 w-28 overflow-hidden rounded-full bg-white/20">
                        <span className="block h-full rounded-full bg-green-300 transition-all" style={{ width: `${activeStep * 25}%` }} />
                    </span>
                    Step {activeStep} of 4
                </div>
            </header>

            <AnalyzerStepNav activeStep={activeStep} hasDraft={Boolean(draft)} onStepChange={goToStep} />

            {activeStep === 1 && <section className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-lg shadow-green-800/5">
                <div className="border-b border-green-100 bg-green-50/60 px-5 py-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-700 text-white"><ImagePlus size={21} /></span>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-green-600">Step 01 · Inspiration</p>
                            <h2 className="font-display text-3xl text-green-900">Start with an image</h2>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-green-700">Upload a clear outfit photo. The analyzer will identify visible clothing and build an editable draft.</p>
                </div>
                <form onSubmit={handleAnalyze} className="space-y-6 p-5 sm:p-8">
                    <div className="grid gap-6 md:grid-cols-[1fr_220px]">
                        <div className="flex min-h-56 flex-col justify-center rounded-2xl border-2 border-dashed border-green-200 bg-[#f8fbf7] p-6 text-center">
                            <ImagePlus size={28} className="mx-auto text-green-600" strokeWidth={1.5} />
                            <label htmlFor="outfit-image" className="mt-3 text-base font-semibold text-green-900">Choose your inspiration photo</label>
                            <p className="mt-1 text-xs text-green-600">JPEG, PNG, or WEBP · Up to 4 MB</p>
                            <input id="outfit-image" type="file" accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageChange}
                                className="mx-auto mt-5 max-w-full text-xs text-green-800 file:mr-3 file:rounded-lg file:border-0 file:bg-green-700 file:px-4 file:py-2.5 file:font-semibold file:text-white hover:file:bg-green-800" />
                            {imageFile && <p className="mt-3 truncate text-xs text-green-700">Selected: {imageFile.name}</p>}
                        </div>
                        <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-2xl border border-green-100 bg-green-50">
                            {imagePreview ? <img src={imagePreview} alt="Selected outfit" className="max-h-72 w-full object-contain" /> :
                                <div className="text-center text-green-400"><Shirt size={38} className="mx-auto" strokeWidth={1.2} /><p className="mt-2 text-xs">Preview appears here</p></div>}
                        </div>
                    </div>
                    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-green-100 pt-5">
                        <p className="text-xs text-green-600">Your draft stays local until you explicitly save the outfit.</p>
                        <button type="submit" disabled={!imageFile || analyzing} className={primaryButton}>
                            {analyzing ? <LoaderCircle size={18} className="animate-spin" /> : <WandSparkles size={18} />}
                            {analyzing ? "Analyzing image..." : "Analyze outfit"}
                            {!analyzing && <ArrowRight size={17} />}
                        </button>
                    </div>
                    {analyzing && <p role="status" className="text-sm text-green-700">Analysis may take a few minutes on this computer.</p>}
                </form>
            </section>}

            {draft && (
                <div className="space-y-6">
                <section hidden={activeStep !== 2} aria-labelledby="draft-heading"
                    className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-lg shadow-green-800/5">
                    <div className="border-b border-green-100 bg-green-50/60 px-5 py-5 sm:px-8">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-700 text-white"><Tag size={21} /></span>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-green-600">Step 02 · The story</p>
                                <h2 id="draft-heading" className="font-display text-3xl text-green-900">Shape your outfit draft</h2>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-green-700">Give the look its final name and refine the details before choosing products.</p>
                    </div>

                    <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_220px] sm:p-8">
                    <div className="space-y-5">
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
                    <aside className="self-start rounded-2xl border border-green-100 bg-[#f8fbf7] p-3">
                        {imagePreview && <img src={imagePreview} alt="Outfit inspiration" className="max-h-72 w-full rounded-xl object-contain" />}
                        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-green-600">Your inspiration</p>
                        <p className="mt-1 text-xs leading-5 text-green-700">Every field is editable. Product choices come next.</p>
                    </aside>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-green-100 bg-[#fbfdfb] px-5 py-5 sm:px-8">
                        <button type="button" onClick={() => goToStep(1)} className={secondaryButton}><ArrowLeft size={16} /> Back to image</button>
                        <button type="button" onClick={() => goToStep(3)} className={primaryButton}>Continue to garments <ArrowRight size={17} /></button>
                    </div>
                </section>

                <section hidden={activeStep !== 3} aria-labelledby="garments-heading" className="space-y-5">
                    <div className="space-y-4">
                        <div className="rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 to-white p-5 sm:p-7">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-700 text-white"><Shirt size={21} /></span>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-green-600">Step 03 · The pieces</p>
                                            <h2 id="garments-heading" className="font-display text-3xl text-green-900">Build the look</h2>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-green-700">Review each garment, find a saved product, or import one from a retailer link.</p>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm">
                                    {selectedCount}/{draft.itemSuggestions.length} pieces selected
                                </span>
                            </div>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <button type="button" onClick={searchAllGarments}
                                    disabled={catalogSearching || draft.itemSuggestions.length === 0} className={primaryButton}>
                                    {catalogSearching ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />}
                                    {catalogSearching ? "Searching catalog..." : "Search all garments"}
                                </button>
                                <button type="button" onClick={addGarment}
                                    disabled={draft.itemSuggestions.length >= MAX_GARMENTS} className={secondaryButton}>
                                    <Plus size={17} /> Add garment ({draft.itemSuggestions.length}/{MAX_GARMENTS})
                                </button>
                            </div>
                        </div>
  {catalogError && (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {catalogError}
      </p>
  )}
  {retailerLinksError && (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {retailerLinksError}
      </p>
  )}

                        {draft.itemSuggestions.map((item, index) => (
                            <article
                                key={item.localSlotId}
                                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                                    selectedCatalogItems[index] ? "border-green-300" : "border-green-100"
                                }`}
                            >
                                <button type="button"
                                    onClick={() => setExpandedGarments((current) => ({
                                        ...current,
                                        [item.localSlotId]: !(current[item.localSlotId] ?? index === 0),
                                    }))}
                                    aria-expanded={expandedGarments[item.localSlotId] ?? index === 0}
                                    className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-green-50/60 sm:px-6">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-100 text-sm font-bold text-green-800">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-semibold text-green-900">{item.name || `Garment ${index + 1}`}</span>
                                        <span className="block truncate text-xs capitalize text-green-600">
                                            {item.itemType} · {item.itemSubType.replaceAll("-", " ")} · {item.visualAnalysis.colors.join(", ") || "Add a color"}
                                        </span>
                                    </span>
                                    <span className={`hidden shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${
                                        selectedCatalogItems[index] ? "bg-green-100 text-green-800" : "bg-amber-50 text-amber-800"
                                    }`}>
                                        {selectedCatalogItems[index] ? <CheckCircle2 size={13} /> : null}
                                        {selectedCatalogItems[index] ? "Item selected" : "Needs an item"}
                                    </span>
                                    <ArrowRight size={17} className={`shrink-0 text-green-600 transition-transform ${
                                        (expandedGarments[item.localSlotId] ?? index === 0) ? "rotate-90" : ""
                                    }`} />
                                </button>
                                <div hidden={!(expandedGarments[item.localSlotId] ?? index === 0)}
                                    className="space-y-5 border-t border-green-100 bg-[#fcfefc] p-4 sm:p-6">
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
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        aria-label={`Remove ${item.name || "garment"}`}
    >
        <Trash2 size={16} /> Remove
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
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                                >
                                    <Plus size={14} /> Add search query
                                </button>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => searchOneGarment(index)}
                                        disabled={catalogSearching}
                                        className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                                    >
                                        <Search size={16} /> Find in catalog
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            loadRetailerSearchLinks(index)
                                        }
                                        disabled={Boolean(
                                            retailerLinksLoading[index]
                                        )}
                                        className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                                    >
                                        <ExternalLink size={16} />
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
      <div className="space-y-3 border-t border-green-100 pt-5">
          <h4 className="text-sm font-semibold text-green-900">
              From OOTDIFY catalog
          </h4>
          {catalogResults[index].length === 0 ? (
              <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">No catalog item matches this garment type and visible color.</p>
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
                                  className={`flex w-full gap-3 rounded-xl border bg-white p-3 text-left transition ${
                                      isSelected
                                          ? "border-green-500 ring-2 ring-green-100"
                                          : "border-green-100 hover:border-green-300 hover:shadow-sm"
                                  }`}
                              >
                                  {match.image?.url ? (
                                      <img
                                          src={match.image.url}
                                          alt={match.name}
                                          className="h-16 w-16 shrink-0 rounded-lg object-cover"
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
                                      <p className="mt-1 text-xs font-semibold text-green-800">
                                          {match.price != null
                                              ? `₹${match.price}`
                                              : "Price unavailable"}
                                      </p>
                                      <p className="text-xs text-text-muted">
                                          {[match.gender, match.itemSubType].filter(Boolean).join(" · ")}
                                      </p>
                                      {isSelected && (
                                          <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green-700"><CheckCircle2 size={13} /> Selected</p>
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
      <div className="space-y-4 border-t border-green-100 pt-5">
          <div>
              <h4 className="text-sm font-semibold text-green-900">
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
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-100 bg-white p-4 sm:p-5">
                        <button type="button" onClick={() => goToStep(2)} className={secondaryButton}><ArrowLeft size={16} /> Back to draft</button>
                        <div className="text-sm text-green-700"><strong>{selectedCount}</strong> of {draft.itemSuggestions.length} garments have saved products</div>
                        <button type="button" onClick={() => goToStep(4)} className={primaryButton}>Review outfit <ArrowRight size={17} /></button>
                    </div>
                </section>
                {activeStep === 4 && <OutfitReviewPanel
                    draft={draft}
                    imageFile={imageFile}
                    imagePreview={imagePreview}
                    selectedItems={selectedCatalogItems}
                    occasionId={reviewOccasionId}
                    onOccasionChange={setReviewOccasionId}
                    outfitTypeId={reviewOutfitTypeId}
                    onOutfitTypeChange={setReviewOutfitTypeId}
                    saving={savingOutfit}
                    onBack={() => goToStep(3)}
                    onSave={handleSaveOutfit}
                />}
                <p className="px-1 text-center text-xs text-green-600">
                    Draft changes stay in this page until you save the outfit. Items you explicitly save are stored in the catalog.
                </p>
                </div>
            )}
        </div>
    );
};

export default OutfitAnalyzer;
