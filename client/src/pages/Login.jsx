import {useState} from 'react';
import {useNavigate, Link} from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {

    const {login} = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError("");
        
        if(!email || !password) {
            setError("Email and password are both required");
            return;
        }

        setSubmitting(true);
        try {
           await login(email, password, rememberMe);
           navigate('/',{replace: true}); 
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong while logging in");
        }finally {
            setSubmitting(false);
        }
    }
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-bg font-body px-4 py-12'>
      <h1 className='font-display italic text-5xl text-text-primary mb-10'>OOTDIFY</h1>

      <div className='w-full max-w-sm border border-border rounded-2xl p-8'>
        <h2 className='font-display text-3xl text-text-primary mb-6'>Log in</h2>

        <form onSubmit={handleSubmit} className='space-y-5'>
            {error && (
                <div className='text-sm text-white bg-red-500 rounded-lg px-4 py-3'>{error}</div>
            )}

            <div>
                <label className='block text-sm text-text-secondary mb-1.5'>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className='w-full border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent' autoComplete='email'/>
            </div>

            <div>
                <label className='block text-sm text-text-secondary mb-1.5'>Passwprd</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className='w-full border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent' autoComplete='current-password'/>
            </div>

            <div className='flex justify-between'>
                 <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className='rounded border-border accent-accent'/>
                    Remember Me
                 </label>
                 <Link to='/forgot-password' className='text-accent-hover hover:underline text-sm'>
                 Forgot password?
                 </Link>
            </div>

            <button type='submit' disabled={submitting} className='w-full bg-accent text-on-accent rounded-lg py-3 font-medium hover:bg-accent-hover transition-colors disabled:opacity-60'>
                {submitting ? "Logging In..." : "Login"}
            </button>
        </form>
      </div>

      <p className="text-sm text-text-secondary text-center mt-6">
        Don't have an account?{""}
        <Link to='/register' className='text-accent-hover font-medium hover:underline'>
        Sign Up
        </Link>
        </p>
    </div>
  )
}

export default Login
