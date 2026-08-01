import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { getOOTD } from "../../services/outfitService.js";
import menWardrobeOpen from "../../assets/images/ootd-wardrobe-men-open-cropped.png";
import menWardrobeClosed from "../../assets/images/ootd-wardrobe-men-closed-cropped.png";
import womenWardrobeOpen from "../../assets/images/ootd-wardrobe-women-open-cropped.png";
import womenWardrobeClosed from "../../assets/images/ootd-wardrobe-women-closed-cropped.png";

const WARDROBES = {
  men: {
    label: "Men",
    openImage: menWardrobeOpen,
    closedImage: menWardrobeClosed,
  },
  women: {
    label: "Women",
    openImage: womenWardrobeOpen,
    closedImage: womenWardrobeClosed,
  },
};

const Wardrobe = ({
  gender,
  outfit,
  loading,
  error,
  isOpen,
  onOpen,
  onClose,
}) => {
  const wardrobe = WARDROBES[gender];
  const [showInterior, setShowInterior] = useState(isOpen);

  useEffect(() => {
    if (isOpen || !showInterior) {
      return undefined;
    }

    const hideTimer = window.setTimeout(() => {
      setShowInterior(false);
    }, 2450);

    return () => {
      window.clearTimeout(hideTimer);
    };
  }, [isOpen, showInterior]);

  const handleOpen = () => {
    setShowInterior(true);
    onOpen();
  };

  return (
    <article
      className={`group/wardrobe relative w-full min-w-0 transition-all duration-1000 ${
        isOpen
          ? "z-20 drop-shadow-[0_24px_38px_rgba(8,28,21,0.2)]"
          : "z-10 hover:-translate-y-1"
      }`}
    >
      <div
        className="wardrobe-perspective relative w-full overflow-hidden rounded-[1.5rem]"
        style={{
          height: "clamp(30rem, 58vw, 42rem)",
          perspective: "1800px",
          perspectiveOrigin: "50% 50%",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] bg-bg-subtle shadow-[0_20px_55px_rgba(8,28,21,0.12)]">
          <img
            src={wardrobe.openImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 block h-full w-full object-cover"
          />
          <div
            className={`absolute inset-0 bg-black/10 transition-opacity duration-500 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          {showInterior && (
            <>
              <div
                className="absolute z-20 flex items-center justify-center"
                style={{
                  inset: "7%",
                }}
              >
                {loading && (
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent drop-shadow-md" />
                )}

                {!loading && error && (
                  <p className="rounded-full bg-black/55 px-4 py-2 text-xs text-white backdrop-blur-sm">
                    Couldn&apos;t load today&apos;s look.
                  </p>
                )}

                {!loading && !error && !outfit && (
                  <p className="rounded-full bg-black/55 px-4 py-2 text-xs text-white backdrop-blur-sm">
                    No OOTD selected for today.
                  </p>
                )}

                {!loading && !error && outfit && (
                  <img
                    key={`${gender}-${outfit._id}`}
                    src={outfit.coverImage?.url || outfit.coverImage}
                    alt={outfit.title}
                    className="wardrobe-outfit-pop block h-full w-full max-w-full object-contain p-2 drop-shadow-[0_25px_24px_rgba(0,0,0,0.35)] sm:p-3"
                  />
                )}
              </div>

              {outfit && !loading && !error && (
                <div
                  className="wardrobe-details absolute z-30 rounded-xl bg-white p-2.5 text-left shadow-xl sm:p-3"
                  style={{
                    left: "5%",
                    bottom: "3%",
                    width: "min(52%, 17rem)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-accent-hover">
                        {wardrobe.label}&apos;s OOTD
                      </span>
                      <h3 className="truncate font-display text-base italic text-text-primary sm:text-lg">
                        {outfit.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-text-secondary sm:text-xs">
                        ₹{outfit.totalPrice?.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Link
                      to={`/outfit/${outfit._id}`}
                      aria-label={`View ${outfit.title}`}
                      className="group/link flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-text-primary text-bg shadow-md transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-on-accent"
                    >
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleOpen}
          aria-label={`Open ${wardrobe.label} wardrobe`}
          aria-expanded={isOpen}
          className={`wardrobe-door absolute bottom-0 left-0 top-0 z-30 w-1/2 origin-left overflow-hidden rounded-l-[1.5rem] bg-bg transition-transform duration-[2400ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
            isOpen ? "pointer-events-none" : ""
          }`}
          style={{
            backgroundImage: `url("${wardrobe.closedImage}")`,
            backgroundPosition: "left center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "200% 100%",
            transform: isOpen ? "rotateY(-105deg)" : "rotateY(0deg)",
          }}
        >
          <span
            className={`absolute inset-0 bg-black/5 transition-opacity duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
        </button>

        <button
          type="button"
          onClick={handleOpen}
          aria-label={`Open ${wardrobe.label} wardrobe`}
          aria-expanded={isOpen}
          className={`wardrobe-door absolute bottom-0 right-0 top-0 z-30 w-1/2 origin-right overflow-hidden rounded-r-[1.5rem] bg-bg transition-transform duration-[2400ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
            isOpen ? "pointer-events-none" : ""
          }`}
          style={{
            backgroundImage: `url("${wardrobe.closedImage}")`,
            backgroundPosition: "right center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "200% 100%",
            transform: isOpen ? "rotateY(105deg)" : "rotateY(0deg)",
          }}
        >
          <span
            className={`absolute inset-0 bg-black/5 transition-opacity duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
        </button>

      </div>

      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Reveal the ${wardrobe.label}'s outfit of the day`}
        aria-hidden={isOpen}
        tabIndex={isOpen ? -1 : 0}
        className="flex items-center justify-center gap-2 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md transition-all duration-700 hover:scale-[1.02] sm:text-xs"
        style={{
          position: "absolute",
          left: "12%",
          right: "12%",
          top: "0%",
          zIndex: 100,
          color: "#ffffff",
          background: "rgba(8, 28, 21, 0.78)",
          boxShadow: "0 10px 28px rgba(0, 0, 0, 0.24)",
          borderBottomLeftRadius: '50px',
          borderBottomRightRadius: '50px',
          opacity: isOpen ? 0 : 1,
          visibility: isOpen ? "hidden" : "visible",
          pointerEvents: isOpen ? "none" : "auto",
          transform: isOpen ? "translateY(12px)" : "translateY(0)",
        }}
      >
        
        <span>Reveal the {wardrobe.label}&apos;s OOTD</span>
      </button>

      {isOpen && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          aria-label={`Close ${wardrobe.label} wardrobe`}
          className="absolute right-3 top-3 z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-white text-text-primary shadow-[0_8px_24px_rgba(8,28,21,0.22)] transition-all duration-300 hover:scale-105 hover:text-accent-hover sm:right-4 sm:top-4"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </article>
  );
};

const OOTDBanner = () => {
  const [activeGender, setActiveGender] = useState(null);
  const [outfits, setOutfits] = useState({
    men: null,
    women: null,
  });
  const [loading, setLoading] = useState({
    men: true,
    women: true,
  });
  const [error, setError] = useState({
    men: false,
    women: false,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async (gender) => {
      try {
        const data = await getOOTD(gender);
        if (!cancelled) {
          setOutfits((current) => ({
            ...current,
            [gender]: data.outfit || null,
          }));
        }
      } catch {
        if (!cancelled) {
          setError((current) => ({ ...current, [gender]: true }));
        }
      } finally {
        if (!cancelled) {
          setLoading((current) => ({ ...current, [gender]: false }));
        }
      }
    };

    load("men");
    load("women");

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="ootd"
      className="relative overflow-hidden bg-bg px-4 py-16 sm:px-6 sm:py-24 md:px-10 md:py-28"
    >
      <style>{`
        .wardrobe-perspective {
          perspective: 1800px;
          perspective-origin: 50% 50%;
          transform-style: preserve-3d;
        }

        .wardrobe-door {
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }

        @keyframes wardrobeOutfitPop {
          0% {
            transform: translate3d(0, 22px, 0) scale(0.28);
            opacity: 0;
          }
          62% {
            transform: translate3d(0, 0, 0) scale(1.05);
            opacity: 1;
          }
          76% {
            transform: translate3d(0, 0, 0) scale(1.05);
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(0.82);
            opacity: 1;
          }
        }

        @keyframes wardrobeDetailsIn {
          from {
            transform: translate3d(0, 18px, 0);
            opacity: 0;
          }
          to {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        .wardrobe-outfit-pop {
          transform-origin: center;
          animation: wardrobeOutfitPop 2600ms cubic-bezier(0.16, 1, 0.3, 1) 650ms both;
        }

        .wardrobe-details {
          animation: wardrobeDetailsIn 900ms cubic-bezier(0.16, 1, 0.3, 1) 2350ms both;
        }

        @media (prefers-reduced-motion: reduce) {
          .wardrobe-door,
          .wardrobe-outfit-pop,
          .wardrobe-details {
            animation: none;
            transition: none;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-52 top-1/3 h-96 w-96 rounded-full bg-bg-subtle blur-3xl" />
      <div className="pointer-events-none absolute -right-52 bottom-0 h-96 w-96 rounded-full bg-accent-subtle/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <p className="mb-3 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent sm:text-xs">
            Daily wardrobe
          </p>
          <h2 className="font-display text-4xl italic text-text-primary sm:text-5xl md:text-6xl">
            Outfit of the Day
          </h2>
          <p className="mx-auto mt-3 max-w-2xl font-display text-lg italic leading-relaxed text-text-secondary sm:text-xl md:text-2xl">
            Open a wardrobe and reveal today&apos;s curated look.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-2 sm:gap-6 lg:gap-10">
          {["men", "women"].map((gender) => (
            <Wardrobe
              key={gender}
              gender={gender}
              outfit={outfits[gender]}
              loading={loading[gender]}
              error={error[gender]}
              isOpen={activeGender === gender}
              onOpen={() => setActiveGender(gender)}
              onClose={() => setActiveGender(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OOTDBanner;
