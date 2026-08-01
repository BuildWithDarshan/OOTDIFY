import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getOutfits } from "../../services/outfitService.js";

const THEME = [
  {
    menBg: "#000000",
    menText: "#FFFFFF",
    menDark: true,
    womenBg: "#FFFFFF",
    womenText: "#081C15",
    womenDark: false,
  },
  {
    menBg: "#FFFFFF",
    menText: "#081C15",
    menDark: false,
    womenBg: "#000000",
    womenText: "#FFFFFF",
    womenDark: true,
  },
];

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const OutfitSlide = ({ outfit, textColor, isDark, style }) => {
  if (!outfit) return null;
  return (
    <div
      className="group/slide absolute inset-0 flex flex-col items-center justify-center px-3 text-center sm:px-8"
      style={style}
    >
      <div
        className={`relative mb-5 h-60 w-44 overflow-hidden rounded-[1.35rem] shadow-[0_22px_55px_rgba(0,0,0,0.2)] ring-1 backdrop-blur-sm transition-all duration-500 group-hover/slide:-translate-y-1 group-hover/slide:shadow-[0_28px_65px_rgba(0,0,0,0.28)] sm:mb-6 sm:h-80 sm:w-60 md:h-[22rem] md:w-72 ${
          isDark
            ? "bg-white/10 ring-white/20"
            : "bg-black/[0.04] ring-black/10"
        }`}
      >
        <img
          src={outfit.coverImage?.url || outfit.coverImage}
          alt={outfit.title}
          className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-700 ease-out group-hover/slide:scale-[1.025] sm:p-3"
        />
      </div>
      <h3
        className="mb-1.5 max-w-[15rem] font-display text-xl italic leading-tight transition-transform duration-300 group-hover/slide:scale-[1.02] sm:max-w-xs sm:text-2xl md:text-3xl"
        style={{
          color: textColor,
          textShadow: "0 2px 18px rgba(0,0,0,0.12)",
        }}
      >
        {outfit.title}
      </h3>
      <p className="text-sm sm:text-base font-medium mb-4" style={{ color: textColor, opacity: 0.85 }}>
        ₹{outfit.totalPrice?.toLocaleString("en-IN")}
      </p>
      <Link
        to={`/outfit/${outfit._id}`}
        className="text-xs sm:text-sm font-medium underline underline-offset-4 hover:opacity-70 transition-opacity"
        style={{ color: textColor }}
      >
        View this look
      </Link>
    </div>
  );
};

const CategorySplit = () => {
  const containerRef = useRef(null);
  const [menOutfits, setMenOutfits] = useState([]);
  const [womenOutfits, setWomenOutfits] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getOutfits({ gender: "men" }),
      getOutfits({ gender: "women" }),
    ])
      .then(([menData, womenData]) => {
        if (cancelled) return;
        setMenOutfits((menData.outfits || []).slice(0, 3));
        setWomenOutfits((womenData.outfits || []).slice(0, 3));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const steps = Math.max(menOutfits.length, womenOutfits.length, 1);

  useEffect(() => {
    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrolled = -rect.top;
        const p = clamp(scrolled / vh, 0, steps - 1);
        setProgress(p);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [steps]);

  if (menOutfits.length === 0 && womenOutfits.length === 0) return null;

  const activeIndex = Math.floor(progress + 0.001);
  const theme = THEME[activeIndex % THEME.length];
  const headingTextGradient = `linear-gradient(to right, ${theme.menText} 0%, ${theme.menText} 50%, ${theme.womenText} 50%, ${theme.womenText} 100%)`;

  return (
    <div ref={containerRef} style={{ height: `${steps * 100}dvh` }} className="relative w-full">
      <div className="sticky top-0 h-dvh w-full overflow-hidden flex">
        {/* Heading overlay */}
        <div className="pointer-events-none absolute left-0 right-0 top-5 z-20 flex justify-center px-3 sm:top-8 sm:px-4 md:top-10">
          <div className="relative max-w-xl px-5 py-3 text-center sm:px-8 sm:py-4">
            <div className="mb-1.5 flex items-center justify-center gap-2">
              <span
                className="h-px w-6 opacity-60 sm:w-9"
                style={{ backgroundColor: theme.menText }}
              />
              <span
                className="h-px w-6 opacity-60 sm:w-9"
                style={{ backgroundColor: theme.womenText }}
              />
            </div>
            <h2
              className="bg-clip-text font-display text-3xl italic leading-none text-transparent sm:text-4xl md:text-5xl"
              style={{ backgroundImage: headingTextGradient }}
            >
              The Edit
            </h2>
            <p
              className="mt-2 bg-clip-text font-display text-sm italic leading-snug tracking-wide text-transparent sm:text-base md:text-lg"
              style={{ backgroundImage: headingTextGradient }}
            >
              Fresh looks for him and her — updated regularly, styled side by side.
            </p>
          </div>
        </div>

        {/* Men — left half */}
        <div
          className="relative w-1/2 h-full overflow-hidden transition-colors duration-500"
          style={{ backgroundColor: theme.menBg }}
        >
          {menOutfits.map((outfit, i) => (
            <OutfitSlide
              key={outfit._id}
              outfit={outfit}
              textColor={theme.menText}
              isDark={theme.menDark}
              style={{ transform: `translateY(${(progress - i) * 100}%)` }}
            />
          ))}
          <span className="absolute bottom-6 left-6 text-xs tracking-[0.2em] font-semibold uppercase" style={{ color: theme.menText, opacity: 0.7 }}>
            Men
          </span>
        </div>

        {/* Women — right half */}
        <div
          className="relative w-1/2 h-full overflow-hidden transition-colors duration-500"
          style={{ backgroundColor: theme.womenBg }}
        >
          {womenOutfits.map((outfit, i) => (
            <OutfitSlide
              key={outfit._id}
              outfit={outfit}
              textColor={theme.womenText}
              isDark={theme.womenDark}
              style={{ transform: `translateY(${(i - progress) * 100}%)` }}
            />
          ))}
          <span className="absolute bottom-6 right-6 text-xs tracking-[0.2em] font-semibold uppercase" style={{ color: theme.womenText, opacity: 0.7 }}>
            Women
          </span>
        </div>
      </div>
    </div>
  );
};

export default CategorySplit;
