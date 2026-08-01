import {React, useEffect, useState} from 'react'

const TaxonomyForm = ({label, editingItem, onSubmit, onClose, submitting}) => {

    const [name, setName] = useState("");
    const [icon, setIcon] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if(editingItem) {
            setName(editingItem.name || "");
            setIcon(editingItem.icon || "");
        }else {
            setName("");
            setIcon("");
        }
        setError("")
    },[editingItem])

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
    <div className='fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4'>
       <div className='bg-bg border border-border rounded-xl w-full max-w-sm p-6'>
        <h2 className='font-display text-2xl text-text-primary mb-4'>
            {editingItem ? `Edit ${label}` : `Add ${label}`}
        </h2>

        <form className='space-y-4' onSubmit={handleSubmit}>
            {error && (
                <div className='text-sm text-white bg-red-500 rounded-lg px-4 py-2'>{error}</div>
            )}
            <div>
                <label className='block text-sm text-text-secondary mb-1'>
                    Name
                </label>
                <input type="text" valye={name} onChange={(e) => setName(e.target.value)} className='w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent' placeholder='e.g. Casual'/>
            </div>

            <div>
                <label className='block text-sm text-text-secondary mb-1'>
                    Icon URL
                </label>
                <input type="text" valye={icon} onChange={(e) => setIcon(e.target.value)} className='w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent' placeholder='https://...'/>
            </div>

            <div className='flex gap-3 pt-2'>
                <button type="button" onClick={onClose} className='flex-1 border border-border rounded-lg py-2.5 text-text-secondary'>
                    Cancel
                </button>
                <button type="submit" disabled={submitting} className='flex-1 bg-accent text-on-accent rounded-lg py-2.5 font-medium hover:bg-accent-hover disabled:opacity-60'>
                    {submitting ? "Saving..." : "Save"}
                </button>
            </div>
        </form>
       </div>
    </div>
  )
}

export default TaxonomyForm
