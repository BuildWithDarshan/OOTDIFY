import { Link } from "react-router-dom";

const OutfitCard = ({ outfit, coverImage = false }) => {
  return (
    <Link
      to={`/outfit/${outfit._id}`}
      className="group block rounded-2xl overflow-hidden border border-border bg-bg"
    >
      <div className="relative w-full aspect-[3/4] bg-[var(--color-bg-subtle)] overflow-hidden">
  <img
    src={outfit.coverImage?.url || outfit.coverImage}
    alt={outfit.title}
    loading="lazy"
    className={`absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105 ${
      coverImage
        ? "object-cover object-top p-0"
        : "object-contain p-2 sm:p-3"
    }`}
  />

  {outfit.isTrending && (
    <span className="absolute top-2.5 left-2.5 text-[10px] tracking-wide font-medium bg-accent text-on-accent rounded-full px-2.5 py-1">
      Trending
    </span>
  )}

  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-md">
    <span className="text-xs sm:text-sm font-semibold text-text-primary">
      ₹{outfit.totalPrice?.toLocaleString("en-IN")}
    </span>
  </div>
</div>

      <div className="p-3 sm:p-3.5">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide truncate mb-1">
          {outfit.occasion?.name}{outfit.outfitType?.name ? ` · ${outfit.outfitType.name}` : ""}
        </p>
        <h3 className="text-sm sm:text-base font-medium text-text-primary mt-0.5 truncate">
          {outfit.title}
        </h3>
      </div>
    </Link>
  );
};

export default OutfitCard;
