import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Bookmark,
    BookmarkCheck,
    Heart,
    MessageCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import PageMeta from "../components/Common/PageMeta.jsx";
import { getSavedCommunityOutfits, toggleCommunitySave } from "../services/communityInteractionService.js";

const PAGE_SIZE = 20;

const SavedOutfitCard = ({ outfit, onRemove, removing }) => (
    <article className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-border/70 bg-bg shadow-[0_8px_28px_rgba(8,28,21,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(8,28,21,0.11)] sm:mb-4">
        <Link
            to={`/community/${outfit._id}`}
            className="block"
            aria-label={`View ${outfit.title}`}
        >
            <div className="overflow-hidden bg-bg-subtle">
                <img
                    src={outfit.image?.url}
                    alt={outfit.title}
                    loading="lazy"
                    className="block h-auto w-full transition duration-500 group-hover:scale-[1.025]"
                />
            </div>
        </Link>

        <button
            type="button"
            onClick={() => onRemove(outfit._id)}
            disabled={removing}
            aria-label={`Remove ${outfit.title} from saved outfits`}
            title="Remove from saved outfits"
            className="absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-accent-hover shadow-md backdrop-blur transition hover:scale-105 hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:right-3 sm:top-3 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
            {removing ? (
                <Bookmark
                    aria-hidden="true"
                    className="h-4 w-4 animate-pulse"
                />
            ) : (
                <BookmarkCheck aria-hidden="true" className="h-4 w-4" />
            )}
        </button>

        <div className="p-3 sm:p-3.5">
            <Link to={`/community/${outfit._id}`} className="block">
                <h2 className="line-clamp-2 font-display text-lg leading-tight text-text-primary sm:text-xl">
                    {outfit.title}
                </h2>
            </Link>
            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border/70 pt-2.5 text-[11px] text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                    <Heart aria-hidden="true" className="h-3.5 w-3.5" />
                    {outfit.likeCount ?? 0}
                    <MessageCircle
                        aria-hidden="true"
                        className="ml-1 h-3.5 w-3.5"
                    />
                    {outfit.commentCount ?? 0}
                </span>
                {outfit.user?._id ? (
                    <Link
                        to={`/community/creator/${outfit.user._id}`}
                        className="max-w-[55%] truncate text-right text-text-secondary transition hover:text-accent-hover"
                    >
                        By {outfit.user.name || "Community member"}
                    </Link>
                ) : (
                    <span className="max-w-[55%] truncate text-right text-text-secondary">
                        By {outfit.user?.name || "Community member"}
                    </span>
                )}
            </div>
        </div>
    </article>
);

const SavedOutfitSkeleton = () => (
    <div
        aria-hidden="true"
        className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border/70 bg-bg"
    >
        <div className="aspect-[4/5] animate-pulse bg-bg-subtle" />
        <div className="space-y-3 p-3.5">
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-bg-subtle" />
            <div className="h-3 w-2/5 animate-pulse rounded-full bg-bg-subtle" />
        </div>
    </div>
);

const CommunitySavedOutfits = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [outfits, setOutfits] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [moreError, setMoreError] = useState("");
    const [removingIds, setRemovingIds] = useState(() => new Set());
    const [removeError, setRemoveError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const sentinelRef = useRef(null);
    const requestIdRef = useRef(0);
    const loadingMoreRef = useRef(false);

    useEffect(() => {
        if (authLoading) return undefined;

        if (!isAuthenticated) {
            return undefined;
        }

        const requestId = ++requestIdRef.current;
        let cancelled = false;
        Promise.resolve().then(() => {
            if (cancelled) return;
            setOutfits([]);
            setPage(1);
            setHasMore(false);
            setLoading(true);
            setLoadingMore(false);
            setError("");
            setMoreError("");
            loadingMoreRef.current = false;
        });

        getSavedCommunityOutfits({ page: 1, limit: PAGE_SIZE })
            .then((data) => {
                if (cancelled || requestId !== requestIdRef.current) return;
                setOutfits(data.outfits || []);
                setHasMore(Boolean(data.pagination?.hasMore));
            })
            .catch((requestError) => {
                if (cancelled || requestId !== requestIdRef.current) return;
                setError(
                    requestError.response?.data?.message ||
                        "Your saved community outfits could not be loaded. Please try again.",
                );
            })
            .finally(() => {
                if (!cancelled && requestId === requestIdRef.current) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [authLoading, isAuthenticated, refreshKey]);

    const loadMore = useCallback(
        async (retry = false) => {
            if (
                loading ||
                loadingMoreRef.current ||
                !hasMore ||
                (moreError && !retry)
            ) {
                return;
            }

            const requestId = requestIdRef.current;
            const nextPage = page + 1;
            loadingMoreRef.current = true;
            setLoadingMore(true);
            setMoreError("");

            try {
                const data = await getSavedCommunityOutfits({
                    page: nextPage,
                    limit: PAGE_SIZE,
                });
                if (requestId !== requestIdRef.current) return;

                setOutfits((current) => {
                    const knownIds = new Set(current.map((outfit) => outfit._id));
                    return [
                        ...current,
                        ...(data.outfits || []).filter(
                            (outfit) => !knownIds.has(outfit._id),
                        ),
                    ];
                });
                setPage(nextPage);
                setHasMore(Boolean(data.pagination?.hasMore));
            } catch (requestError) {
                if (requestId === requestIdRef.current) {
                    setMoreError(
                        requestError.response?.data?.message ||
                            "More saved outfits could not be loaded.",
                    );
                }
            } finally {
                if (requestId === requestIdRef.current) {
                    loadingMoreRef.current = false;
                    setLoadingMore(false);
                }
            }
        },
        [hasMore, loading, moreError, page],
    );

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore || loading || error || moreError) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    loadMore();
                }
            },
            { rootMargin: "500px 0px" },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [error, hasMore, loadMore, loading, moreError]);

    const handleRemove = async (outfitId) => {
        if (removingIds.has(outfitId)) return;
        setRemoveError("");
        setRemovingIds((current) => new Set(current).add(outfitId));

        try {
            await toggleCommunitySave(outfitId);
            setOutfits((current) =>
                current.filter((outfit) => outfit._id !== outfitId),
            );
        } catch (requestError) {
            setRemoveError(
                requestError.response?.data?.message ||
                    "That outfit could not be removed from your saved list.",
            );
        } finally {
            setRemovingIds((current) => {
                const next = new Set(current);
                next.delete(outfitId);
                return next;
            });
        }
    };

    if (authLoading || (isAuthenticated && loading && outfits.length === 0)) {
        return (
            <main className="min-h-[70vh] bg-bg-subtle/55">
                <section className="mx-auto max-w-screen-2xl px-3 py-8 sm:px-5 sm:py-10 lg:px-7">
                    <div
                        role="status"
                        aria-label="Loading saved community outfits"
                        className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-5"
                    >
                        {Array.from({ length: 8 }, (_, index) => (
                            <SavedOutfitSkeleton key={index} />
                        ))}
                    </div>
                </section>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-bg-subtle/55 px-4 text-center">
                <PageMeta
                    title="Saved Community Outfits | OOTDIFY"
                    description="View your saved community outfit inspiration."
                    noIndex
                />
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-bg">
                    <Bookmark className="h-6 w-6 text-accent" />
                </span>
                <div>
                    <h1 className="font-display text-3xl italic text-text-primary">
                        Your saved looks await
                    </h1>
                    <p className="mt-2 text-sm text-text-secondary">
                        Log in to revisit the community outfits you saved.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-bg transition hover:-translate-y-0.5 hover:bg-accent hover:text-on-accent hover:shadow-lg"
                >
                    Log in
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-bg-subtle/55 pb-16">
            <PageMeta
                title="Saved Community Outfits | OOTDIFY"
                description="View your saved community outfit inspiration."
                noIndex
            />
            <section className="mx-auto w-full max-w-screen-2xl px-3 pt-8 sm:px-5 sm:pt-10 lg:px-7">
                <header className="mb-8 rounded-[1.75rem] border border-border/80 bg-bg p-6 text-center shadow-[0_18px_55px_rgba(8,28,21,0.08)] sm:mb-10 sm:p-8">
                    <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent/20 bg-bg-subtle text-accent">
                        <BookmarkCheck
                            aria-hidden="true"
                            className="h-5 w-5"
                        />
                    </span>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                        Your community collection
                    </p>
                    <h1 className="mt-1 font-display text-4xl italic text-text-primary sm:text-5xl">
                        Saved Outfits
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary">
                        Community looks you bookmarked, gathered in one place for
                        your next dose of outfit inspiration.
                    </p>
                    <Link
                        to="/community"
                        className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-bg-subtle px-4 py-2.5 text-xs font-medium text-text-secondary transition hover:border-accent hover:text-accent-hover"
                    >
                        Discover more outfits
                        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                </header>

                {error && (
                    <div
                        role="alert"
                        className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-bg px-5 py-10 text-center shadow-sm"
                    >
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            type="button"
                            onClick={() => setRefreshKey((key) => key + 1)}
                            className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {removeError && (
                    <p
                        role="alert"
                        className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {removeError}
                    </p>
                )}

                {!loading && !error && outfits.length === 0 && (
                    <div className="rounded-[1.75rem] border border-dashed border-border-strong bg-bg px-6 py-16 text-center">
                        <Bookmark
                            aria-hidden="true"
                            className="mx-auto h-8 w-8 text-accent"
                        />
                        <h2 className="mt-4 font-display text-3xl text-text-primary">
                            No saved community outfits yet
                        </h2>
                        <p className="mt-2 text-sm text-text-secondary">
                            Tap the bookmark on a community outfit to keep it here.
                        </p>
                        <Link
                            to="/community"
                            className="mt-5 inline-flex rounded-full bg-text-primary px-5 py-2.5 text-sm font-medium text-bg transition hover:bg-accent hover:text-on-accent"
                        >
                            Explore Discover
                        </Link>
                    </div>
                )}

                {outfits.length > 0 && (
                    <div
                        aria-label="Your saved community outfits"
                        className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-5 lg:gap-4"
                    >
                        {outfits.map((outfit) => (
                            <SavedOutfitCard
                                key={outfit._id}
                                outfit={outfit}
                                onRemove={handleRemove}
                                removing={removingIds.has(outfit._id)}
                            />
                        ))}
                    </div>
                )}

                <div ref={sentinelRef} aria-hidden="true" className="h-1" />
                {loadingMore && (
                    <p role="status" className="py-5 text-center text-xs text-text-muted">
                        Loading more saved outfits…
                    </p>
                )}
                {moreError && (
                    <div className="py-5 text-center">
                        <p role="alert" className="text-sm text-red-700">
                            {moreError}
                        </p>
                        <button
                            type="button"
                            onClick={() => loadMore(true)}
                            className="mt-2 text-sm font-medium text-accent-hover underline underline-offset-4"
                        >
                            Try loading again
                        </button>
                    </div>
                )}
                {!hasMore && outfits.length > 0 && !loading && (
                    <p className="py-6 text-center text-xs text-text-muted">
                        You&apos;ve reached the end of your saved outfits.
                    </p>
                )}
            </section>
        </main>
    );
};

export default CommunitySavedOutfits;
