import React from 'react'
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable.jsx';
import { getItems, deleteItem } from '../services/itemService.js';

const columns = [
    {
        key: "image",
        label: "Image",
        render: (row) => (
            <img src={row.image?.url} alt={row.name} className="w-10 h-10 rounded-md object-cover"/>
        )
    },
    { key: "name", label: "Name" },
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

    const loadItems = async() => {
        setLoading(true);
        try {
            const data = await getItems();
            setItems(data.items);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load items");
        }finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadItems();
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
      <div className='flex items-center justify-between mb-6'>
        <h1 className='font-display text-3xl text-text-primary'>Items</h1>
        <Link to='/items/add' className='bg-accent text-on-accent rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent-hover'>
          + Add Item
        </Link>
      </div>

      {loading && <p className='text-text-secondary'>Loading...</p>}
      {error && <p className='text-red-500'>{error}</p>}

      {!loading && !error && (
                <DataTable
                    columns={columns}
                    rows={items}
                    onEdit={(item) => navigate(`/items/edit/${item._id}`)}
                    onDelete={handleDelete}
                    emptyMessage="No items yet — add your first one."
                />
      )}
    </div>
  )
}

export default ManageItems
