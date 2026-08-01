import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { getOOTD } from "../../services/outfitService.js";

const AUTO_DISMISS_MS = 6000;
const CLOSE_ANIMATION_MS = 600;

const OOTDModal = ({ gender, active, onSettle }) => {
  const [outfit, setOutfit] = useState(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [paused, setPaused] = useState(false);
  const settleTimerRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    getOOTD(gender)
      .then((data) => {
        if (!cancelled && data.outfit) {
          setOutfit(data.outfit);
          setClosing(false);
          setVisible(true);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [active, gender]);

  useEffect(
    () => () => {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  const handleClose = useCallback(() => {
    if (closing || !outfit) return;

    setClosing(true);
    settleTimerRef.current = setTimeout(() => {
      setVisible(false);
      onSettle?.(outfit);
    }, CLOSE_ANIMATION_MS);
  }, [closing, outfit, onSettle]);

  useEffect(() => {
    if (!visible || closing || paused) return;

    const timer = setTimeout(handleClose, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, closing, paused, handleClose]);

  if (!visible || !outfit) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-3 transition-opacity duration-500 sm:p-6 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ootd-modal-title"
    >
      <button
        type="button"
        aria-label="Close OOTD"
        className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-sm"
        onClick={handleClose}
      />

      <article
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className={`relative max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-3xl bg-bg shadow-[0_32px_90px_rgba(0,0,0,0.35)] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] sm:overflow-hidden ${
          closing
            ? "-translate-y-[30vh] scale-[0.76] opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
        style={{
          animation: closing
            ? undefined
            : "ootd-modal-in 550ms cubic-bezier(0.34,1.4,0.64,1)",
        }}
      >
        <div className="absolute inset-x-0 top-0 z-30 h-1 bg-border">
          <div
            className="h-full bg-accent"
            style={{
              animation: `ootd-modal-progress ${AUTO_DISMISS_MS}ms linear forwards`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg/90 text-text-primary shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-accent hover:text-accent-hover sm:right-4 sm:top-4"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <div className="relative flex h-[40dvh] min-h-60 max-h-80 w-full shrink-0 items-center justify-center overflow-hidden bg-[var(--color-bg-subtle)] sm:h-auto sm:max-h-none sm:min-h-[28rem] sm:w-[48%]">
            <img
              src={outfit.coverImage?.url || outfit.coverImage}
              alt={outfit.title}
              className="h-full w-full object-contain p-4 sm:p-6"
              style={{
                animation: closing
                  ? undefined
                  : "ootd-modal-image-in 700ms cubic-bezier(0.16,1,0.3,1) both",
              }}
            />
          </div>

          <div className="flex w-full flex-col justify-center bg-bg p-5 sm:w-[52%] sm:p-8 md:p-10">
            <span
              className="mb-4 inline-flex w-fit items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-hover sm:text-xs"
              style={{
                animation: closing
                  ? undefined
                  : "ootd-modal-fade-up 500ms ease-out 150ms both",
              }}
            >
              Today&apos;s OOTD
            </span>

            <h2
              id="ootd-modal-title"
              className="mb-3 font-display text-2xl italic leading-tight text-text-primary sm:text-3xl md:text-4xl"
              style={{
                animation: closing
                  ? undefined
                  : "ootd-modal-fade-up 500ms ease-out 250ms both",
              }}
            >
              {outfit.title}
            </h2>

            <p
              className="mb-6 text-base font-semibold text-text-secondary sm:text-lg"
              style={{
                animation: closing
                  ? undefined
                  : "ootd-modal-fade-up 500ms ease-out 350ms both",
              }}
            >
              ₹{outfit.totalPrice?.toLocaleString("en-IN")}
            </p>

            <Link
              to={`/outfit/${outfit._id}`}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-on-accent hover:shadow-lg"
              style={{
                animation: closing
                  ? undefined
                  : "ootd-modal-fade-up 500ms ease-out 450ms both",
              }}
            >
              View this look
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <style>{`
        @keyframes ootd-modal-in {
          from {
            transform: translateY(24px) scale(0.94);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes ootd-modal-image-in {
          from {
            transform: translateX(-28px) scale(0.96);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes ootd-modal-fade-up {
          from {
            transform: translateY(14px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes ootd-modal-progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          [style*="ootd-modal"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OOTDModal;
