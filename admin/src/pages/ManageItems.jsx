import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderHeart, Plus } from 'lucide-react';
import DataTable from '../components/DataTable.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { getItems, deleteItem } from '../services/itemService.js';

const columns = [
    {
        key: "image",
        label: "Image",
        render: (row) => (
            <img src={row.image?.url} alt={row.name} className="h-12 w-12 rounded-xl object-cover"/>
        )
    },
    { key: "name", label: "Name", render: (row) => <span className="font-semibold text-green-900">{row.name}</span> },
    { key: "gender", label: "Gender" },
    { key: "itemType", label: "Type" },
    {
        key: "price",
        label: "Price",
        render: (row) => `₹${row.price}`
    },
    {
        key: "isWardrobeEssential",
        label: "Wardrobe Essential",
        render: (row) =>
            row.isWardrobeEssential ? (
                <span className="text-xs bg-accent-subtle text-accent-hover px-2 py-0.5 rounded-full">Yes</span>
            ) : (
                <span className="text-text-muted text-xs">No</span>
            ),
    },
];

const ManageItems = () => {

    const [items,setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let current = true;
        getItems().then((data) => { if (current) setItems(data.items); })
            .catch((err) => { if (current) setError(err.response?.data?.message || "Failed to load items"); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    },[])

    const handleDelete = async(item) => {
        if(!window.confirm(`Delete "${item.name}"?`)) return;
        try {
            await deleteItem(item._id);
            setItems((prev) => prev.filter((i) => i._id !== item._id))
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete item");
        }
    }
  return (
    <div>
      <PageHeader icon={FolderHeart} title="Catalog items" description="Search, review, and maintain the products used across outfits."
        action={<Link to='/items/add' className='inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800'><Plus size={17} /> Add item</Link>} />

      {loading && <p className='text-text-secondary'>Loading...</p>}
      {error && <p className='text-red-500'>{error}</p>}

      {!loading && !error && (
                <DataTable
                    columns={columns}
                    rows={items}
                    searchPlaceholder="Search name, brand, store, or type..."
                    onEdit={(item) => navigate(`/items/edit/${item._id}`)}
                    onDelete={handleDelete}
                    emptyMessage="No items yet — add your first one."
                />
      )}
    </div>
  )
}

export default ManageItems
