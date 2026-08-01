import {React, useEffect, useState} from 'react';
import api from "../services/api.js";

const StatCard = ({label, value}) => (
    <div className='border border-border rounded-xl p-5'>
        <p className='text-sm text-text-secondary mb-2'>{label}</p>
        <p className='font-display text-3xl text-text-primary'>{value}</p>
    </div>
)

const Dashboard = () => {

    const [stats, setStats] = useState(null);
    const [recentOutfits, setRecentOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async() => {
            try {
                const {data} = await api.get("/admin/dashboard");
                setStats(data.stats);
                setRecentOutfits(data.recentOutfits);
            } catch (error) {
                setError(
                    err.response?.data?.message || "Something went wrong while loading the dashboard"
                )
            }finally {
                setLoading(false);
            }
        }
        fetchStats();
    },[])

    if(loading) {
        return <p className='text-text-secondary'>Loading Dashboard...</p>
    }

    if(error) {
        return <p className="text-red-500">{error}</p>;
    }

  return (
    <div>
      <h1 className='font-display text-3xl text-text-primary mb-6'>Dashboard</h1>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-10'>
        <StatCard label="Total Outfits" value={stats.totalOutfits}/>
        <StatCard label="Total Items" value={stats.totalItems}/>
        <StatCard label="Total Trends" value={stats.totalTrends}/>
        <StatCard label="Style Tips" value={stats.totalStyleTips}/>
        <StatCard label="Total Users" value={stats.totalUsers}/>
      </div>

      <h2 className='font-display text-xl text-text-primary mb-4'>Recently added outfits</h2>

      {recentOutfits.length === 0 ? (
        <p className="text-text-secondary text-sm">No outfits created yet.</p>
      ) : (
        <div className='space-y-3'>
            {recentOutfits.map((outfit) => (
                <div key={outfit._id} className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-border rounded-lg px-4 py-3'>
                    <div className='flex items-center gap-3 min-w-0'>
                        {outfit.coverImage?.url && (
                            <img src={outfit.coverImage?.url} alt={outfit.title} className='w-10 h-10 rounded-md object-cover shrink-0'/>
                        )}
                        <div className='min-w-0'>
                            <p className='text-sm text-text-primary font-medium truncate'>{outfit.title}</p>
                            <p className='text-xs text-text-secondary truncate'>{outfit.gender} · {outfit.occasion?.name} · {outfit.outfitType?.name}</p>
                        </div>
                        <span className="text-sm text-accent-hover font-medium shrink-0">
                            ₹{outfit.totalPrice}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
