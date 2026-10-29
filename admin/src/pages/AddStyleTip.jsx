import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import TipForm from '../components/TipForm.jsx';
import FormPageShell from '../components/FormPageShell.jsx';
import { BookOpenText } from 'lucide-react';
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
    <FormPageShell icon={BookOpenText} title="Create styling tip" description="Turn practical advice into a useful editorial story." backTo="/style-tips">
      <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm sm:p-8"><TipForm onSubmit={handleSubmit} submitting={submitting} submitLabel='Create Style Tip'/></div>
    </FormPageShell>
  )
}

export default AddStyleTip
