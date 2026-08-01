import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const OOTDDocked = ({ outfit }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  if (!outfit) return null;

  return (
    <Link
      to={`/outfit/${outfit._id}`}
      aria-label={`View today's outfit: ${outfit.title}`}
      className={`group relative mb-8 flex flex-col items-stretch overflow-hidden rounded-3xl bg-bg shadow-[0_18px_50px_rgba(8,28,21,0.12)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(8,28,21,0.17)] sm:mb-10 sm:flex-row ${
        mounted
          ? "translate-y-0 scale-100 opacity-100"
          : "-translate-y-12 scale-[0.96] opacity-0"
      }`}
    >
      <span className="absolute inset-x-0 top-0 z-20 h-1 bg-accent" />

      <div className="relative flex h-72 w-full shrink-0 items-center justify-center overflow-hidden bg-[var(--color-bg-subtle)] sm:h-auto sm:min-h-[22rem] sm:w-[45%]">
        <img
          src={outfit.coverImage?.url || outfit.coverImage}
          alt={outfit.title}
          className="h-full w-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.025] sm:absolute sm:inset-0 sm:p-6"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center bg-bg p-5 sm:p-8 md:p-10">
        <span className="mb-4 inline-flex w-fit items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-hover sm:text-xs">
          Today&apos;s OOTD
        </span>

        <h2 className="mb-3 font-display text-2xl italic leading-tight text-text-primary transition-colors duration-300 group-hover:text-accent-hover sm:text-3xl md:text-4xl">
          {outfit.title}
        </h2>

        <p className="mb-6 text-base font-semibold text-text-secondary sm:text-lg">
          ₹{outfit.totalPrice?.toLocaleString("en-IN")}
        </p>

        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-bg transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-accent group-hover:text-on-accent group-hover:shadow-lg">
          View this look
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};

export default OOTDDocked;
