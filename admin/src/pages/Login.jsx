import { useState } from "react";
import {useNavigate} from "react-router-dom";
import { useAdminAuth } from "../context/useAdminAuth.js";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

const Login = () => {
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
        <div className="flex min-h-screen items-center justify-center bg-[#f5f8f4] p-4 font-body">
            <div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-2xl shadow-green-800/10 md:grid-cols-2">
                <div className="relative hidden flex-col justify-between overflow-hidden bg-green-800 p-9 text-white md:flex">
                    <div aria-hidden="true" className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-green-300/20" />
                    <span className="relative inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-green-200"><Sparkles size={16} /> OOTDIFY Studio</span>
                    <div className="relative"><p className="font-display text-5xl leading-tight">Curate the looks people love.</p><p className="mt-4 text-sm leading-6 text-green-100">Your space to manage outfits, products, trends, and the stories behind them.</p></div>
                    <p className="relative text-xs text-green-300">Creative tools for the OOTDIFY team</p>
                </div>
                <div className="p-6 sm:p-9">
                <img src="/ootdify-logo.png" alt="OOTDIFY" className="h-14 w-44 object-contain object-left" />
                <div className="mb-7 mt-8"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-800"><LockKeyhole size={19} /></span><h1 className="mt-4 font-display text-4xl text-green-900">Welcome back.</h1><p className="mt-1 text-sm text-green-600">Sign in to your admin workspace.</p></div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-green-700">
                            Email
                        </label>
                        <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@ootdify.com" autoComplete="username" className="w-full rounded-xl border border-green-200 px-4 py-3 text-sm text-green-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"/>
                    </div>

                    <div>
                        <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-green-700">
                            Password
                        </label>
                        <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" className="w-full rounded-xl border border-green-200 px-4 py-3 text-sm text-green-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"/>
                    </div>

                    <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60">
                        {submitting ? "Signing in..." : "Sign in"} {!submitting && <ArrowRight size={17} />}
                    </button>
                </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
