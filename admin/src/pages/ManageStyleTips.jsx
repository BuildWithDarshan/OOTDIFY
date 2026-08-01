import {useState, useEffect, use} from 'react';
import {Link} from "react-router-dom";
import DataTable from '../components/DataTable.jsx';
import TipForm from '../components/TipForm.jsx';
import { getStyleTips, updateStyleTip, deleteStyleTip } from '../services/styleTipService.js';

const columns = [
    {
        key: "coverImage",
        label: "Image",
        render: (row) => (
            <img src={row.coverImage?.url} alt={row.title} className='w-10 h-10 rounded-md object-cover'/>
        ),
    },
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
]

const ManageStyleTips = () => {

    const [styleTips, setStyleTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingTip, setEditingTip] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const loadStyleTips = async() => {
        setLoading(true);
        try {
            const data = await getStyleTips();
            setStyleTips(data.styleTips);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load style tips");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadStyleTips();
    },[]);

    const handleDelete = async (tip) => {
        if (!window.confirm(`Delete "${tip.title}"?`)) return;
        try {
            await deleteStyleTip(tip._id);
            setStyleTips((prev) => prev.filter((t) => t._id !== tip._id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete style tip");
        }
    };

    const handleUpdate = async (formData) => {
        setSubmitting(true);
        try {
            const data = await updateStyleTip(editingTip._id, formData);
            setStyleTips((prev) =>
                prev.map((t) => (t._id === editingTip._id ? data.styleTip : t))
            );
            setEditingTip(null);
        } finally {
            setSubmitting(false);
        }
    };

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='font-display text-3xl text-text-primary'>Style Tips</h1>
        <Link to='/style-tips/add' className='bg-accent text-on-accent rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent-hover'>
        + Add Style Tip
        </Link>
      </div>

      {loading && <p className="text-text-secondary">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
                <DataTable
                    columns={columns}
                    rows={styleTips}
                    onEdit={(tip) => setEditingTip(tip)}
                    onDelete={handleDelete}
                    emptyMessage="No style tips yet — add your first one."
                />
      )}

      {editingTip && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-bg border border-border rounded-xl w-full max-w-xl p-6 my-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-2xl text-text-primary">Edit Style Tip</h2>
                    <button onClick={() => setEditingTip(null)} className='text-text-secondary hover:text-text-primary'>
                        ✕
                    </button>
                </div>
                <TipForm initialData={editingTip} onSubmit={handleUpdate} submitting={submitting} submitLabel='Save Changes' />
            </div>
        </div>
      )}
    </div>
  )
}

export default ManageStyleTips
