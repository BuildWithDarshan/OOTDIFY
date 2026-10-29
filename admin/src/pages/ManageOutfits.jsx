import {useState, useEffect} from 'react';
import {Link, useNavigate} from "react-router-dom";
import { Clock3, Plus, Shirt, Sparkles, Star } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { getOutfits, deleteOutfit, setOutfitOfTheDay } from '../services/outfitService.js';

const ManageOutfits = () => {

    const [outfits,setOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const loadOutfits = async() => {
        try {
            await getOutfits({isOOTD: true});
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
        let current = true;
        getOutfits({isOOTD: true})
            .then(() => getOutfits())
            .then((data) => { if (current) setOutfits(data.outfits); })
            .catch((err) => { if (current) setError(err.response?.data?.message || "Failed to load outfits"); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
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
                <img src={row.coverImage?.url} alt={row.title} className='h-12 w-12 rounded-xl object-cover'/>
            ),
        },
        {key: "title", label: "Title", render: (row) => <span className="font-semibold text-green-900">{row.title}</span>},
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
            key: "lastOOTDAt",
            label: "Last featured",
            render: (row) => row.lastOOTDAt || row.ootdDate
                ? new Date(row.lastOOTDAt || row.ootdDate).toLocaleDateString("en-IN")
                : <span className="text-xs font-semibold text-green-600">Never featured</span>,
        },
        {
            key: "ootdAction",
            label: "",
            render: (row) =>
                !row.isOOTD && (
                    <button
                        onClick={() => handleSetOOTD(row)}
                        className="whitespace-nowrap rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-100"
                    >
                        Set as OOTD
                    </button>
                ),
        },
    ]
  return (
    <div>
      <PageHeader icon={Shirt} title="Outfits" description="Curate complete looks, update featured pieces, and review your collection."
        action={<div className="flex flex-wrap gap-2">{import.meta.env.VITE_ENABLE_OUTFIT_ANALYZER === "true" && <Link to="/outfit-analyzer" className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-50"><Sparkles size={17} /> Analyze outfit</Link>}<Link to="/outfits/add" className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"><Plus size={17} /> Add outfit</Link></div>} />

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-green-100 bg-white p-4 text-sm text-green-700">
        <Clock3 size={19} className="shrink-0 text-green-600" />
        <span className="min-w-0 flex-1">Men’s and women’s OOTD rotate each India calendar day. A manual selection stays featured until the next day.</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800"><Star size={13} /> {outfits.filter((outfit) => outfit.isOOTD).length} featured now</span>
      </div>

      {loading && <p className="text-text-secondary">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <DataTable
            columns={columns}
            rows={outfits}
            searchFields={["title", "gender", (row) => row.occasion?.name, (row) => row.outfitType?.name]}
            searchPlaceholder="Search outfits, occasion, or type..."
            onEdit={(outfit) => navigate(`/outfits/edit/${outfit._id}`)}
            onDelete={handleDelete}
            emptyMessage="No outfits yet — add your first one."
        />
     )}
    </div>
  )
}

export default ManageOutfits
