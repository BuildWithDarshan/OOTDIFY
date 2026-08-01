import { useState, useEffect } from "react";

const CATEGORIES = [
    "color-combinations",
    "styling-mistakes",
    "outfit-coordination",
    "seasonal-dressing",
    "accessories",
    "general",
];

const TipForm = ({ initialData, onSubmit, submitting, submitLabel = "Save" }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("general");
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "");
            setContent(initialData.content || "");
            setCategory(initialData.category || "general");
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title || !content) {
            setError("Title and content are required");
            return;
        }

        if (!initialData && !imageFile) {
            setError("A cover image is required");
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("content", content);
        formData.append("category", category);
        if (imageFile) formData.append("image", imageFile);

        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong while saving the style tip");
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
                    placeholder="5 Color Combinations That Always Work"
                />
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-1">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                >
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm text-text-secondary mb-1">Content</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent"
                    placeholder="Neutral tones paired with one bold accent color create instant visual balance..."
                />
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

export default TipForm;