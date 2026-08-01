import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ItemForm from '../components/ItemForm.jsx'
import { createItem } from "../services/itemService.js"

const AddItem = () => {

    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async(formData) => {
        setSubmitting(true);
        try {
            await createItem(formData);
            navigate('/items', {replace: true});
        } finally {
            setSubmitting(false);
        }
    }
  return (
    <div>
      <h1 className='font-display text-3xl text-text-primary mb-6'>Add Item</h1>
      <ItemForm onSubmit={handleSubmit} submitting={submitting} submitLabel='Create Item'/>
    </div>
  )
}

export default AddItem
