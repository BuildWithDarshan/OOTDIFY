import {useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {

    const {register} = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError("");

        if(!name || !email || !password) {
            setError("Name, email and password are all required");
            return;
        }

        if(password.length < 6) {
            setError("Password must be at least 6 characters");
            return;   
        }

        setSubmitting(true);

        try {
            await register(name, email, password);
            navigate('/', {replace: true});
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong while creating your account");
        }finally {
            setSubmitting(false);
        }
    }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg font-body px-4 py-12">
            
            <h1 className="font-display italic text-5xl text-text-primary mb-10">OOTDIFY</h1>
 
            <div className="w-full max-w-sm border border-border rounded-2xl p-8">
                <h2 className="font-display text-3xl text-text-primary mb-6">Sign up</h2>
 
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="text-sm text-white bg-red-500 rounded-lg px-4 py-3">{error}</div>
                    )}
 
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"
                            autoComplete="name"
                        />
                    </div>
 
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"
                            autoComplete="email"
                        />
                    </div>
 
                    <div>
                        <label className="block text-sm text-text-secondary mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"
                            autoComplete="new-password"
                        />
                        <p className="text-xs text-text-muted mt-1">At least 6 characters</p>
                    </div>
 
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-accent text-on-accent rounded-lg py-3 font-medium hover:bg-accent-hover transition-colors disabled:opacity-60"
                    >
                        {submitting ? "Creating account..." : "Sign up"}
                    </button>
                </form>
            </div>
 
            <p className="text-sm text-text-secondary text-center mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-accent-hover font-medium hover:underline">
                    Log in
                </Link>
            </p>
        </div>
  )
}

export default Register
