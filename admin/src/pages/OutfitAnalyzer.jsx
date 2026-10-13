import { useEffect, useState } from "react";
import { analyzeOutfit } from "../services/outfitAnalyzerService.js";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

const fieldClass =
    "w-full border border-border rounded-lg px-3 py-2 text-text-primary bg-bg focus:outline-none focus:border-accent";

const OutfitAnalyzer = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [draft, setDraft] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!imageFile) {
            setImagePreview("");
            return undefined;
        }

        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const handleImageChange = (event) => {
        const file = event.target.files?.[0] ?? null;
        setError("");
        setDraft(null);

        if (file && file.size > MAX_IMAGE_SIZE) {
            setImageFile(null);
            event.target.value = "";
            setError("Choose an image smaller than 4 MB.");
            return;
        }

        setImageFile(file);
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

            setDraft(response.data);
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

    const updateOutfitField = (field, value) => {
        setDraft((current) => ({
            ...current,
            outfitDraft: {
                ...current.outfitDraft,
                [field]: value,
            },
        }));
    };

    const updateItemField = (index, field, value) => {
        setDraft((current) => ({
            ...current,
            itemSuggestions: current.itemSuggestions.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const updateVisualField = (index, field, value) => {
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

    return (
        <div className="max-w-5xl">
            <div className="mb-6">
                <h1 className="font-display text-3xl text-text-primary">
                    Outfit Analyzer
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                    Analyze an outfit image and review an editable draft.
                    Nothing is saved to the database.
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
                        <h3 className="font-display text-xl text-text-primary">
                            Suggested Items ({draft.itemSuggestions.length})
                        </h3>

                        {draft.itemSuggestions.map((item, index) => (
                            <article
                                key={`${item.itemType}-${item.itemSubType}-${index}`}
                                className="space-y-4 rounded-xl border border-border bg-bg p-4 sm:p-6"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-medium text-accent-hover">
                                        {item.itemType}
                                    </span>
                                    <span className="text-xs text-text-secondary">
                                        {item.itemSubType}
                                    </span>
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
                                            <input
                                                value={query}
                                                onChange={(event) =>
                                                    updateSearchQuery(
                                                        index,
                                                        queryIndex,
                                                        event.target.value
                                                    )
                                                }
                                                className={fieldClass}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>

                    <p className="text-sm text-text-muted">
                        Changes are only held in this page. They are not saved
                        and will be lost when you leave or refresh it.
                    </p>
                </section>
            )}
        </div>
    );
};

export default OutfitAnalyzer;