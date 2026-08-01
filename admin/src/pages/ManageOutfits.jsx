import {useState, useEffect} from 'react';
import {Link, useNavigate} from "react-router-dom";
import DataTable from "../components/DataTable.jsx";
import { getOutfits, deleteOutfit, setOutfitOfTheDay } from '../services/outfitService.js';

const ManageOutfits = () => {

    const [outfits,setOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const loadOutfits = async() => {
        setLoading(true);
        try {
            const data = await getOutfits();
            setOutfits(data.outfits);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load outfits");
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOutfits();
    },[]);

    const handleDelete = async(outfit) => {
        if(!window.confirm(`Delete "${outfit.title}"?`)) return;
        try {
            await deleteOutfit(outfit._id);
            setOutfits((prev) => prev.filter((o) => o._id !== outfit._id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete outfit");
        }
    }

    const handleSetOOTD = async(outfit) => {
        try {
            await setOutfitOfTheDay(outfit._id);
            await loadOutfits();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to set Outfit of the Day");
        }
    };

    const columns = [
        {
            key: "coverImage",
            label: "Image",
            render: (row) => (
                <img src={row.coverImage?.url} alt={row.title} className='w-10 h-10 rounded-md object-cover'/>
            ),
        },
        {key: "title", label: "Title"},
        { key: "gender", label: "Gender" },
        {
            key: "occasion",
            label: "Occasion",
            render: (row) => row.occasion?.name || "—",
        },
        {
            key: "totalPrice",
            label: "Price",
            render: (row) => `₹${row.totalPrice}`,
        },
        {
            key: "flags",
            label: "Flags",
            render: (row) => (
                <div className='flex gap-1 flex-wrap'>
                    {row.isOOTD && (
                        <span className="text-xs bg-accent-subtle text-accent-hover px-2 py-0.5 rounded-full">
                            OOTD
                        </span>
                    )}
                    {row.isTrending && (
                        <span className="text-xs bg-bg-subtle text-text-secondary px-2 py-0.5 rounded-full">
                            Trending
                        </span>
                    )} 
                </div>
            ),
        },
        {
            key: "ootdAction",
            label: "",
            render: (row) =>
                !row.isOOTD && (
                    <button
                        onClick={() => handleSetOOTD(row)}
                        className="text-xs text-accent-hover hover:underline whitespace-nowrap"
                    >
                        Set as OOTD
                    </button>
                ),
        },
    ]
  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='font-display text-3xl text-text-primary'>Outfits</h1>
        <Link to="/outfits/add" className="bg-accent text-on-accent rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent-hover">
          + Add Outfit
        </Link>
      </div>

      {loading && <p className="text-text-secondary">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <DataTable
            columns={columns}
            rows={outfits}
            onEdit={(outfit) => navigate(`/outfits/edit/${outfit._id}`)}
            onDelete={handleDelete}
            emptyMessage="No outfits yet — add your first one."
        />
     )}
    </div>
  )
}

export default ManageOutfits
