import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getFavourites,
  removeFavourite,
} from "../services/userService.js";
import OutfitCard from "../components/Outfit/OutfitCard.jsx";

const Favourites = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [favourites, setFavourites] = useState(null);
  const [error, setError] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [removingIds, setRemovingIds] = useState(() => new Set());
  const loading =
    authLoading || (isAuthenticated && favourites === null && !error);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let cancelled = false;

    getFavourites()
      .then((data) => {
        if (!cancelled) setFavourites(data.favourites || []);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  const handleRemove = async (outfitId) => {
    if (removingIds.has(outfitId)) return;

    setRemoveError("");
    setRemovingIds((current) => {
      const next = new Set(current);
      next.add(outfitId);
      return next;
    });

    try {
      await removeFavourite(outfitId);
      setFavourites((current) =>
        current.filter((outfit) => outfit._id !== outfitId),
      );
    } catch {
      setRemoveError("We couldn't remove that outfit. Please try again.");
    } finally {
      setRemovingIds((current) => {
        const next = new Set(current);
        next.delete(outfitId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg-subtle">
            <Heart className="h-5 w-5 animate-pulse fill-accent text-accent" />
            <span className="absolute inset-0 animate-ping rounded-full border border-accent/20" />
          </span>
          <p className="font-display text-xl italic text-text-secondary">
            Gathering your favourites...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-bg-subtle">
          <Heart className="h-6 w-6 text-accent" />
        </span>
        <div>
          <h1 className="font-display text-3xl italic text-text-primary">
            Your saved style awaits
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Log in to see your saved outfits.
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-on-accent hover:shadow-lg"
        >
          Log in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-[70vh] bg-bg-subtle">
      <style>{`
        @keyframes favouritesHeaderReveal {
          from {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes favouriteCardReveal {
          from {
            opacity: 0;
            transform: translate3d(0, 30px, 0) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        .favourites-header {
          animation: favouritesHeaderReveal 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .favourite-card {
          animation: favouriteCardReveal 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: var(--favourite-delay);
        }

        @media (prefers-reduced-motion: reduce) {
          .favourites-header,
          .favourite-card {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:px-10">
        <header className="favourites-header mx-auto mb-8 mt-15 max-w-2xl text-center sm:mb-10">
          <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-bg text-accent shadow-sm">
            <Heart className="h-5 w-5 fill-accent text-accent" />
          </span>
          <p className="mb-2 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            <span className="h-px w-7 bg-accent" />
            Your personal edit
            <span className="h-px w-7 bg-accent" />
          </p>
          <h1 className="font-display text-4xl italic text-text-primary sm:text-5xl md:text-6xl">
            Your Favourites
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">
            A collection of outfits you love, saved in one place and ready to
            inspire your next look.
          </p>
          {/* {!error && favourites.length > 0 && (
            <span className="mt-4 inline-flex rounded-full border border-border bg-bg px-3.5 py-1.5 text-[11px] font-medium text-text-muted shadow-sm">
              {favourites.length}{" "}
              {favourites.length === 1 ? "saved outfit" : "saved outfits"}
            </span>
          )} */}
        </header>

        {error && (
          <div className="mx-auto max-w-lg rounded-2xl border border-border bg-bg px-5 py-10 text-center shadow-sm">
            <p className="text-sm text-text-muted">
              Something went wrong. Please try again.
            </p>
          </div>
        )}

        {removeError && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-accent/20 bg-bg px-4 py-3 text-center text-xs text-accent-hover shadow-sm"
          >
            {removeError}
          </p>
        )}

        {!error && favourites.length === 0 && (
          <div className="favourites-header mx-auto flex max-w-lg flex-col items-center justify-center gap-5 rounded-[1.75rem] border border-border/80 bg-bg px-6 py-14 text-center shadow-[0_14px_40px_rgba(8,28,21,0.06)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg-subtle text-accent">
            </span>
            <div>
              <h2 className="font-display text-2xl italic text-text-primary sm:text-3xl">
                Your collection is waiting
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                You haven&apos;t saved any outfits yet.
              </p>
            </div>
            <Link
              to="/men"
              className="inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-2.5 text-sm font-medium text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-on-accent hover:shadow-lg"
            >
              Start browsing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!error && favourites.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {favourites.map((outfit, index) => {
              const isRemoving = removingIds.has(outfit._id);

              return (
                <article
                  key={outfit._id}
                  className={`favourite-card group/favourite relative min-w-0 transition-all duration-300 ${
                    isRemoving ? "scale-[0.98] opacity-60" : ""
                  } [&>a]:h-full [&>a]:rounded-[1.4rem] [&>a]:border-border/80 [&>a]:shadow-[0_8px_24px_rgba(8,28,21,0.06)] [&>a]:transition-all [&>a]:duration-500 hover:[&>a]:-translate-y-1.5 hover:[&>a]:border-accent/40 hover:[&>a]:shadow-[0_20px_45px_rgba(8,28,21,0.12)] [&_h3]:transition-colors [&_h3]:duration-300 hover:[&_h3]:text-accent-hover`}
                  style={{ "--favourite-delay": `${120 + index * 80}ms` }}
                >
                  <OutfitCard outfit={outfit} coverImage />
                  <button
                    type="button"
                    onClick={() => handleRemove(outfit._id)}
                    disabled={isRemoving}
                    aria-label={`Remove ${outfit.title} from favourites`}
                    title="Remove from favourites"
                    className="absolute right-2.5 top-2.5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/90 text-accent shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white active:scale-95 disabled:cursor-wait sm:right-3 sm:top-3 sm:h-11 sm:w-11"
                  >
                    <Heart
                      className={`h-4.5 w-4.5 fill-accent text-accent transition-all duration-300 sm:h-5 sm:w-5 ${
                        isRemoving ? "animate-pulse" : ""
                      }`}
                    />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Favourites;
