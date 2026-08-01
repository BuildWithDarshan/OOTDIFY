import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OutfitForm from "../components/OutfitForm.jsx";
import { getOutfitById, updateOutfit } from "../services/outfitService.js";

const EditOutfit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [outfit, setOutfit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadOutfit = async () => {
            try {
                const data = await getOutfitById(id);
                setOutfit(data.outfit);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load outfit");
            } finally {
                setLoading(false);
            }
        };
        loadOutfit();
    }, [id]);

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        try {
            await updateOutfit(id, formData);
            navigate("/outfits", { replace: true });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p className="text-text-secondary">Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="font-display text-3xl text-text-primary mb-6">Edit Outfit</h1>
            <OutfitForm
                initialData={outfit}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitLabel="Save Changes"
            />
        </div>
    );
};

export default EditOutfit;