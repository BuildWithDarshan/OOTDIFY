import {useState} from 'react';
import {Link} from "react-router-dom";
import {Mail, Check} from "lucide-react";
import { subscribeToNewsletter } from '../../services/newsLetterService.js';

const CTASection = () => {

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setStatus("submitting");
    try {
      await subscribeToNewsletter(email);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
};
  return (
    <section className='px-4 sm:px-6 md:px-10 py-14 sm:py-20 md:py-24'>
      <div className="max-w-6xl mx-auto bg-[var(--color-text-primary)] rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 p-8 sm:p-12 md:p-16">
          <div className="flex flex-col justify-center">
            <p className="uppercase tracking-[0.2em] text-xs text-accent mb-4">Start Styling</p>
            <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-5">
              Your next outfit<br />is one click away.
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-8 max-w-md">
              Browse curated looks by occasion, budget, and season — and shop every piece directly from the brands you trust.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to='/men' className='bg-accent text-on-accent rounded-full px-5 py-3 text-sm font-medium hover:opacity-90 transition-opacity min-h-11 flex items-center'>
              Shop Men
              </Link>
              <Link
                to="/women"
                className="border border-white/25 text-white rounded-full px-5 py-3 text-sm font-medium hover:border-accent hover:text-accent transition-colors min-h-11 flex items-center"
              >
                Shop Women
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:border-l lg:border-white/10 lg:pl-16">
            <p className="uppercase tracking-[0.2em] text-xs text-accent mb-4">
              Stay In The Loop
            </p>
            <h3 className="font-display italic text-2xl sm:text-3xl text-white leading-tight mb-4">
              Get style drops in your inbox
            </h3>
            <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-sm">
              New trends, seasonal edits, and outfit ideas — no spam, unsubscribe anytime.
            </p>

            {status === "success" ? (
              <div className="flex items-center gap-2 text-sm text-white bg-white/10 rounded-full px-4 py-3 max-w-sm">
                <Check className='w-4 h-4 text-accent shrink-0'/>
                You're subscribed — welcome to the list.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='max-w-sm'>
                <div className="flex items-center gap-2 bg-white/10 rounded-full pl-4 pr-1.5 py-1.5">
                  <Mail className='w-4 h-4 text-white/50 shrink-0'/>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Your email address' className='flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none min-w-0'/>
                  <button type='submit' disabled={status==="submitting"} className='shrink-0 bg-accent text-on-accent rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 min-h-9'>
                    {status === "submitting" ? "..." : "Subscribe"}
                  </button>
                </div>
                {error && <p className='text-xs text-red-300 mt-2'>{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
