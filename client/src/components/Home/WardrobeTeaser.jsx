import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_BASE_URL } from "../../services/api.js";
import { getItems } from "../../services/itemService.js";

const RUNWAY_THEMES = [
  { background: "#081c15", glow: "#52b788", accent: "#d8f3dc" },
  { background: "#10271f", glow: "#74c69d", accent: "#b7e4c7" },
  { background: "#151d19", glow: "#40916c", accent: "#d8f3dc" },
  { background: "#0b2119", glow: "#95d5b2", accent: "#b7e4c7" },
  { background: "#17231e", glow: "#2d6a4f", accent: "#d8f3dc" },
];

const truncateWords = (value = "", limit = 25) => {
  const words = value.trim().split(/\s+/);
  if (words.length <= limit) return value;
  return `${words.slice(0, limit).join(" ")}…`;
};

const WardrobeGalleryTeaser = () => {
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const sectionRef = useRef(null);
  const dragStartX = useRef(null);

  useEffect(() => {
    let cancelled = false;

    getItems({ isWardrobeEssential: true })
      .then((data) => {
        if (!cancelled) setItems((data.items || []).slice(0, 10));
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

  const goTo = (index, movement = 0) => {
    if (!items.length) return;
    setDirection(movement);
    setActiveIndex((index + items.length) % items.length);
  };

  const goPrevious = () => goTo(activeIndex - 1, -1);
  const goNext = () => goTo(activeIndex + 1, 1);

  const handlePointerMove = (event) => {
    const section = sectionRef.current;
    if (!section) return;

    const bounds = section.getBoundingClientRect();
    section.style.setProperty(
      "--runway-x",
      `${((event.clientX - bounds.left) / bounds.width) * 100}%`
    );
    section.style.setProperty(
      "--runway-y",
      `${((event.clientY - bounds.top) / bounds.height) * 100}%`
    );
  };

  const handlePointerDown = (event) => {
    dragStartX.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerUp = (event) => {
    if (dragStartX.current === null) return;

    const distance = event.clientX - dragStartX.current;
    dragStartX.current = null;

    if (Math.abs(distance) < 45) return;
    if (distance > 0) goPrevious();
    else goNext();
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrevious();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  const theme = RUNWAY_THEMES[activeIndex % RUNWAY_THEMES.length];
  const visibleItems = items.length
    ? [-1, 0, 1].map((slot) => {
        const index = (activeIndex + slot + items.length) % items.length;
        return { slot, index, item: items[index] };
      })
    : [];

  return (
    <section
      ref={sectionRef}
      tabIndex={0}
      aria-label="Wardrobe essentials runway"
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      className="wardrobe-runway relative h-dvh w-full overflow-hidden text-white outline-none transition-colors duration-1000"
      style={{
        "--runway-x": "50%",
        "--runway-y": "45%",
        "--runway-glow": theme.glow,
        backgroundColor: theme.background,
      }}
    >
      <style>{`
        .wardrobe-runway::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              circle at var(--runway-x) var(--runway-y),
              color-mix(in srgb, var(--runway-glow) 24%, transparent),
              transparent 38%
            ),
            linear-gradient(120deg, rgba(255,255,255,.035), transparent 38% 68%, rgba(255,255,255,.025));
        }

        .wardrobe-runway::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .06;
          background-image:
            linear-gradient(rgba(255,255,255,.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.09) 1px, transparent 1px);
          background-size: 68px 68px;
          mask-image: linear-gradient(to bottom, transparent, black 25%, black 80%, transparent);
        }

        @keyframes runwayNextPrevious {
          from { transform: translateX(112%) scale(1.12); }
          to { transform: translateX(0) scale(1); }
        }

        @keyframes runwayNextActive {
          from { transform: translateX(82%) scale(.82); }
          to { transform: translateX(0) scale(1); }
        }

        @keyframes runwayNextIncoming {
          from { transform: translateX(48%) scale(.94); filter: blur(5px); }
          to { transform: translateX(0) scale(1); filter: blur(0); }
        }

        @keyframes runwayPreviousIncoming {
          from { transform: translateX(-48%) scale(.94); filter: blur(5px); }
          to { transform: translateX(0) scale(1); filter: blur(0); }
        }

        @keyframes runwayPreviousActive {
          from { transform: translateX(-82%) scale(.82); }
          to { transform: translateX(0) scale(1); }
        }

        @keyframes runwayPreviousNext {
          from { transform: translateX(-112%) scale(1.12); }
          to { transform: translateX(0) scale(1); }
        }

        .runway-move-next-previous {
          animation: runwayNextPrevious 900ms cubic-bezier(.16,1,.3,1) both;
        }

        .runway-move-next-active {
          animation: runwayNextActive 900ms cubic-bezier(.16,1,.3,1) both;
        }

        .runway-move-next-next {
          animation: runwayNextIncoming 900ms cubic-bezier(.16,1,.3,1) both;
        }

        .runway-move-previous-previous {
          animation: runwayPreviousIncoming 900ms cubic-bezier(.16,1,.3,1) both;
        }

        .runway-move-previous-active {
          animation: runwayPreviousActive 900ms cubic-bezier(.16,1,.3,1) both;
        }

        .runway-move-previous-next {
          animation: runwayPreviousNext 900ms cubic-bezier(.16,1,.3,1) both;
        }

        @keyframes runwayHangerSettle {
          0% { opacity: 0; transform: translateX(-50%) rotate(-5deg); }
          38% { opacity: 1; transform: translateX(-50%) rotate(2.4deg); }
          64% { transform: translateX(-50%) rotate(-1.2deg); }
          82% { transform: translateX(-50%) rotate(.55deg); }
          100% { opacity: 1; transform: translateX(-50%) rotate(0); }
        }

        @keyframes runwayCableGlow {
          0%, 100% { opacity: .45; }
          50% { opacity: .9; }
        }

        .runway-suspension {
          position: absolute;
          top: calc(-1 * (clamp(6rem, 13vh, 7.5rem) + 5.5rem));
          z-index: 25;
          width: clamp(7.5rem, 12vw, 10.5rem);
          height: calc(clamp(6rem, 13vh, 7.5rem) + 8.5rem);
          transform-origin: 50% 0;
          animation: runwayHangerSettle 1500ms cubic-bezier(.16,1,.3,1) both;
        }

        .runway-suspension-previous {
          left: 14.67%;
          width: clamp(6.5rem, 10vw, 8.5rem);
          height: calc(clamp(6rem, 13vh, 7.5rem) + 10rem);
          opacity: .82;
        }

        .runway-suspension-active {
          left: 50%;
        }

        .runway-suspension-next {
          left: 85.33%;
          width: clamp(6.5rem, 10vw, 8.5rem);
          height: calc(clamp(6rem, 13vh, 7.5rem) + 10rem);
          opacity: .82;
        }

        .runway-suspension-line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 3.4rem;
          width: 1px;
          transform: translateX(-50%);
          background: linear-gradient(
            to bottom,
            rgba(198,139,60,.18),
            rgba(239,190,100,.96)
          );
          box-shadow: 0 0 8px rgba(239,190,100,.28);
          animation: runwayCableGlow 3.2s ease-in-out infinite;
        }

        .runway-hanger {
          position: absolute;
          inset-inline: 0;
          bottom: 0;
          filter: drop-shadow(0 8px 8px rgba(0,0,0,.3));
        }

        @media (max-width: 767px) {
          .wardrobe-runway-grid {
            grid-template-columns: minmax(0, 1.12fr) minmax(0, .88fr) !important;
          }

          .wardrobe-runway-previous {
            display: none;
          }

          .runway-suspension {
            width: 7.5rem;
            height: calc(clamp(6rem, 13vh, 7.5rem) + 8rem);
          }

          .runway-suspension-previous {
            display: none;
          }

          .runway-suspension-active {
            left: 28%;
          }

          .runway-suspension-next {
            left: 78%;
            width: 6.25rem;
            height: calc(clamp(6rem, 13vh, 7.5rem) + 9.5rem);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wardrobe-runway *,
          .wardrobe-runway::before {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div
        className="relative z-10 grid h-full min-h-0 px-2 pb-20 sm:px-3 md:px-4"
        style={{
          paddingTop: "clamp(6rem, 13vh, 7.5rem)",
          gridTemplateRows: "auto minmax(0, 1fr)",
          background: "#000",
        }}
      >
        <header className="relative shrink-0 pb-3 pr-32 sm:pb-4 md:pr-0">
          <div >
            <h2 className="font-display text-2xl italic leading-none sm:text-3xl md:text-4xl">
              The Wardrobe Runway
            </h2>
            <p className="mt-2 max-w-md font-display text-sm italic leading-snug text-white/65 sm:text-base">
              Move through the individual pieces that build every great look.
            </p>
          </div>

          <Link
            to="/wardrobe-essentials"
            className="hidden absolute right-0 top-0 flex h-9 items-center justify-center gap-1 rounded-full bg-white px-3 text-[7px] font-semibold uppercase tracking-[0.1em] text-[#081c15] shadow-lg transition-all duration-300 hover:bg-[#d8f3dc] md:hidden"
          >
            Explore essentials
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </header>

        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            dragStartX.current = null;
          }}
          className="wardrobe-runway-grid relative mx-auto grid min-h-0 w-full max-w-6xl touch-pan-y cursor-grab grid-cols-3 items-center gap-1 py-3 active:cursor-grabbing sm:gap-2 sm:py-4 md:gap-3"
          style={{
            gridTemplateColumns:
              "minmax(0, 0.88fr) minmax(0, 1.24fr) minmax(0, 0.88fr)",
          }}
        >
          {!loading &&
            !error &&
            visibleItems.map(({ slot, item }) => {
              const slotName =
                slot < 0 ? "previous" : slot > 0 ? "next" : "active";
              const gradientId = `runway-hanger-metal-${slotName}`;

              return (
                <div
                  key={`runway-hanger-${slotName}-${item._id}`}
                  className={`runway-suspension runway-suspension-${slotName} pointer-events-none`}
                  aria-hidden="true"
                >
                  <span className="runway-suspension-line" />
                  <svg
                    className="runway-hanger"
                    viewBox="0 0 220 104"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="34"
                        y1="20"
                        x2="184"
                        y2="98"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#8f5f23" />
                        <stop offset=".24" stopColor="#f0c675" />
                        <stop offset=".52" stopColor="#b8782e" />
                        <stop offset=".78" stopColor="#f5d99d" />
                        <stop offset="1" stopColor="#84551f" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M110 56C110 47 130 44 130 29C130 17 119 12 110 16C104 19 101 24 101 30"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <path
                      d="M110 55L42 88C35 91 38 98 46 98H174C182 98 185 91 178 88L110 55Z"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M51 91L110 63L169 91"
                      stroke="rgba(255,236,194,.75)"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              );
            })}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-current"
                  style={{ color: theme.accent }}
                />
                <p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-white/50">
                  Preparing the runway
                </p>
              </div>
            </div>
          )}

          {!loading && error && (
            <p className="absolute inset-0 flex items-center justify-center text-center font-display text-lg italic text-white/65">
              The wardrobe could not be loaded right now.
            </p>
          )}

          {!loading &&
            !error &&
            visibleItems.map(({ slot, index, item }) => {
              const isActive = slot === 0;
              const slotName =
                slot < 0 ? "previous" : slot > 0 ? "next" : "active";
              const movementClass =
                direction === 1
                  ? `runway-move-next-${slotName}`
                  : direction === -1
                    ? `runway-move-previous-${slotName}`
                    : "";

              return (
                <article
                  key={`${slot}-${item._id}`}
                  onClick={() => {
                    if (!isActive) goTo(index, slot);
                  }}
                  className={`relative grid min-h-0 w-full overflow-hidden bg-[#e8f5ea] text-[#081c15] transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${slot < 0 ? "wardrobe-runway-previous" : ""} ${movementClass} ${
                    isActive
                      ? "z-20 rounded-[1.5rem] shadow-[0_24px_65px_rgba(0,0,0,.28)]"
                      : "z-10 cursor-pointer rounded-[1.3rem] opacity-45 shadow-[0_15px_38px_rgba(0,0,0,.18)] hover:opacity-70"
                  }`}
                  style={{
                    height: isActive ? "100%" : "86%",
                    maxHeight: "100%",
                    width: isActive ? "min(92%, 21rem)" : "min(88%, 18.5rem)",
                    justifySelf: "center",
                    gridTemplateRows: "minmax(0, 1fr) auto",
                  }}
                >
                  <div className="relative min-h-0 overflow-hidden">
                    <img
                      src={item.image?.url || item.image}
                      alt={item.name}
                      loading={isActive ? "eager" : "lazy"}
                      draggable="false"
                      className="absolute inset-0 block h-full w-full object-contain p-0.5 pt-12 sm:pt-14"
                    />

                    <span
                      className="absolute bottom-2.5 right-2.5 z-20 rounded-full px-2.5 py-1 text-[8px] font-bold text-white shadow-md sm:text-[9px]"
                      style={{ backgroundColor: "#081c15" }}
                    >
                      ₹{item.price?.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div
                    className="relative px-2.5 py-2 sm:px-3 sm:py-2.5"
                    style={{
                      zIndex: 50,
                      minHeight: "5.5rem",
                      color: "#081c15",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    <div className="flex h-full flex-col">
                      <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
                        <p
                          className="min-w-0 truncate text-[6px] font-semibold uppercase tracking-[0.1em] sm:text-[7px]"
                          style={{ color: "#40916c" }}
                        >
                          {item.itemType || item.brand || "Essential"}
                        </p>
                        {item.gender && (
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[6px] font-semibold uppercase tracking-[0.12em] sm:text-[7px]"
                            style={{
                              color: "#ffffff",
                              backgroundColor: "#40916c",
                            }}
                          >
                            {item.gender}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3
                          title={item.name}
                          className="line-clamp-2 text-[10px] font-medium leading-tight sm:text-xs"
                          style={{ color: "#081c15" }}
                        >
                          {truncateWords(item.name)}
                        </h3>
                      </div>

                      <a
                        href={`${API_BASE_URL}/redirect/${item._id}`}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Shop ${item.name}`}
                        className="mt-1.5 flex h-7 w-full shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-[1.01] sm:h-8"
                        style={{
                          color: "#ffffff",
                          backgroundColor: "#081c15",
                        }}
                      >
                        Shop on {item.shoppingSite || "Store"}
                        <ArrowUpRight className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>

        {!loading && !error && items.length > 0 && (
          <>
            <footer className="absolute inset-x-0 bottom-4 z-30 flex items-center justify-center gap-3">
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={goPrevious}
                  aria-label="Previous wardrobe item"
                  className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105"
                  style={{ color: "#ffffff", backgroundColor: "#40916c" }}
                >
                  <ChevronLeft className="h-4 w-4" stroke="#ffffff" />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next wardrobe item"
                  className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105"
                  style={{ color: "#081c15", backgroundColor: "#d8f3dc" }}
                >
                  <ChevronRight className="h-4 w-4" stroke="#081c15" />
                </button>
              </div>
            </footer>

            <Link
              to="/wardrobe-essentials"
              className="absolute bottom-4 right-6 z-40 hidden h-10 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#081c15] shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-[#d8f3dc] md:flex"
            >
              Explore wardrobe essentials
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default WardrobeGalleryTeaser;
