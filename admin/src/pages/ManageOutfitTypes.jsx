import { useState, useEffect } from "react";
import { Plus, Tags } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TaxonomyForm from "../components/TaxonomyForm.jsx";
import {
    getOutfitTypes,
    createOutfitType,
    updateOutfitType,
    deleteOutfitType,
} from "../services/taxonomyService.js";

const columns = [
    {
        key: "icon",
        label: "Icon",
        render: (row) =>
            row.icon ? (
                <img src={row.icon} alt="" className="w-6 h-6 rounded object-cover" />
            ) : (
                <span className="text-text-muted text-xs">—</span>
            ),
    },
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
];

const ManageOutfitTypes = () => {
    const [outfitTypes, setOutfitTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let current = true;
        getOutfitTypes().then((data) => { if (current) setOutfitTypes(data.outfitTypes); })
            .catch((err) => { if (current) setError(err.response?.data?.message || "Failed to load outfit types"); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, []);

    const handleAdd = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const handleEdit = (outfitType) => {
        setEditingItem(outfitType);
        setFormOpen(true);
    };

    const handleDelete = async (outfitType) => {
        if (!window.confirm(`Delete "${outfitType.name}"? This can't be undone from the UI.`)) return;

        try {
            await deleteOutfitType(outfitType._id);
            setOutfitTypes((prev) => prev.filter((t) => t._id !== outfitType._id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete outfit type");
        }
    };

    const handleSubmit = async (payload) => {
        setSubmitting(true);
        try {
            if (editingItem) {
                const data = await updateOutfitType(editingItem._id, payload);
                setOutfitTypes((prev) =>
                    prev.map((t) => (t._id === editingItem._id ? data.outfitType : t))
                );
            } else {
                const data = await createOutfitType(payload);
                setOutfitTypes((prev) => [data.outfitType, ...prev]);
            }
            setFormOpen(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <PageHeader icon={Tags} title="Outfit types" description="Keep style categories consistent across the collection."
                action={<button type="button" onClick={handleAdd} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"><Plus size={17} /> Add outfit type</button>} />

            {loading && <p className="text-text-secondary">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <DataTable
                    columns={columns}
                    rows={outfitTypes}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="No outfit types yet — add your first one."
                />
            )}

            {formOpen && (
                <TaxonomyForm
                    key={editingItem?._id || "new"}
                    label="Outfit Type"
                    editingItem={editingItem}
                    onSubmit={handleSubmit}
                    onClose={() => setFormOpen(false)}
                    submitting={submitting}
                />
            )}
        </div>
    );
};

export default ManageOutfitTypes;
