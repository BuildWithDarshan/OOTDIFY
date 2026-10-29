import {useState} from 'react'
import { X } from 'lucide-react';

const TaxonomyForm = ({label, editingItem, onSubmit, onClose, submitting}) => {

    const [name, setName] = useState(editingItem?.name || "");
    const [icon, setIcon] = useState(editingItem?.icon || "");
    const [error, setError] = useState("");

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError("");

        if(!name.trim()) {
            setError(`${label} name is required`);
            return;
        }

        try {
            await onSubmit({name: name.trim(), icon: icon.trim() || undefined});
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        }
    }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-green-950/50 p-4 backdrop-blur-sm'>
       <div className='w-full max-w-sm rounded-3xl border border-green-100 bg-white p-6 shadow-2xl'>
        <div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Collection labels</p><h2 className='font-display text-3xl text-green-900'>
            {editingItem ? `Edit ${label}` : `Add ${label}`}
        </h2></div><button type="button" onClick={onClose} aria-label="Close form" className="rounded-lg p-2 text-green-700 hover:bg-green-50"><X size={18} /></button></div>

        <form className='space-y-4' onSubmit={handleSubmit}>
            {error && (
                <div className='text-sm text-white bg-red-500 rounded-lg px-4 py-2'>{error}</div>
            )}
            <div>
                <label className='block text-sm text-text-secondary mb-1'>
                    Name
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className='w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm text-green-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100' placeholder='e.g. Casual'/>
            </div>

            <div>
                <label className='block text-sm text-text-secondary mb-1'>
                    Icon URL
                </label>
                <input type="url" value={icon} onChange={(e) => setIcon(e.target.value)} className='w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm text-green-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100' placeholder='https://...'/>
            </div>

            <div className='flex gap-3 pt-2'>
                <button type="button" onClick={onClose} className='flex-1 rounded-xl border border-green-200 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-50'>
                    Cancel
                </button>
                <button type="submit" disabled={submitting} className='flex-1 rounded-xl bg-green-700 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60'>
                    {submitting ? "Saving..." : "Save"}
                </button>
            </div>
        </form>
       </div>
    </div>
  )
}

export default TaxonomyForm
