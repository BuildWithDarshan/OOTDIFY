import { useState, useEffect } from "react";
import { Compass, Plus } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TaxonomyForm from "../components/TaxonomyForm.jsx";
import {
    getOccasions,
    createOccasion,
    updateOccasion,
    deleteOccasion,
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

const ManageOccasions = () => {
    const [occasions, setOccasions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let current = true;
        getOccasions().then((data) => { if (current) setOccasions(data.occasions); })
            .catch((err) => { if (current) setError(err.response?.data?.message || "Failed to load occasions"); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, []);

    const handleAdd = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const handleEdit = (occasion) => {
        setEditingItem(occasion);
        setFormOpen(true);
    };

    const handleDelete = async (occasion) => {
        if (!window.confirm(`Delete "${occasion.name}"? This can't be undone from the UI.`)) return;

        try {
            await deleteOccasion(occasion._id);
            setOccasions((prev) => prev.filter((o) => o._id !== occasion._id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete occasion");
        }
    };

    const handleSubmit = async (payload) => {
        setSubmitting(true);
        try {
            if (editingItem) {
                const data = await updateOccasion(editingItem._id, payload);
                setOccasions((prev) =>
                    prev.map((o) => (o._id === editingItem._id ? data.occasion : o))
                );
            } else {
                const data = await createOccasion(payload);
                setOccasions((prev) => [data.occasion, ...prev]);
            }
            setFormOpen(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <PageHeader icon={Compass} title="Occasions" description="Organize looks around the moments people dress for."
                action={<button type="button" onClick={handleAdd} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"><Plus size={17} /> Add occasion</button>} />

            {loading && <p className="text-text-secondary">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <DataTable
                    columns={columns}
                    rows={occasions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    emptyMessage="No occasions yet — add your first one."
                />
            )}

            {formOpen && (
                <TaxonomyForm
                    key={editingItem?._id || "new"}
                    label="Occasion"
                    editingItem={editingItem}
                    onSubmit={handleSubmit}
                    onClose={() => setFormOpen(false)}
                    submitting={submitting}
                />
            )}
        </div>
    );
};

export default ManageOccasions;
