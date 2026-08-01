import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const PageHero = ({
  desktopImage,
  mobileImage,
  wordmark,
  topRightLabel,
  dividerLeft,
  dividerCenter,
  dividerRight,
  ctaLabel,
  ctaHref,
  fullHeight = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef(null);
  const characters = Array.from(wordmark || "");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handlePointerMove = (event) => {
    const section = sectionRef.current;
    if (!section) return;

    const bounds = section.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    section.style.setProperty("--hero-pointer-x", `${x * 100}%`);
    section.style.setProperty("--hero-pointer-y", `${y * 100}%`);
    section.style.setProperty("--hero-shift-x", `${(x - 0.5) * 10}px`);
    section.style.setProperty("--hero-shift-y", `${(y - 0.5) * 7}px`);
  };

  const resetPointer = () => {
    const section = sectionRef.current;
    if (!section) return;
    section.style.setProperty("--hero-pointer-x", "50%");
    section.style.setProperty("--hero-pointer-y", "42%");
    section.style.setProperty("--hero-shift-x", "0px");
    section.style.setProperty("--hero-shift-y", "0px");
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className={`page-hero relative isolate w-full overflow-hidden bg-[#06130f] text-white ${
        fullHeight ? "min-h-dvh" : "min-h-[55vh] sm:min-h-[65vh] md:min-h-[70vh]"
      }`}
      style={{
        "--hero-pointer-x": "50%",
        "--hero-pointer-y": "42%",
        "--hero-shift-x": "0px",
        "--hero-shift-y": "0px",
      }}
    >
      <style>{`
        .page-hero-media {
          clip-path: inset(0 100% 0 0);
          filter: saturate(.86) contrast(1.03);
          opacity: 0;
          transition:
            clip-path 1800ms cubic-bezier(.16,1,.3,1),
            filter 1800ms ease,
            opacity 900ms ease;
        }

        .page-hero-media.is-visible {
          clip-path: inset(0 0 0 0);
          filter: saturate(1) contrast(1);
          opacity: 1;
        }

        .page-hero-spotlight {
          background: radial-gradient(
            circle at var(--hero-pointer-x) var(--hero-pointer-y),
            rgba(82,183,136,.18),
            transparent 27%
          );
          transition: background 180ms linear;
        }

        .page-hero-title-shell {
          transform: translate3d(var(--hero-shift-x), var(--hero-shift-y), 0);
          transition: transform 500ms cubic-bezier(.16,1,.3,1);
        }

        .page-hero-character {
          display: inline-block;
          opacity: 0;
          transform: translate3d(0, 115%, 0) rotate(4deg);
          transition:
            opacity 600ms ease var(--char-delay),
            transform 1100ms cubic-bezier(.16,1,.3,1) var(--char-delay);
        }

        .page-hero-character.is-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0) rotate(0);
        }

        .page-hero-track-fill {
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 1700ms cubic-bezier(.16,1,.3,1) 350ms;
        }

        .page-hero-track-fill.is-visible {
          transform: scaleX(1);
        }

        @keyframes pageHeroPulseTravel {
          0% { left: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }

        @keyframes pageHeroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .page-hero-track-pulse {
          animation: pageHeroPulseTravel 4200ms ease-in-out 1900ms infinite;
        }

        .page-hero-label-float {
          animation: pageHeroFloat 4.5s ease-in-out 2s infinite;
        }

        .page-hero-cta::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(105deg, transparent 25%, rgba(255,255,255,.34), transparent 72%);
          transform: translateX(-130%);
          transition: transform 700ms cubic-bezier(.16,1,.3,1);
        }

        .page-hero-cta:hover::before {
          transform: translateX(130%);
        }

        @media (max-width: 767px) {
          .page-hero-title-shell {
            transform: none;
            bottom: 4.75rem !important;
            padding-inline: 1rem;
          }

          .page-hero-spotlight {
            background: radial-gradient(circle at 50% 42%, rgba(82,183,136,.14), transparent 34%);
          }

          .page-hero-floating-label {
            top: 6.75rem !important;
            right: 1rem !important;
          }

          .page-hero-divider {
            top: 10.75rem !important;
            padding-inline: 1rem !important;
          }

          .page-hero-divider-grid {
            display: grid;
            grid-template-columns: minmax(0, auto) minmax(0, 1fr) minmax(0, auto);
            gap: .45rem;
          }

          .page-hero-divider-track {
            display: none;
          }

          .page-hero-divider-center {
            display: block !important;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            border: 1px solid rgba(255,255,255,.15);
            border-radius: 999px;
            background: rgba(0,0,0,.2);
            padding: .3rem .55rem;
            font-size: 6px;
            letter-spacing: .14em;
            backdrop-filter: blur(5px);
          }

          .page-hero-divider-edge {
            max-width: 27vw;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: .3rem .55rem !important;
            font-size: 6px !important;
            letter-spacing: .14em !important;
          }

          .page-hero-title-kicker {
            display: none;
          }

          .page-hero-wordmark {
            white-space: normal;
            font-size: clamp(2.75rem, 13.5vw, 4rem) !important;
            line-height: .84;
            letter-spacing: -.025em;
          }

          .page-hero-cta {
            right: 1rem !important;
            bottom: 1rem !important;
            height: 2.5rem;
            max-width: calc(100vw - 2rem);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .page-hero *,
          .page-hero::before,
          .page-hero::after {
            animation: none !important;
            transition: none !important;
          }

          .page-hero-media,
          .page-hero-character {
            clip-path: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <picture className="absolute inset-0 flex h-full w-full items-center justify-center">
        {mobileImage && <source media="(max-width: 767px)" srcSet={mobileImage} />}
        <img
          src={desktopImage}
          alt=""
          aria-hidden="true"
          className={`page-hero-media h-full w-full object-cover object-top ${
            mounted ? "is-visible" : ""
          }`}
        />
      </picture>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,19,15,.48)_0%,transparent_28%,transparent_72%,rgba(6,19,15,.34)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,12,9,.3)_0%,transparent_24%,transparent_66%,rgba(3,12,9,.62)_100%)]" />
      <div className="page-hero-spotlight pointer-events-none absolute inset-0 mix-blend-screen" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {topRightLabel && (
        <div
          className={`page-hero-floating-label page-hero-label-float absolute right-4 top-24 z-20 transition-all duration-[1200ms] delay-700 sm:right-8 sm:top-28 md:right-10 ${
            mounted ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
          }`}
        >
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-[#06130f]/45 px-3 py-1.5 shadow-[0_12px_35px_rgba(0,0,0,.18)] backdrop-blur-md sm:px-4 sm:py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#52b788] shadow-[0_0_12px_rgba(82,183,136,.9)]" />
            <span className="font-display text-sm italic tracking-[0.08em] text-[#d8f3dc] sm:text-lg md:text-xl">
              {topRightLabel}
            </span>
          </div>
        </div>
      )}

      {(dividerLeft || dividerCenter || dividerRight) && (
        <div
          className={`page-hero-divider absolute inset-x-0 z-20 px-4 sm:px-8 md:px-10 ${
            fullHeight ? "top-[34%] sm:top-[38%]" : "top-[40%] sm:top-[44%]"
          }`}
        >
          <div className="page-hero-divider-grid grid grid-cols-[auto_minmax(2rem,1fr)_auto] items-center gap-3 sm:grid-cols-[auto_minmax(3rem,1fr)_auto_minmax(3rem,1fr)_auto] sm:gap-4">
            <span
              className={`page-hero-divider-edge rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm transition-all duration-1000 delay-300 sm:px-3 sm:text-[9px] md:text-[10px] ${
                mounted ? "translate-x-0 opacity-100" : "-translate-x-5 opacity-0"
              }`}
            >
              {dividerLeft}
            </span>

            <div className="page-hero-divider-track relative h-px overflow-visible bg-white/18">
              <span
                className={`page-hero-track-fill absolute inset-0 bg-gradient-to-r from-[#52b788] via-white/70 to-[#52b788] ${
                  mounted ? "is-visible" : ""
                }`}
              />
              <span className="page-hero-track-pulse absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_rgba(216,243,220,.95)]" />
            </div>

            <span
              className={`page-hero-divider-center hidden text-center text-[9px] font-semibold uppercase tracking-[0.24em] text-white/85 transition-all duration-1000 delay-500 sm:block md:text-[10px] ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              {dividerCenter}
            </span>

            <div className="page-hero-divider-track relative hidden h-px overflow-visible bg-white/18 sm:block">
              <span
                className={`page-hero-track-fill absolute inset-0 bg-gradient-to-r from-[#52b788] via-white/70 to-[#52b788] ${
                  mounted ? "is-visible" : ""
                }`}
              />
            </div>

            <span
              className={`page-hero-divider-edge justify-self-end rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm transition-all duration-1000 delay-300 sm:px-3 sm:text-[9px] md:text-[10px] ${
                mounted ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"
              }`}
            >
              {dividerRight}
            </span>
          </div>
        </div>
      )}

      <div
        className={`page-hero-title-shell absolute inset-x-0 z-20 px-4 sm:px-7 md:px-10 ${
          fullHeight ? "bottom-20 sm:bottom-24" : "bottom-16 sm:bottom-20"
        }`}
      >
        <div className="page-hero-title-kicker mb-2 flex items-center gap-2 sm:mb-3">
          <span
            className={`h-px bg-[#52b788] transition-all duration-1000 delay-500 ${
              mounted ? "w-10 opacity-100 sm:w-14" : "w-0 opacity-0"
            }`}
          />
          <span
            className={`text-[7px] font-semibold uppercase tracking-[0.28em] text-[#b7e4c7] transition-opacity duration-700 delay-700 sm:text-[8px] ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
          >
            {dividerCenter || topRightLabel}
          </span>
        </div>

        <h1
          aria-label={wordmark}
          className={`page-hero-wordmark overflow-hidden whitespace-nowrap font-display italic leading-[.78] text-white drop-shadow-[0_12px_35px_rgba(0,0,0,.32)] ${
            fullHeight
              ? "text-[clamp(3.25rem,13vw,11.5rem)]"
              : "text-[clamp(2.75rem,10vw,7.5rem)]"
          }`}
        >
          {characters.map((character, index) => (
            <span
              key={`${character}-${index}`}
              aria-hidden="true"
              className={`page-hero-character ${mounted ? "is-visible" : ""}`}
              style={{ "--char-delay": `${520 + index * 58}ms` }}
            >
              {character === " " ? "\u00A0" : character}
            </span>
          ))}
        </h1>
      </div>

      {ctaLabel && (
        <a
          href={ctaHref}
          className={`page-hero-cta group absolute bottom-4 right-4 z-30 inline-flex h-11 items-center gap-3 overflow-hidden rounded-full border border-[#d8f3dc]/35 bg-[#061c15]/88 px-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_14px_35px_rgba(0,0,0,.3)] backdrop-blur-md transition-all duration-1000 delay-1000 hover:-translate-y-1 hover:bg-[#1b4332] sm:bottom-6 sm:right-8 sm:h-12 sm:px-5 sm:text-[10px] md:right-10 ${
            mounted
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-5 scale-90 opacity-0"
          }`}
        >
          <span className="relative z-10">{ctaLabel}</span>
          <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#d8f3dc] text-[#081c15] transition-transform duration-500 group-hover:rotate-45 sm:h-7 sm:w-7">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </a>
      )}
    </section>
  );
};

export default PageHero;
