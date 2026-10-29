import {useState} from 'react'
import {useNavigate} from "react-router-dom";
import OutfitForm from '../components/OutfitForm.jsx';
import FormPageShell from '../components/FormPageShell.jsx';
import { Shirt } from 'lucide-react';
import { createOutfit } from '../services/outfitService.js';

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
    <FormPageShell icon={Shirt} title="Create outfit" description="Build a complete look from your saved catalog pieces." backTo="/outfits">
      <OutfitForm onSubmit={handleSubmit} submitting={submitting} submitLabel='Create Outfit'/>
    </FormPageShell>
  )
}

export default AddOutfit
