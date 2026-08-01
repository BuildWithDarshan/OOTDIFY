import {React, useEffect, useState} from 'react'

const GENDERS = ["men", "women"];
const ITEM_TYPES = ["top","bottom","footwear","outerwear","accessory","other"]

const ItemForm = ({ initialData, onSubmit, submitting, submitLabel = "Save"}) => {

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [referralLink, setReferralLink] = useState("");
    const [shoppingSite, setShoppingSite] = useState("");
    const [gender, setGender] = useState("men");
    const [itemType, setItemType] = useState("top");
    const [itemSubType, setItemSubType] = useState("");
    const [brand, setBrand] = useState("");
    const [isWardrobeEssential, setIsWardrobeEssential] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if(initialData) {
            setName(initialData.name || "");
            setPrice(initialData.price ?? "");
            setReferralLink(initialData.referralLink || "");
            setShoppingSite(initialData.shoppingSite || "");
            setGender(initialData.gender || "men");
            setItemType(initialData.itemType || "top");
            setItemSubType(initialData.itemSubType || "");
            setBrand(initialData.brand || "");
            setIsWardrobeEssential(!!initialData.isWardrobeEssential);
        }
    },[initialData]);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError("");

        if(!name || !price || !referralLink || !shoppingSite || !itemSubType) {
            setError("Name, price, referral link, shopping site, and sub-type are all required");
            return;
        }

        if(!initialData && !imageFile) {
            setError("An item image is required");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("price", price);
        formData.append("referralLink", referralLink.trim());
        formData.append("shoppingSite", shoppingSite.trim());
        formData.append("gender", gender);
        formData.append("itemType", itemType);
        formData.append("itemSubType", itemSubType.trim());
        if (brand.trim()) formData.append("brand", brand.trim());
        formData.append("isWardrobeEssential", isWardrobeEssential ? "true" : "false");
        if(imageFile) formData.append("image", imageFile);

        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong while saving the item");
        }
    }
  return (
    <form onSubmit={handleSubmit} className='space-y-5 max-w-xl'>
      {error && <div className='text-sm text-white bg-red-500 rounded-lg px-4 py-2'>{error}</div>}
      <div>
        <label className='block text-sm text-text-secondary mb-1'>Item Image</label>
        {initialData?.image?.url && !imageFile && (
            <img src={initialData.image.url} alt={initialData.name} className='w-20 h-20 rounded-lg object-cover mb-2'/>
        )}
        <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files[0])} className='w-full text-sm text-text-secondary'/>
        {initialData && (
            <p className='text-xs text-text-muted mt-1'>Leave empty to keep the current image.</p>
        )}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
            <label className='block text-sm text-text-secondary mb-1'>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className='w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent' placeholder='e.g. White Cotton Shirt'/>
        </div>

        <div>
            <label className='block text-sm text-text-secondary mb-1'>Price (₹)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className='w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent' placeholder='999'/>
        </div>
      </div>

      <div>
            <label className='block text-sm text-text-secondary mb-1'>Referral Link</label>
            <input type="text" value={referralLink} onChange={(e) => setReferralLink(e.target.value)} className='w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent' placeholder='https://www.myntra.com/...'/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm text-text-secondary mb-1">Shopping Site</label>
            <input type="text" value={shoppingSite} onChange={(e) => setShoppingSite(e.target.value)} className='w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent' placeholder='Myntra'/>
        </div>

        <div>
            <label className="block text-sm text-text-secondary mb-1">Brand</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className='w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent' placeholder='H&M'/>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
            <label className="block text-sm text-text-secondary mb-1">Gender</label>
            <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-nonefocus:border-accent"
            >
                    {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                    ))}
            </select>
        </div>

        <div>
            <label className="block text-sm text-text-secondary mb-1">Item Type</label>
            <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-nonefocus:border-accent"
            >
                    {ITEM_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
            </select>
        </div>

        <div>
            <label className="block text-sm text-text-secondary mb-1">Sub-type</label>
            <input
                    type="text"
                    value={itemSubType}
                    onChange={(e) => setItemSubType(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-nonefocus:border-accent"
                    placeholder="t-shirt"
            />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
                type="checkbox"
                checked={isWardrobeEssential}
                onChange={(e) => setIsWardrobeEssential(e.target.checked)}
                className="rounded border-border"
            />
                Mark as Wardrobe Essential
        </label>

        <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-accent text-on-accent rounded-lg px-6 py-2.5 font-medium hover:bg-accent-hover disabled:opacity-60"
        >
            {submitting ? "Saving..." : submitLabel}
        </button>
    </form>
  )
}

export default ItemForm
