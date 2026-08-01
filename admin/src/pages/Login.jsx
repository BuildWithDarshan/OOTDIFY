import { useState } from "react";
import {useNavigate} from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const login = () => {
    const { login } = useAdminAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
            await login(email, password);
            navigate('/dashboard',{replace: true});
        } catch (err) {
            const message = err.response?.data?.message || err.message || "Something went wrong while logging in";
            setError(message);
        }
        finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg font-body">
            <div className="w-full max-w-sm">
                <h1 className="font-display text-4xl text-text-primary text-center mb-1">OOTDIFY</h1>
                <p className="text-text-secondary text-sm text-center mb-8">Admin Dashboard</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-sm text-white bg-red-500 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    <div className="px-sm-4">
                        <label className="block text-sm text-text-secondary mb-1">
                            Email
                        </label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}  placeholder="Enter your Email" autoComplete="null" className="w-full border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"/>
                    </div>

                    <div className="px-sm-4">
                        <label className="block text-sm text-text-secondary mb-1">
                            Password
                        </label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}  placeholder="Enter your password" autoComplete="null" className="w-full border border-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"/>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full max-w-sm bg-accent text-on-accent rounded-lg py-2.5 font-medium hover:bg-accent-hover transition-colors disabled:opacity-60">
                        {submitting ? "Logging In..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default login;