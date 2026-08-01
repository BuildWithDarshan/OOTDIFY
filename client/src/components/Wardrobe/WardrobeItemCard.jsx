import { API_BASE_URL } from "../../services/api.js";
import { ArrowUpRight } from "lucide-react";

const WardrobeItemCard = ({ item }) => {
  const redirectUrl = `${API_BASE_URL}/redirect/${item._id}`;

  return (
    <a
      href={redirectUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group block w-full transition-all duration-500"
    >
      {/* Light Canvas Image Frame */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#EAEAEA] p-6 flex items-center justify-center border border-white/5 shadow-inner transition-all duration-500 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] group-hover:-translate-y-1">
        {/* Subtle overlay glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.03] to-transparent pointer-events-none" />
        
        <img
          src={item.image?.url || item.image}
          alt={item.name}
          loading="lazy"
          className="max-w-[85%] max-h-[85%] w-auto h-auto object-contain transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />

        {/* Gender Pill - Top Right */}
        {item.gender && (
          <span className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-sm border border-white/10 text-[8px] uppercase tracking-[0.2em] text-white/90 font-bold">
            {item.gender}
          </span>
        )}
      </div>

      {/* Content area below the frame */}
      <div className="mt-3.5 px-1.5 flex justify-between items-start gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-white/90 tracking-wide truncate group-hover:text-accent transition-colors duration-300">
            {item.name}
          </h4>
          <span className="inline-block text-[9px] uppercase tracking-widest text-white/40 font-medium">
            Essential curation
          </span>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <p className="text-xs sm:text-sm font-bold text-accent tracking-wide">
            ₹{item.price?.toLocaleString("en-IN")}
          </p>
          <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-accent uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Buy <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
};

export default WardrobeItemCard;