import { Sun, Tag, Compass, Layers, Flame, Shirt } from "lucide-react";

const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  if (cat === "") return <Compass className="w-4 h-4" />;
  if (cat.includes("trend") || cat.includes("hot")) return <Flame className="w-4 h-4" />;
  if (cat.includes("basic") || cat.includes("casual") || cat.includes("street")) return <Shirt className="w-4 h-4" />;
  if (cat.includes("styling") || cat.includes("guide")) return <Layers className="w-4 h-4" />;
  if (cat.includes("seasonal") || cat.includes("summer") || cat.includes("winter")) return <Sun className="w-4 h-4" />;
  return <Tag className="w-4 h-4" />;
};

const CategoryTabs = ({ categories, active, onChange }) => {
  return (
    <div className="relative">
      {/* Decorative background line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap justify-start md:justify-center scrollbar-hide">
        <button
          type="button"
          onClick={() => onChange("")}
          className={`group shrink-0 flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-300 min-h-11 cursor-pointer select-none border ${
            active === ""
              ? "bg-text-primary text-bg border-text-primary shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] scale-102"
              : "bg-bg/40 backdrop-blur-sm border-border/80 text-text-secondary hover:border-accent hover:text-accent-hover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
          }`}
        >
          <span className={`transition-transform duration-300 ${active === "" ? "scale-110" : "group-hover:rotate-12"}`}>
            {getCategoryIcon("")}
          </span>
          <span>All Guides</span>
        </button>

        {categories.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={`group shrink-0 flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wide uppercase transition-all duration-300 min-h-11 cursor-pointer select-none border ${
                isActive
                  ? "bg-text-primary text-bg border-text-primary shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] scale-102"
                  : "bg-bg/40 backdrop-blur-sm border-border/80 text-text-secondary hover:border-accent hover:text-accent-hover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
              }`}
            >
              <span className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:rotate-12 text-accent"}`}>
                {getCategoryIcon(cat)}
              </span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
