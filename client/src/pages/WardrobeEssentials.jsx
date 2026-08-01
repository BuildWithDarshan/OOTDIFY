import { useEffect, useState } from "react";
import PageHero from "../components/Common/PageHero.jsx";
import WardrobeGrid from "../components/Wardrobe/WardrobeGrid.jsx";
import { getItems } from "../services/itemService.js";
import wardrobeBanner from "../assets/images/wardrobe-banner.png";
import wardrobeBannerMobile from "../assets/images/wardrobe-banner-mobile.png";

const GENDERS = [
  { value: "", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
];

const EDITORIAL_TEXTS = [
  "Curate with intention. A wardrobe of essentials is the quiet foundation of personal style.",
  "Fewer, better things. Invest in silhouettes that endure beyond the seasonal cycles.",
  "The beauty of utility. Every element is designed to serve a purpose, blending form and function.",
  "A canvas of restraint. Monochromatic tones and organic textures build the ultimate base.",
  "Subtle details, lasting impression. The art of dressing begins with the perfect cut.",
  "Simplicity is the ultimate sophistication. Find harmony in minimalism and high-quality fabrics."
];

const BACKGROUND_COLORS = [
  "#0B0B0C", // Pure Charcoal Graphite
  "#101012", // Slate Obsidian
  "#0E0F11", // Muted Onyx
  "#111113", // Silent Steel
  "#0D0E10", // Elegant Jet Black
  "#121215"  // Midnight Carbon
];

const renderEditorialText = (text) => {
  const index = text.indexOf(".");
  if (index !== -1) {
    const firstPart = text.substring(0, index + 1).toUpperCase();
    const secondPart = text.substring(index + 1).toUpperCase();
    return (
      <span className="block leading-relaxed">
        <span className="text-accent block font-extrabold mb-3 text-sm sm:text-base lg:text-lg tracking-[0.18em]">
          {firstPart}
        </span>
        <span className="text-white/45 block font-light text-xs sm:text-sm lg:text-base tracking-[0.15em]">
          {secondPart}
        </span>
      </span>
    );
  }
  return <span className="text-white tracking-[0.15em]">{text.toUpperCase()}</span>;
};

const WardrobeEssentials = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [gender, setGender] = useState("");
  const [activeTextIndex, setActiveTextIndex] = useState(0);

  // Fetch all wardrobe essentials once on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getItems({ isWardrobeEssential: true })
      .then((data) => {
        if (!cancelled) setItems(data.items || []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Client-side filter based on selected gender
  const filteredItems = items.filter((item) => {
    if (!gender) return true;
    return item.gender?.toLowerCase() === gender.toLowerCase();
  });

  // Track scroll position to update background color & fixed editorial texts
  useEffect(() => {
    let ticked = false;

    const handleScroll = () => {
      const section = document.getElementById("wardrobe-essentials-section");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Calculate how much of the section has scrolled through the viewport
      const totalDuration = sectionHeight + viewportHeight;
      const currentProgress = viewportHeight - rect.top;

      if (currentProgress >= 0 && rect.bottom >= 0) {
        const percentage = Math.min(Math.max(currentProgress / totalDuration, 0), 1);
        
        // Map percentage to the index of EDITORIAL_TEXTS
        const newIndex = Math.min(
          Math.floor(percentage * EDITORIAL_TEXTS.length),
          EDITORIAL_TEXTS.length - 1
        );
        
        setActiveTextIndex(newIndex);
      }
    };

    const onScroll = () => {
      if (!ticked) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticked = false;
        });
        ticked = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    // Initial run
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [filteredItems]); // Re-register scroll handler if list updates (adjusts height)

  return (
    <div>
      <PageHero
        desktopImage={wardrobeBanner}
        mobileImage={wardrobeBannerMobile}
        wordmark="ESSENTIALS"
        topRightLabel="BASICS"
        dividerLeft="BUILD"
        dividerCenter="YOUR BASE WARDROBE"
        dividerRight="LAST"
        fullHeight
      />

      <section 
        id="wardrobe-essentials-section"
        className="w-full py-16 sm:py-24 md:py-32 transition-colors duration-1000 ease-out"
        style={{ 
          backgroundColor: BACKGROUND_COLORS[activeTextIndex % BACKGROUND_COLORS.length] 
        }}
      >
        <div className="px-4 sm:px-8 md:px-12 lg:px-16">
          {/* Filters Container */}
          <div className="flex items-center gap-2 mb-12 sm:mb-16 md:mb-20 relative z-20">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGender(g.value)}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 min-h-11 cursor-pointer ${
                  gender === g.value
                    ? "bg-accent text-on-accent border-accent shadow-md"
                    : "border border-white/20 text-white/70 hover:border-accent hover:text-accent hover:bg-white/5"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-center text-xs font-bold tracking-widest text-white/60 uppercase">Loading essentials...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-32">
              <p className="text-center text-sm text-white/60">Something went wrong. Please try again.</p>
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-col md:flex-row gap-12 lg:gap-20 relative items-start">
              {/* Left Column - Sticky Editorial Text */}
              <div className="w-full md:w-1/4 md:sticky md:top-28 h-fit flex flex-col justify-start mb-8 md:mb-0 hidden md:block">
                <style>{`
                  @keyframes fadeInUp {
                    from {
                      opacity: 0;
                      transform: translateY(15px);
                      filter: blur(4px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                      filter: blur(0);
                    }
                  }
                  .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  }
                `}</style>
                <div className="space-y-4 pr-4">
                  <h3 
                    key={activeTextIndex} 
                    className="font-display italic text-lg sm:text-xl lg:text-2xl leading-relaxed animate-fade-in-up"
                  >
                    {renderEditorialText(EDITORIAL_TEXTS[activeTextIndex % EDITORIAL_TEXTS.length])}
                  </h3>
                </div>
              </div>

              {/* Right Column - The Staggered Wardrobe Grid / Empty state */}
              <div className="w-full md:w-3/4 min-h-[400px]">
                {filteredItems.length === 0 ? (
                  <div className="flex items-center justify-center h-96">
                    <p className="text-sm text-white/60">No wardrobe essentials found.</p>
                  </div>
                ) : (
                  <WardrobeGrid items={filteredItems} />
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WardrobeEssentials;