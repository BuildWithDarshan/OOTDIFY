import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import TipForm from '../components/TipForm.jsx';
import {createStyleTip} from "../services/styleTipService.js";

const AddStyleTip = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async(formData) => {
        setSubmitting(true);
        try {
            await createStyleTip(formData);
            navigate('/style-tips', {replace: true});
        } finally {
            setSubmitting(false);
        }
    }
  return (
    <div>
      <h1 className="font-display text-3xl text-text-primary mb-6">Add Style Tip</h1>
      <TipForm onSubmit={handleSubmit} submitting={submitting} submitLabel='Create Style Tip'/>
    </div>
  )
}

export default AddStyleTip
