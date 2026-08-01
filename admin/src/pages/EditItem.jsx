import {React, useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ItemForm from '../components/ItemForm.jsx'
import { getItemById, updateItem } from '../services/itemService.js'

const EditItem = () => {

    const {id} = useParams();
    const navigate = useNavigate();

    const [item,setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadItem = async() => {
            try {
                const res = await getItemById(id);
                setItem(res.item);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load item");
            }finally {
                setLoading(false);
            }
        }; loadItem();
    },[id])

    const handleSubmit = async(formData) => {
        setSubmitting(true);
        try {
            await updateItem(id, formData);
            navigate('/items', {replace: true});
        } finally {
            setSubmitting(false);
        }
    };

    if(loading) return <p className='text-text-secondary'>Loading...</p>
    if(error) return <p className='text-red-500'>{error}</p>
  return (
    <div>
      <h1 className='font-display text-3xl text-text-primary mb-6'>Edit Item</h1>
      <ItemForm initialData={item} onSubmit={handleSubmit} submitting={submitting} submitLabel='Save Changes'/>
    </div>
  )
}

export default EditItem
