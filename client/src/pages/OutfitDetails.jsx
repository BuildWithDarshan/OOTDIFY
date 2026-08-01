import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { getOutfitById } from "../services/outfitService.js";
import {
  getFavourites,
  addFavourite,
  removeFavourite,
} from "../services/userService.js";
import { useAuth } from "../context/AuthContext.jsx";
import ItemCard from "../components/Item/ItemCard.jsx";
import PageMeta from "../components/Common/PageMeta.jsx";

const OutfitDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [outfit, setOutfit] = useState(null);
  const [notFoundId, setNotFoundId] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const loading = outfit?._id !== id && notFoundId !== id;
  const notFound = notFoundId === id;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getOutfitById(id);
        if (!cancelled) setOutfit(data.outfit);
      } catch {
        if (!cancelled) setNotFoundId(id);
      }
    };

    load();
    window.scrollTo({ top: 0, behavior: "instant" });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    getFavourites()
      .then((data) => {
        if (cancelled) return;
        const ids = (data.favourites || []).map((favourite) =>
          typeof favourite === "string" ? favourite : favourite._id,
        );
        setIsFavourite(ids.includes(id));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated]);

  const toggleFavourite = async () => {
    if (!isAuthenticated || favBusy) return;
    setFavBusy(true);

    try {
      if (isFavourite) {
        await removeFavourite(id);
        setIsFavourite(false);
      } else {
        await addFavourite(id);
        setIsFavourite(true);
      }
    } catch {
      // Keep the current UI state if the request fails.
    } finally {
      setFavBusy(false);
    }
  };

  if (loading) {
    return (
      <>
      <PageMeta
        title="Outfit Details | OOTDIFY"
        description="Explore this curated outfit and discover every item used to build the complete look."
      />
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg-subtle">
            <span className="absolute inset-0 animate-ping rounded-full border border-accent/25" />
          </span>
          <p className="font-display italic text-xl text-text-secondary">
            Curating your look...
          </p>
        </div>
      </div>
      </>
    );
  }

  if (notFound || !outfit) {
    return (
      <>
      <PageMeta
        title="Outfit Not Found | OOTDIFY"
        description="The requested OOTDIFY outfit could not be found."
        noIndex
      />
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-subtle text-accent">
          <ShoppingBag className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display italic text-3xl text-text-primary">
            This look is unavailable
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            It may have been moved or is no longer part of the collection.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      </>
    );
  }

  return (
    <main className="relative isolate overflow-clip">
      <PageMeta
        title={`${outfit.title} | OOTDIFY`}
        description={outfit.description || `Explore ${outfit.title} and shop every item used to create this curated OOTDIFY look.`}
        image={outfit.coverImage?.url || outfit.coverImage}
      />
      <div className="pointer-events-none absolute -left-32 top-52 -z-10 hidden h-72 w-72 rounded-full bg-accent-subtle/35 blur-3xl sm:block" />
      <div className="pointer-events-none absolute -right-40 top-[38rem] -z-10 hidden h-96 w-96 rounded-full bg-bg-subtle blur-3xl sm:block" />

      <div className="relative z-10 mx-auto mt-15 max-w-7xl px-4 py-6 sm:px-6 sm:py-10 md:px-10">
        <Link
  to={outfit.gender === "women" ? "/women" : "/men"}
  className="group mb-6 hidden items-center gap-2 rounded-full border border-transparent px-1 py-2 text-xs font-medium text-text-secondary transition-all duration-300 hover:gap-2.5 hover:text-accent-hover md:inline-flex sm:text-sm"
>
  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg transition-all duration-300 group-hover:border-accent group-hover:bg-bg-subtle">
    <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
  </span>

  Back to {outfit.gender === "women" ? "Women" : "Men"}
</Link>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14 xl:gap-20">
          <section className="lg:sticky lg:top-24 lg:self-start">
            <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] border border-border/70 bg-bg-subtle shadow-[0_24px_70px_rgba(8,28,21,0.12)]">
              <img
                src={outfit.coverImage?.url || outfit.coverImage}
                alt={outfit.title}
                className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-[1.025] sm:p-4"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/30 bg-white/85 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-primary shadow-sm backdrop-blur-md sm:bottom-6 sm:left-6">
                Curated Look
              </div>
              <button
                type="button"
                onClick={toggleFavourite}
                disabled={!isAuthenticated || favBusy}
                aria-label={
                  isFavourite ? "Remove from favourites" : "Add to favourites"
                }
                title={
                  isAuthenticated
                    ? isFavourite
                      ? "Remove from favourites"
                      : "Add to favourites"
                    : "Log in to save this outfit"
                }
                className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/85 text-text-primary shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:right-5 sm:top-5"
              >
                <Heart
                  className={`h-5 w-5 transition-all duration-300 ${
                    isFavourite
                      ? "scale-110 fill-accent text-accent"
                      : "text-text-primary"
                  } ${favBusy ? "animate-pulse" : ""}`}
                />
              </button>
            </div>
            <p className="mt-4 hidden items-center justify-center gap-2 text-[11px] uppercase tracking-[0.14em] text-text-muted lg:flex">
              <span className="h-px w-6 bg-border-strong" />
              Scroll to explore the complete look
              <span className="h-px w-6 bg-border-strong" />
            </p>
          </section>

          <section className="min-w-0 lg:pt-3">
            <div className="border-b border-border/70 pb-7">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-hover sm:text-sm">
                
                {outfit.occasion?.name} · {outfit.outfitType?.name}
              </p>
              <h1 className="font-display text-4xl italic leading-[0.98] text-text-primary sm:text-5xl md:text-6xl">
                {outfit.title}
              </h1>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-border-strong/70 bg-bg px-3.5 py-1.5 text-[11px] font-medium capitalize text-text-secondary">
                  {outfit.gender}
                </span>
                <span className="rounded-full border border-border-strong/70 bg-bg px-3.5 py-1.5 text-[11px] font-medium capitalize text-text-secondary">
                  {outfit.season}
                </span>
                {outfit.isTrending && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-subtle/70 px-3.5 py-1.5 text-[11px] font-semibold text-accent-hover">
                    Trending
                  </span>
                )}
              </div>

              {outfit.description && (
                <p className="mt-5 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                  {outfit.description}
                </p>
              )}

              <div className="mt-6 flex items-end justify-between gap-4 rounded-2xl border border-border/70 bg-bg-subtle/55 px-4 py-3.5 sm:px-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted">
                    Complete look
                  </p>
                  <p className="mt-0.5 font-display text-2xl italic text-text-primary sm:text-3xl">
                    ₹{outfit.totalPrice?.toLocaleString("en-IN")}
                  </p>
                </div>
                <span className="text-xs text-text-muted">
                  {outfit.items?.length || 0}{" "}
                  {outfit.items?.length === 1 ? "item" : "items"}
                </span>
              </div>

              {!isAuthenticated && (
                <p className="mt-4 text-xs text-text-muted">
                  <Link
                    to="/login"
                    className="font-semibold text-accent-hover underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
                  >
                    Log in
                  </Link>{" "}
                  to save this outfit to your favourites.
                </p>
              )}
            </div>

            <div className="pt-8">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                    The edit
                  </p>
                  <h2 className="mt-1 font-display text-3xl italic text-text-primary sm:text-4xl">
                    Shop this look
                  </h2>
                </div>
                <ShoppingBag className="mb-1 h-5 w-5 text-text-muted" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {outfit.items?.map((item) => (
                  <div
                    key={item._id}
                    className="group/item min-w-0 [&>div]:h-full [&>div]:rounded-[1.4rem] [&>div]:border-border/80 [&>div]:shadow-[0_8px_24px_rgba(8,28,21,0.06)] [&>div]:transition-all [&>div]:duration-500 hover:[&>div]:-translate-y-1 hover:[&>div]:border-accent/40 hover:[&>div]:shadow-[0_18px_40px_rgba(8,28,21,0.11)] [&>div>div:first-child]:aspect-[4/5] [&>div>div:first-child]:overflow-hidden [&>div>div:first-child]:bg-bg-subtle/55 [&_img]:!object-contain [&_img]:p-3 [&_img]:transition-transform [&_img]:duration-500 sm:[&_img]:p-5 hover:[&_img]:scale-[1.035] [&_a]:transition-all [&_a]:duration-300 hover:[&_a]:shadow-md"
                  >
                    <ItemCard item={item} outfitId={outfit._id} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default OutfitDetails;
