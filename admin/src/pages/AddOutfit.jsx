import {useState} from 'react'
import {useNavigate} from "react-router-dom";
import OutfitForm from '../components/OutfitForm.jsx';
import { createOutfit } from '../services/outfitService.js';
import { create } from 'axios';

const AddOutfit = () => {

    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async(formData) => {
        setSubmitting(true);
        try {
            await createOutfit(formData);
            navigate('/outfits',{replace: true});
        } finally {
            setSubmitting(false);
        }
    }
  return (
    <div>
      <h1 className='font-display text-3xl text-text-primary'>Add Outfits</h1>
      <OutfitForm onSubmit={handleSubmit} submitting={submitting} submitLabel='Create Outfit'/>
    </div>
  )
}

export default AddOutfit
