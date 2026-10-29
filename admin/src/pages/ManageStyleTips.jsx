import {useState, useEffect} from 'react';
import {Link} from "react-router-dom";
import { BookOpenText, Plus, X } from "lucide-react";
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import TipForm from '../components/TipForm.jsx';
import { getStyleTips, updateStyleTip, deleteStyleTip } from '../services/styleTipService.js';

const columns = [
    {
        key: "coverImage",
        label: "Image",
        render: (row) => (
            <img src={row.coverImage?.url} alt={row.title} className='h-12 w-12 rounded-xl object-cover'/>
        ),
    },
    { key: "title", label: "Title", render: (row) => <span className="font-semibold text-green-900">{row.title}</span> },
    { key: "category", label: "Category" },
]

const ManageStyleTips = () => {

    const [styleTips, setStyleTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingTip, setEditingTip] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let current = true;
        getStyleTips().then((data) => { if (current) setStyleTips(data.styleTips); })
            .catch((err) => { if (current) setError(err.response?.data?.message || "Failed to load style tips"); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
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
      <PageHeader icon={BookOpenText} title="Styling tips" description="Share useful advice that makes every outfit easier to wear."
        action={<Link to='/style-tips/add' className='inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800'><Plus size={17} /> Add tip</Link>} />

      {loading && <p className="text-text-secondary">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
                <DataTable
                    columns={columns}
                    rows={styleTips}
                    searchPlaceholder="Search tips or category..."
                    onEdit={(tip) => setEditingTip(tip)}
                    onDelete={handleDelete}
                    emptyMessage="No style tips yet — add your first one."
                />
      )}

      {editingTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-green-950/50 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-xl rounded-3xl border border-green-100 bg-white p-5 shadow-2xl sm:p-7">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-2xl text-text-primary">Edit Style Tip</h2>
                    <button type="button" onClick={() => setEditingTip(null)} aria-label="Close edit tip" className='rounded-lg p-2 text-green-700 hover:bg-green-50'><X size={19} /></button>
                </div>
                <TipForm initialData={editingTip} onSubmit={handleUpdate} submitting={submitting} submitLabel='Save Changes' />
            </div>
        </div>
      )}
    </div>
  )
}

export default ManageStyleTips
