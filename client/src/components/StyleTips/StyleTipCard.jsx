import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen } from "lucide-react";

const StyleTipCard = ({ tip, featured = false }) => {
  const imageUrl = tip.coverImage?.url || tip.coverImage;
  const contentSnippet = tip.content
    ? tip.content.replace(/[#*`]/g, "").slice(0, featured ? 160 : 85) + "..."
    : "";

  if (featured) {
    return (
      <Link
        to={`/style-tips/${tip._id}`}
        className="group block rounded-3xl overflow-hidden border border-border bg-bg/60 backdrop-blur-md shadow-sm hover:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] hover:shadow-accent/5 hover:border-accent/30 transition-all duration-500 ease-out"
      >
        <div className="flex flex-col lg:flex-row min-h-[380px]">
          {/* Featured Image Frame */}
          <div className="relative lg:w-[45%] bg-[var(--color-bg-subtle)] p-6 sm:p-8 flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-border/60">
            {/* Ambient background glow */}
            <div className="absolute -inset-10 bg-radial-gradient from-accent/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative aspect-[4/3] lg:aspect-square w-full max-w-[280px] lg:max-w-[340px] flex items-center justify-center">
              <img
                src={imageUrl}
                alt={tip.title}
                loading="lazy"
                className="max-w-full max-h-full object-contain rounded-2xl drop-shadow-[0_15px_25px_rgba(0,0,0,0.12)] transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:rotate-1"
              />
            </div>
            
            {tip.category && (
              <span className="absolute top-4 left-4 text-[9px] tracking-[0.2em] font-extrabold uppercase bg-accent text-on-accent rounded-full px-3 py-1 shadow-md">
                {tip.category}
              </span>
            )}
          </div>

          {/* Featured Info */}
          <div className="lg:w-[55%] p-6 sm:p-8 md:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-accent uppercase">
                <BookOpen className="w-3.5 h-3.5" /> Featured Spotlight
              </span>
            </div>

            <h3 className="font-display italic text-2xl sm:text-3xl md:text-4xl text-text-primary leading-tight group-hover:text-accent-hover transition-colors duration-300">
              {tip.title}
            </h3>

            {contentSnippet && (
              <p className="text-text-secondary text-xs sm:text-sm mt-4 leading-relaxed font-light line-clamp-3">
                {contentSnippet}
              </p>
            )}

            <div className="mt-6 sm:mt-8 pt-4 border-t border-border/40 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-semibold text-accent-hover text-xs uppercase tracking-widest group-hover:underline">
                Explore Style Tip
              </span>
              <span className="w-10 h-10 rounded-full bg-[var(--color-bg-subtle)] border border-border group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent transition-all duration-300 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Non-featured Grid Card
  return (
    <Link
      to={`/style-tips/${tip._id}`}
      className="group flex flex-col h-full rounded-2xl overflow-hidden border border-border bg-bg/50 backdrop-blur-md shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] hover:shadow-accent/5 hover:border-accent/25 transition-all duration-500 ease-out"
    >
      {/* Image Container: Fully Contained with Padding */}
      <div className="relative w-full aspect-[4/3] bg-[var(--color-bg-subtle)] p-5 flex items-center justify-center overflow-hidden border-b border-border/40 shrink-0">
        {/* Ambient background glow */}
        <div className="absolute -inset-10 bg-radial-gradient from-accent/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <img
          src={imageUrl}
          alt={tip.title}
          loading="lazy"
          className="max-w-full max-h-full object-contain rounded-xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-all duration-700 ease-out group-hover:scale-[1.03]"
        />

        {tip.category && (
          <span className="absolute top-3 left-3 text-[8px] sm:text-[9px] tracking-[0.2em] font-extrabold uppercase bg-bg/95 backdrop-blur-sm text-text-primary rounded-full px-2.5 py-1 border border-border/80 shadow-sm">
            {tip.category}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="font-display italic text-base sm:text-lg text-text-primary leading-snug group-hover:text-accent-hover transition-colors duration-300 line-clamp-2">
          {tip.title}
        </h3>

        {contentSnippet && (
          <p className="text-text-secondary text-[11px] sm:text-xs mt-2.5 leading-relaxed font-light line-clamp-2">
            {contentSnippet}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 font-semibold text-accent-hover text-[10px] uppercase tracking-widest">
            Read tip
          </span>
          <span className="w-8 h-8 rounded-full bg-[var(--color-bg-subtle)] border border-border group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent transition-all duration-300 flex items-center justify-center">
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default StyleTipCard;