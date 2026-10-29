import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ItemForm from '../components/ItemForm.jsx'
import FormPageShell from '../components/FormPageShell.jsx'
import { FolderHeart } from 'lucide-react'
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
    <FormPageShell icon={FolderHeart} title="Add catalog item" description="Save a product with its image, price, and retailer link." backTo="/items">
      <ItemForm onSubmit={handleSubmit} submitting={submitting} submitLabel='Create Item'/>
    </FormPageShell>
  )
}

export default AddItem
