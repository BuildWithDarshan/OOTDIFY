import {useState, useEffect} from 'react';
import {Link} from "react-router-dom";
import DataTable from "../components/DataTable.jsx";
import TrendForm from '../components/TrendForm.jsx';
import { getTrends, updateTrend, deleteTrend } from '../services/trendService.js';

const columns = [
    {
        key: "Cover Image",
        label: "Image",
        render: (row) => (
            <img src={row.coverImage?.url} alt={row.title} className='w-10 h-10 rounded-md object-cover'/>
        ),
    },
    { key: "title", label: "Title" },
    { key: "gender", label: "Gender" },
]

const ManageTrends = () => {
    
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingTrend, setEditingTrend] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const loadTrends = async() => {
        setLoading(true);
        try {
            const data = await getTrends();
            setTrends(data.trends);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load trends");
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTrends();
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
      <div className='flex items-center justify-between mb-6'>
        <h1 className="font-display text-3xl text-text-primary">Trends</h1>

        <Link to='/trends/add' className='bg-accent text-on-accent rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent-hover'>
        + Add Trend
        </Link>
      </div>

      {loading && <p className="text-text-secondary">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
            <DataTable
                    columns={columns}
                    rows={trends}
                    onEdit={(trend) => setEditingTrend(trend)}
                    onDelete={handleDelete}
                    emptyMessage="No trends yet — add your first one."
            />
      )}

      {editingTrend && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-bg border border-border rounded-xl w-full max-w-xl p-6 my-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-2xl text-text-primary">Edit Trend</h2>

                    <button onClick={() => setEditingTrend(null)} className='text-text-secondary hover:text-text-primary'>
                        ✕
                    </button>
                </div>
                <TrendForm initialData={editingTrend} onSubmit={handleUpdate} submitting={submitting} submitLabel='Save Changes'/>
            </div>
        </div>
      )}
    </div>
  )
}

export default ManageTrends
