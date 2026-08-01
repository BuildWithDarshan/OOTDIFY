import { useEffect, useRef, useState } from "react";
import { getOutfits } from "../services/outfitService.js";
import { useFilters } from "../hooks/useFilters.js";
import PageHero from "../components/Common/PageHero.jsx";
import OutfitCard from "../components/Outfit/OutfitCard.jsx";
import OutfitFilterBar from "../components/Outfit/OutfitFilterBar.jsx";
import OOTDModal from "../components/Outfit/OOTDModal.jsx";
import OOTDDocked from "../components/Outfit/OOTDDocked.jsx";

const OutfitCardSkeleton = ({ index }) => (
  <div
    aria-hidden="true"
    className="overflow-hidden rounded-2xl border border-border/70 bg-bg shadow-[0_12px_32px_rgba(0,0,0,0.04)]"
    style={{ animationDelay: `${index * 70}ms` }}
  >
    <div className="relative aspect-[3/4] overflow-hidden bg-bg-subtle">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-transparent via-white/45 to-transparent" />
      <div className="absolute left-3 top-3 h-6 w-16 animate-pulse rounded-full bg-border/70" />
      <div className="absolute bottom-3 right-3 h-7 w-20 animate-pulse rounded-full bg-bg/80" />
    </div>

    <div className="space-y-2.5 p-3 sm:p-3.5">
      <div className="h-2.5 w-2/5 animate-pulse rounded-full bg-border/80" />
      <div className="h-4 w-4/5 animate-pulse rounded-full bg-bg-subtle" />
    </div>
  </div>
);

const OutfitGridSkeleton = ({ searching }) => (
  <div role="status" aria-live="polite" aria-label={searching ? "Searching outfits" : "Loading outfits"}>
    <span className="sr-only">
      {searching ? "Searching for matching outfits" : "Loading outfits"}
    </span>
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <OutfitCardSkeleton key={index} index={index} />
      ))}
    </div>
  </div>
);

const OutfitBrowse = ({ gender, hero }) => {
  const { filters, setFilter, clearFilters, activeCount } = useFilters();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const sentinelRef = useRef(null);
  const [modalTriggered, setModalTriggered] = useState(false);
  const [dockedOutfit, setDockedOutfit] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getOutfits({ gender, ...filters })
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
  }, [gender, filters]);

  useEffect(() => {
    if (modalTriggered) return;
    const el = sentinelRef.current;
    if (!el) return;

    let animationFrame = null;

    const checkHeroEnd = () => {
      if (animationFrame) return;

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        const heroEndPosition = el.getBoundingClientRect().top;
        const navigationOffset = 80;

        if (heroEndPosition <= navigationOffset) {
          setModalTriggered(true);
          window.removeEventListener("scroll", checkHeroEnd);
        }
      });
    };

    window.addEventListener("scroll", checkHeroEnd, { passive: true });
    checkHeroEnd();

    return () => {
      window.removeEventListener("scroll", checkHeroEnd);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [modalTriggered]);

  return (
    <div>
      <PageHero {...hero} />
      <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />

      <OOTDModal gender={gender} active={modalTriggered} onSettle={setDockedOutfit} />

      <div className="px-4 sm:px-6 md:px-10 py-8 sm:py-10 max-w-6xl mx-auto">
        {dockedOutfit && (
          <OOTDDocked key={dockedOutfit._id} outfit={dockedOutfit} />
        )}

        <OutfitFilterBar filters={filters} setFilter={setFilter} clearFilters={clearFilters} activeCount={activeCount} />

        {loading && <OutfitGridSkeleton searching={Boolean(filters.search)} />}

        {!loading && error && (
          <p className="text-center text-sm text-text-muted py-16">Something went wrong. Please try again.</p>
        )}

        {!loading && !error && outfits.length === 0 && (
          <p className="text-center text-sm text-text-muted py-16">
            No outfits match these filters yet — try adjusting them.
          </p>
        )}

        {!loading && !error && outfits.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {outfits.map((outfit) => (
              <OutfitCard key={outfit._id} outfit={outfit} coverImage />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitBrowse;
