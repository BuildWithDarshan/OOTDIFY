import {useState} from 'react';
import {useNavigate} from "react-router-dom";
import TrendForm from '../components/TrendForm.jsx';
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
    <div>
      <h1 className='font-display text-3xl text-text-primary mb-6'>Add Trend</h1>
      <TrendForm onSubmit={handleSubmit} submitting={submitting} submitLabel='Create Trend'/>
    </div>
  )
}

export default AddTrend
