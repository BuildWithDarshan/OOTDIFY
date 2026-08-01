import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getOutfitById,
  getOutfits,
} from "../../services/outfitService.js";
import { API_BASE_URL } from "../../services/api.js";

const ITEM_POSITIONS = [
  "celebrity-item-one",
  "celebrity-item-two",
  "celebrity-item-three",
  "celebrity-item-four",
];

const CelebrityInspired = () => {
  const [outfits, setOutfits] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    let cancelled = false;

    getOutfits({ isCelebrityInspired: true })
      .then((data) => {
        if (!cancelled) setOutfits(data.outfits || []);
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

  const activeSummary = outfits[activeIndex];
  const activeId = activeSummary?._id;

  useEffect(() => {
    if (!activeId || details[activeId]) return undefined;

    let cancelled = false;

    getOutfitById(activeId)
      .then((data) => {
        if (!cancelled && data.outfit) {
          setDetails((current) => ({
            ...current,
            [activeId]: data.outfit,
          }));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [activeId, details]);

  useEffect(() => {
    if (outfits.length < 2) return undefined;

    const timer = window.setTimeout(() => {
      setDirection(1);
      setActiveIndex((current) => (current + 1) % outfits.length);
    }, 10000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeIndex, outfits.length]);

  const move = (step) => {
    if (!outfits.length) return;
    setDirection(step);
    setActiveIndex(
      (current) => (current + step + outfits.length) % outfits.length
    );
  };

  if (!loading && (!outfits.length || error)) return null;

  const activeOutfit = details[activeId] || activeSummary;
  const activeItems = (activeOutfit?.items || [])
    .filter((item) => typeof item === "object")
    .slice(0, 4);
  const animationClass =
    direction > 0 ? "celebrity-look-next" : "celebrity-look-previous";

  return (
    <section
      aria-label="Celebrity-inspired outfits"
      className="celebrity-inspired relative h-dvh w-full overflow-hidden bg-[#f4f5f1] text-[#081c15]"
    >
      <style>{`
        .celebrity-inspired {
          background:
            radial-gradient(circle at 50% 45%, rgba(149, 213, 178, .28), transparent 34%),
            linear-gradient(135deg, #f8f8f5 0%, #eef4ef 48%, #f7f4ed 100%);
        }

        .celebrity-inspired::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .18;
          background-image:
            linear-gradient(rgba(8, 28, 21, .08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(8, 28, 21, .08) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(circle at center, black, transparent 72%);
        }

        .celebrity-item-card {
          position: absolute;
          z-index: 20;
          width: clamp(10rem, 15vw, 13rem);
          height: clamp(8rem, 20vh, 11rem);
        }

        .celebrity-item-one { left: 5%; top: 7%; }
        .celebrity-item-two { right: 5%; top: 7%; }
        .celebrity-item-three { left: 5%; bottom: 7%; }
        .celebrity-item-four { right: 5%; bottom: 7%; }

        .celebrity-main-zone {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 30;
          width: min(34vw, 25rem);
          height: 100%;
          transform: translate(-50%, -50%);
        }

        .celebrity-main-halo {
          position: absolute;
          inset: 2% -8% 18%;
        }

        .celebrity-main-look {
          position: absolute;
          inset: 0 0 21%;
        }

        .celebrity-outfit-details {
          position: absolute;
          left: 50%;
          bottom: 1%;
          width: max-content;
          max-width: 100%;
          transform: translateX(-50%);
        }

        @keyframes celebrityLookNext {
          from { opacity: 0; transform: translateX(42px) scale(.95); filter: blur(7px); }
          to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
        }

        @keyframes celebrityLookPrevious {
          from { opacity: 0; transform: translateX(-42px) scale(.95); filter: blur(7px); }
          to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
        }

        @keyframes celebrityItemIn {
          from { opacity: 0; transform: translateY(22px) scale(.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .celebrity-look-next {
          animation: celebrityLookNext 900ms cubic-bezier(.16, 1, .3, 1) both;
        }

        .celebrity-look-previous {
          animation: celebrityLookPrevious 900ms cubic-bezier(.16, 1, .3, 1) both;
        }

        .celebrity-item-enter {
          animation: celebrityItemIn 800ms cubic-bezier(.16, 1, .3, 1) both;
        }

        @media (max-width: 767px) {
          .celebrity-inspired {
            height: auto !important;
            min-height: 0;
            overflow: visible;
          }

          .celebrity-shell {
            display: block;
            height: auto;
            padding-bottom: 1.5rem;
          }

          .celebrity-stage {
            min-height: 0;
          }

          .celebrity-main-zone {
            position: relative;
            left: auto;
            top: auto;
            width: 100%;
            height: auto;
            transform: none;
          }

          .celebrity-main-halo {
            inset: 2% 12% 18%;
          }

          .celebrity-main-look {
            position: relative;
            inset: auto;
            width: min(68vw, 18rem);
            height: auto;
            aspect-ratio: 3 / 4;
            margin-inline: auto;
          }

          .celebrity-outfit-details {
            position: relative;
            left: auto;
            bottom: auto;
            width: auto;
            max-width: 18rem;
            margin: 1.25rem auto 0;
            transform: none;
          }

          .celebrity-items-layer {
            position: relative;
            inset: auto;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
            padding-inline: .75rem;
          }

          .celebrity-item-card {
            position: relative;
            inset: auto;
            width: 100%;
            height: auto;
            aspect-ratio: 1 / 1;
            min-width: 0;
            min-height: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .celebrity-inspired * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div
        className="celebrity-shell relative z-10 grid h-full min-h-0 px-3 pb-4 sm:px-6 sm:pb-5 md:px-10"
        style={{
          paddingTop: "clamp(5.75rem, 12vh, 7.5rem)",
          gridTemplateRows: "auto minmax(0, 1fr) auto",
        }}
      >
        <header className="flex shrink-0 justify-center pb-3 text-center sm:pb-4">
          <div className="flex max-w-2xl flex-col items-center">
            <h2 className="font-display text-2xl italic leading-none sm:text-3xl md:text-4xl">
              Inspired by Icons
            </h2>
            <p className="mt-2 max-w-lg font-display text-sm italic leading-snug text-[#2d6a4f] sm:text-base">
              Celebrity-inspired looks, recreated with budget-friendly pieces you can actually make your own.
            </p>
            {activeOutfit?.inspiredByLabel && (
              <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#40916c]">
                Inspired by {activeOutfit.inspiredByLabel}
              </p>
            )}
          </div>
        </header>

        <div className="celebrity-stage relative min-h-0">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#40916c]/25 border-t-[#40916c]" />
            </div>
          )}

          {!loading && activeOutfit && (
            <>
              <div className="celebrity-main-zone">
                <div className="celebrity-main-halo pointer-events-none rounded-[45%] bg-white/55 shadow-[0_30px_90px_rgba(8,28,21,.12)]" />

                <div
                  key={activeId}
                  className={`celebrity-main-look z-30 ${animationClass}`}
                >
                  <img
                    src={
                      activeOutfit.coverImage?.url || activeOutfit.coverImage
                    }
                    alt={activeOutfit.title}
                    className="h-full w-full object-contain drop-shadow-[0_28px_28px_rgba(8,28,21,.22)]"
                  />
                </div>

                <div className="celebrity-outfit-details z-40 text-center">
                  <div className="mb-1 flex items-center justify-center gap-2">
                    <span className="rounded-full bg-[#081c15] px-2 py-0.5 text-[6px] font-semibold uppercase tracking-[0.14em] text-white sm:text-[7px]">
                      {activeOutfit.gender}
                    </span>
                    <span className="truncate text-[7px] font-semibold uppercase tracking-[0.13em] text-[#40916c] sm:text-[8px]">
                      {activeOutfit.outfitType?.name ||
                        activeOutfit.occasion?.name ||
                        "Complete look"}
                    </span>
                  </div>
                  <h3 className="truncate font-display text-lg italic sm:text-xl">
                    {activeOutfit.title}
                  </h3>
                  <p className="text-[9px] font-semibold text-[#2d6a4f] sm:text-[11px]">
                    {"\u20B9"}
                    {activeOutfit.totalPrice?.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="celebrity-items-layer absolute inset-0 z-20">
                {activeItems.map((item, index) => (
                  <a
                  key={`${activeId}-${item._id}`}
                  href={`${API_BASE_URL}/redirect/${item._id}?outfitId=${activeId}`}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className={`celebrity-item-card celebrity-item-enter ${ITEM_POSITIONS[index]} group overflow-hidden rounded-[1.15rem] bg-white p-2 shadow-[0_18px_45px_rgba(8,28,21,.14)] ring-1 ring-[#081c15]/5 transition-transform duration-500 hover:-translate-y-1`}
                  style={{ animationDelay: `${160 + index * 100}ms` }}
                >
                  <div className="relative h-full overflow-hidden rounded-xl bg-[#e8f5ea]">
                    <img
                      src={item.image?.url || item.image}
                      alt={item.name}
                      className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1.5 right-1.5 rounded-full bg-[#081c15] px-2 py-0.5 text-[7px] font-semibold text-white">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        {!loading && activeOutfit && (
          <footer className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-end gap-2 pt-2 sm:gap-3">
            <div aria-hidden="true" />

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous celebrity-inspired outfit"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#081c15] shadow-lg transition-transform duration-300 hover:scale-105"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next celebrity-inspired outfit"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#081c15] text-white shadow-lg transition-transform duration-300 hover:scale-105"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-end justify-end">
              <Link
                to={`/outfit/${activeId}`}
                className="hidden h-10 items-center justify-center gap-1.5 rounded-full bg-[#40916c] px-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#2d6a4f] sm:flex"
              >
                View outfit
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </footer>
        )}
      </div>
    </section>
  );
};

export default CelebrityInspired;
