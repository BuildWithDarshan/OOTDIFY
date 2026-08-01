import { API_BASE_URL } from "../../services/api.js";

const ItemCard = ({ item, outfitId }) => {
  const redirectUrl = `${API_BASE_URL}/redirect/${item._id}${outfitId ? `?outfitId=${outfitId}` : ""}`;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-bg flex flex-col">
      <div className="relative w-full aspect-[4/3] bg-[var(--color-bg-subtle)]">
  <img
    src={item.image?.url || item.image}
    alt={item.name}
    className="absolute inset-0 w-full h-full object-cover"
    loading="lazy"
  />

  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-md">
    <span className="text-xs sm:text-sm font-semibold text-black">
      ₹{item.price?.toLocaleString("en-IN")}
    </span>
  </div>
</div>

      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide truncate mb-1">
          {item.itemType}{item.brand ? ` · ${item.brand}` : ""}
        </p>
        <h3 className="text-xs sm:text-sm font-medium text-text-primary mt-0.5 line-clamp-1 mb-2">
          {item.name}
        </h3>

        <a
          href={redirectUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="mt-auto inline-flex items-center justify-center gap-1.5 bg-text-primary text-bg rounded-full px-3 py-2 text-xs font-medium mt-2.5 hover:bg-accent hover:text-on-accent transition-colors"
        >
          Shop on {item.shoppingSite}
        </a>
      </div>
    </div>
  );
};

export default ItemCard;