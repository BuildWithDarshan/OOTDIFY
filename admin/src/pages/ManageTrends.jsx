import {useState, useEffect} from 'react';
import {Link} from "react-router-dom";
import { BarChart3, Plus, X } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import TrendForm from '../components/TrendForm.jsx';
import { getTrends, updateTrend, deleteTrend } from '../services/trendService.js';

const columns = [
    {
        key: "Cover Image",
        label: "Image",
        render: (row) => (
            <img src={row.coverImage?.url} alt={row.title} className='h-12 w-12 rounded-xl object-cover'/>
        ),
    },
    { key: "title", label: "Title", render: (row) => <span className="font-semibold text-green-900">{row.title}</span> },
    { key: "gender", label: "Gender" },
]

const ManageTrends = () => {
    
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingTrend, setEditingTrend] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let current = true;
        getTrends().then((data) => { if (current) setTrends(data.trends); })
            .catch((err) => { if (current) setError(err.response?.data?.message || "Failed to load trends"); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    },[]);


    const handleDelete = async(trend) => {
        if(!window.confirm(`Delete "${trend.title}"?`)) return;
        try {
            await deleteTrend(trend._id);
            setTrends((prev) => prev.filter((t) => t._id !== trend._id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete trend");
        }
    }

    const handleUpdate = async(formData) => {
        setSubmitting(true);
        try {
            const data = await updateTrend(editingTrend._id, formData);
            setTrends((prev) => prev.map((t) => t._id === editingTrend._id ? data.trend : t));
            setEditingTrend(null);
        } finally {
            setSubmitting(false);
        }
    }
  return (
    <div>
      <PageHeader icon={BarChart3} title="Trends" description="Create seasonal stories and keep your fashion edits current."
        action={<Link to='/trends/add' className='inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800'><Plus size={17} /> Add trend</Link>} />

      {loading && <p className="text-text-secondary">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
            <DataTable
                    columns={columns}
                    rows={trends}
                    searchPlaceholder="Search trends or gender..."
                    onEdit={(trend) => setEditingTrend(trend)}
                    onDelete={handleDelete}
                    emptyMessage="No trends yet — add your first one."
            />
      )}

      {editingTrend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-green-950/50 p-4 backdrop-blur-sm">
            <div className="my-8 w-full max-w-xl rounded-3xl border border-green-100 bg-white p-5 shadow-2xl sm:p-7">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-2xl text-text-primary">Edit Trend</h2>

                    <button type="button" onClick={() => setEditingTrend(null)} aria-label="Close edit trend" className='rounded-lg p-2 text-green-700 hover:bg-green-50'><X size={19} /></button>
                </div>
                <TrendForm initialData={editingTrend} onSubmit={handleUpdate} submitting={submitting} submitLabel='Save Changes'/>
            </div>
        </div>
      )}
    </div>
  )
}

export default ManageTrends
