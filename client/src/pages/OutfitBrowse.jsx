import { useEffect, useState } from "react";
import { getOOTD, getOutfits } from "../services/outfitService.js";
import { useFilters } from "../hooks/useFilters.js";
import PageHero from "../components/Common/PageHero.jsx";
import OutfitCard from "../components/Outfit/OutfitCard.jsx";
import OutfitFilterBar from "../components/Outfit/OutfitFilterBar.jsx";
import OOTDDocked from "../components/Outfit/OOTDDocked.jsx";

const INDIA_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const indiaDayKey = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const millisecondsUntilIndiaMidnight = () =>
  DAY_MS - ((Date.now() + INDIA_OFFSET_MS) % DAY_MS) + 1000;

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
  const [result, setResult] = useState({ key: null, outfits: [], error: false });
  const [featuredResult, setFeaturedResult] = useState({ gender: null, outfit: null });
  const queryKey = JSON.stringify({ gender, ...filters });
  const loading = result.key !== queryKey;
  const { outfits, error } = result;
  const featuredOutfit = featuredResult.gender === gender ? featuredResult.outfit : null;

  useEffect(() => {
    let cancelled = false;

    getOutfits({ gender, ...filters })
      .then((data) => {
        if (!cancelled) setResult({ key: queryKey, outfits: data.outfits || [], error: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ key: queryKey, outfits: [], error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [gender, filters, queryKey]);

  useEffect(() => {
    let cancelled = false;
    let dayKey = indiaDayKey();
    let rolloverTimer;

    const refreshFeaturedOutfit = () => {
      dayKey = indiaDayKey();
      getOOTD(gender)
        .then((data) => {
          if (!cancelled) setFeaturedResult({ gender, outfit: data.outfit || null });
        })
        .catch(() => {
          if (!cancelled) setFeaturedResult({ gender, outfit: null });
        });
      window.clearTimeout(rolloverTimer);
      rolloverTimer = window.setTimeout(refreshFeaturedOutfit, millisecondsUntilIndiaMidnight());
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible" && indiaDayKey() !== dayKey) {
        refreshFeaturedOutfit();
      }
    };

    refreshFeaturedOutfit();
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      cancelled = true;
      window.clearTimeout(rolloverTimer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [gender]);

  return (
    <div>
      <PageHero {...hero} />
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-10">
        {featuredOutfit && (
          <div className="mx-auto max-w-7xl">
            <OOTDDocked key={featuredOutfit._id} outfit={featuredOutfit} />
          </div>
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
