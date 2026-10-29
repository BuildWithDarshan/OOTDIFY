import {useState} from 'react';
import {useNavigate} from "react-router-dom";
import TrendForm from '../components/TrendForm.jsx';
import FormPageShell from '../components/FormPageShell.jsx';
import { BarChart3 } from 'lucide-react';
import {createTrend} from "../services/trendService.js"

const AddTrend = () => {

    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async(formData)=> {
        setSubmitting(true);
        try {
            await createTrend(formData);
            navigate('/trends',{replace: true});
        }finally {
            setSubmitting(false);
        }
    }
  return (
    <FormPageShell icon={BarChart3} title="Create trend" description="Publish a fashion story with useful styling advice." backTo="/trends">
      <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm sm:p-8"><TrendForm onSubmit={handleSubmit} submitting={submitting} submitLabel='Create Trend'/></div>
    </FormPageShell>
  )
}

export default AddTrend
