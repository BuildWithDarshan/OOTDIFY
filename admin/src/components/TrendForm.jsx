import { useState, useEffect } from "react";
import { getOutfits } from "../services/outfitService.js";

const GENDERS = ["men", "women", "unisex"];


const TrendForm = ({ initialData, onSubmit, submitting, submitLabel = "Save" }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [gender, setGender] = useState("unisex");
    const [stylingTipsText, setStylingTipsText] = useState(""); 
    const [selectedOutfitIds, setSelectedOutfitIds] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState("");

    const [outfits, setOutfits] = useState([]);
    const [loadingOutfits, setLoadingOutfits] = useState(true);

    useEffect(() => {
        const loadOutfits = async () => {
            try {
                const data = await getOutfits();
                setOutfits(data.outfits);
            } catch {
                // Related outfits are optional — don't block the whole form if this fails
            } finally {
                setLoadingOutfits(false);
            }
        };
        loadOutfits();
    }, []);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "");
            setDescription(initialData.description || "");
            setGender(initialData.gender || "unisex");
            setStylingTipsText((initialData.stylingTips || []).join("\n"));
            setSelectedOutfitIds(
                (initialData.relatedOutfits || []).map((o) => o._id || o)
            );
        }
    }, [initialData]);

    const toggleOutfit = (outfitId) => {
        setSelectedOutfitIds((prev) =>
            prev.includes(outfitId) ? prev.filter((id) => id !== outfitId) : [...prev, outfitId]
        );
    };

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
        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
            {error && <div className="text-sm text-white bg-red-500 rounded-lg px-4 py-2">{error}</div>}

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

            <div>
                <label className="block text-sm text-text-secondary mb-2">
                    Related Outfits (optional)
                </label>
                {loadingOutfits ? (
                    <p className="text-text-muted text-sm">Loading outfits...</p>
                ) : outfits.length === 0 ? (
                    <p className="text-text-muted text-sm">No outfits exist yet.</p>
                ) : (
                    <div className="border border-border rounded-lg max-h-48 overflow-y-auto divide-y divide-border">
                        {outfits.map((outfit) => (
                            <label
                                key={outfit._id}
                                className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-bg-subtle"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedOutfitIds.includes(outfit._id)}
                                    onChange={() => toggleOutfit(outfit._id)}
                                    className="rounded border-border"
                                />
                                <span className="text-text-primary">{outfit.title}</span>
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

export default TrendForm;