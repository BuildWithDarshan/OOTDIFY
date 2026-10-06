import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    AlertTriangle,
    Camera,
    LoaderCircle,
    LockKeyhole,
    Pencil,
    Shirt,
    Trash2,
    Bookmark,
    BookmarkCheck,
} from "lucide-react";
import PageMeta from "../components/Common/PageMeta.jsx";
import {
    deleteCommunityOutfit,
    getCommunityCreatorProfile,
} from "../services/communityOutfitService.js";
import {
    attachCommunityInteractionStates,
    getSavedCommunityOutfits,
    toggleCommunitySave,
} from "../services/communityInteractionService.js";
import { uploadProfilePicture } from "../services/userService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { optimizeImageForUpload } from "../utils/imageProcessing.js";

const PAGE_SIZE = 20;

const formatMemberSince = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
    }).format(date);
};

const formatCount = (value) => new Intl.NumberFormat().format(value || 0);

const OutfitCard = ({
    outfit,
    isOwnProfile,
    onEdit,
    onDelete,
    onUnsave,
    removing,
}) => (
    <article className="group relative mb-3 cursor-pointer break-inside-avoid overflow-hidden rounded-2xl border border-border/70 bg-bg shadow-[0_8px_28px_rgba(8,28,21,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(8,28,21,0.11)] sm:mb-4">
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
        {outfit.visibility === "private" && (
            <span
                aria-label="Private outfit"
                title="Private outfit"
                className="absolute bottom-2.5 left-2.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-text-primary shadow-md backdrop-blur sm:bottom-3 sm:left-3"
            >
                <LockKeyhole aria-hidden="true" className="h-4 w-4" />
            </span>
        )}
        {isOwnProfile && (
            <>
            {onEdit && (
                <Link
                    to={`/community/${outfit._id}/edit`}
                    aria-label={`Edit ${outfit.title}`}
                    title="Edit your outfit"
                    className="absolute left-2.5 top-2.5 z-10 hidden h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-text-primary shadow-md backdrop-blur transition hover:scale-105 hover:bg-white hover:text-accent-hover sm:left-3 sm:top-3 sm:flex sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                </Link>
            )}
            <button
                type="button"
                onClick={() =>
                    onDelete
                        ? onDelete(outfit)
                        : onUnsave(outfit._id)
                }
                disabled={removing}
                aria-label={
                    onDelete
                        ? `Delete ${outfit.title}`
                        : `Remove ${outfit.title} from saved outfits`
                }
                title={
                    onDelete
                        ? "Delete your outfit"
                        : "Remove from saved outfits"
                }
                className="absolute right-2.5 top-2.5 z-10 hidden h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-text-primary shadow-md backdrop-blur transition hover:scale-105 hover:bg-white hover:text-red-700 disabled:cursor-wait disabled:opacity-60 sm:right-3 sm:top-3 sm:flex sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
                {onDelete ? (
                    <Trash2
                        aria-hidden="true"
                        className="h-4 w-4"
                    />
                ) : (
                    <BookmarkCheck
                        aria-hidden="true"
                        className="h-4 w-4"
                    />
                )}
            </button>
            </>
        )}
    </article>
);

const OutfitSkeleton = () => (
    <div
        aria-hidden="true"
        className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border/70 bg-bg"
    >
        <div className="aspect-[4/5] animate-pulse bg-bg-subtle" />
    </div>
);

const CommunityCreatorProfile = () => {
    const { userId } = useParams();
    const { user, isAuthenticated, updateUserInfo } = useAuth();
    const isOwnProfile = Boolean(user?.id && user.id === userId);
    const [creator, setCreator] = useState(null);
    const [stats, setStats] = useState({ outfitCount: 0, likeCount: 0 });
    const [outfits, setOutfits] = useState([]);
    const [savedOutfits, setSavedOutfits] = useState([]);
    const [savedLoaded, setSavedLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState("created");
    const [page, setPage] = useState(1);
    const [savedPage, setSavedPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [savedHasMore, setSavedHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [savedLoading, setSavedLoading] = useState(false);
    const [savedLoadingMore, setSavedLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [moreError, setMoreError] = useState("");
    const [savedError, setSavedError] = useState("");
    const [savedMoreError, setSavedMoreError] = useState("");
    const [actionError, setActionError] = useState("");
    const [outfitPendingDelete, setOutfitPendingDelete] = useState(null);
    const [removingIds, setRemovingIds] = useState(() => new Set());
    const [notFound, setNotFound] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [picturePreview, setPicturePreview] = useState("");
    const [pictureUploading, setPictureUploading] = useState(false);
    const [pictureError, setPictureError] = useState("");
    const pictureInputRef = useRef(null);
    const sentinelRef = useRef(null);
    const requestIdRef = useRef(0);
    const loadingMoreRef = useRef(false);
    const savedRequestIdRef = useRef(0);
    const savedLoadingMoreRef = useRef(false);

    useEffect(() => {
        const requestId = ++requestIdRef.current;
        let cancelled = false;

        Promise.resolve().then(() => {
            if (cancelled) return;
            setCreator(null);
            setStats({ outfitCount: 0, likeCount: 0 });
            setOutfits([]);
            setSavedOutfits([]);
            setSavedLoaded(false);
            setActiveTab("created");
            setPage(1);
            setHasMore(false);
            setLoading(true);
            setLoadingMore(false);
            setLoadError("");
            setMoreError("");
            setSavedError("");
            setSavedMoreError("");
            setNotFound(false);
            loadingMoreRef.current = false;
            savedLoadingMoreRef.current = false;
        });

        getCommunityCreatorProfile(userId, { page: 1, limit: PAGE_SIZE })
            .then(async (data) => {
                if (cancelled || requestId !== requestIdRef.current) return;
                const creatorOutfits = isAuthenticated
                    ? await attachCommunityInteractionStates(data.outfits || [])
                    : data.outfits || [];
                if (cancelled || requestId !== requestIdRef.current) return;
                setCreator(data.creator);
                setStats(data.stats || { outfitCount: 0, likeCount: 0 });
                setOutfits(creatorOutfits);
                setHasMore(Boolean(data.pagination?.hasMore));
            })
            .catch((error) => {
                if (cancelled || requestId !== requestIdRef.current) return;
                if (error.response?.status === 404) {
                    setNotFound(true);
                    return;
                }
                setLoadError(
                    error.response?.data?.message ||
                        "This creator profile could not be loaded. Please try again.",
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
    }, [isAuthenticated, refreshKey, userId]);

    useEffect(() => {
        if (!isOwnProfile || activeTab !== "saved" || savedLoaded) {
            return undefined;
        }

        const requestId = ++savedRequestIdRef.current;
        let cancelled = false;
        Promise.resolve().then(() => {
            if (cancelled) return;
            setSavedLoading(true);
            setSavedError("");
            setSavedMoreError("");
        });

        getSavedCommunityOutfits({ page: 1, limit: PAGE_SIZE })
            .then(async (data) => {
                if (cancelled || requestId !== savedRequestIdRef.current) return;
                const saved = await attachCommunityInteractionStates(data.outfits || []);
                if (cancelled || requestId !== savedRequestIdRef.current) return;
                setSavedOutfits(saved);
                setSavedPage(1);
                setSavedHasMore(Boolean(data.pagination?.hasMore));
                setSavedLoaded(true);
            })
            .catch((error) => {
                if (cancelled || requestId !== savedRequestIdRef.current) return;
                setSavedError(
                    error.response?.data?.message ||
                        "Your saved outfits could not be loaded. Please try again.",
                );
                setSavedLoaded(true);
            })
            .finally(() => {
                if (!cancelled && requestId === savedRequestIdRef.current) {
                    setSavedLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [activeTab, isOwnProfile, savedLoaded]);

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
                const data = await getCommunityCreatorProfile(userId, {
                    page: nextPage,
                    limit: PAGE_SIZE,
                });
                if (requestId !== requestIdRef.current) return;
                const creatorOutfits = isAuthenticated
                    ? await attachCommunityInteractionStates(data.outfits || [])
                    : data.outfits || [];
                if (requestId !== requestIdRef.current) return;

                setOutfits((current) => {
                    const knownIds = new Set(current.map((outfit) => outfit._id));
                    return [
                        ...current,
                        ...creatorOutfits.filter(
                            (outfit) => !knownIds.has(outfit._id),
                        ),
                    ];
                });
                setPage(nextPage);
                setHasMore(Boolean(data.pagination?.hasMore));
            } catch (error) {
                if (requestId === requestIdRef.current) {
                    setMoreError(
                        error.response?.data?.message ||
                            "More outfits could not be loaded.",
                    );
                }
            } finally {
                if (requestId === requestIdRef.current) {
                    loadingMoreRef.current = false;
                    setLoadingMore(false);
                }
            }
        },
        [hasMore, isAuthenticated, loading, moreError, page, userId],
    );

    const loadMoreSaved = useCallback(
        async (retry = false) => {
            if (
                !isOwnProfile ||
                savedLoadingMoreRef.current ||
                !savedHasMore ||
                (savedMoreError && !retry)
            ) {
                return;
            }

            const requestId = savedRequestIdRef.current;
            const nextPage = savedPage + 1;
            savedLoadingMoreRef.current = true;
            setSavedLoadingMore(true);
            setSavedMoreError("");
            try {
                const data = await getSavedCommunityOutfits({
                    page: nextPage,
                    limit: PAGE_SIZE,
                });
                if (requestId !== savedRequestIdRef.current) return;
                const saved = await attachCommunityInteractionStates(data.outfits || []);
                if (requestId !== savedRequestIdRef.current) return;
                setSavedOutfits((current) => {
                    const knownIds = new Set(current.map((outfit) => outfit._id));
                    return [
                        ...current,
                        ...saved.filter(
                            (outfit) => !knownIds.has(outfit._id),
                        ),
                    ];
                });
                setSavedPage(nextPage);
                setSavedHasMore(Boolean(data.pagination?.hasMore));
            } catch (error) {
                if (requestId === savedRequestIdRef.current) {
                    setSavedMoreError(
                        error.response?.data?.message ||
                            "More saved outfits could not be loaded.",
                    );
                }
            } finally {
                if (requestId === savedRequestIdRef.current) {
                    savedLoadingMoreRef.current = false;
                    setSavedLoadingMore(false);
                }
            }
        },
        [isOwnProfile, savedHasMore, savedMoreError, savedPage],
    );

    useEffect(() => {
        const sentinel = sentinelRef.current;
        const tabHasMore = activeTab === "created" ? hasMore : savedHasMore;
        const tabLoading =
            activeTab === "created" ? loading : savedLoading;
        const tabError =
            activeTab === "created" ? loadError || moreError : savedError || savedMoreError;
        if (
            !sentinel ||
            !tabHasMore ||
            tabLoading ||
            tabError ||
            loadingMore ||
            savedLoadingMore ||
            !isOwnProfile && activeTab === "saved"
        ) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    if (activeTab === "created") {
                        loadMore();
                    } else {
                        loadMoreSaved();
                    }
                }
            },
            { rootMargin: "500px 0px" },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [
        activeTab,
        hasMore,
        isOwnProfile,
        loadError,
        loadMore,
        loading,
        loadingMore,
        loadMoreSaved,
        moreError,
        savedError,
        savedHasMore,
        savedLoading,
        savedLoadingMore,
        savedMoreError,
    ]);

    const name = creator?.name || "Community member";
    const memberSince = formatMemberSince(creator?.createdAt);

    useEffect(
        () => () => {
            if (picturePreview) URL.revokeObjectURL(picturePreview);
        },
        [picturePreview],
    );

    const handlePictureChange = async (event) => {
        const image = event.target.files?.[0];
        event.target.value = "";
        if (!image) return;

        setPictureError("");
        if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
            setPictureError("Choose a JPG, PNG, or WEBP image.");
            return;
        }
        if (image.size > 8 * 1024 * 1024) {
            setPictureError("Choose a profile picture that is 8 MB or smaller.");
            return;
        }

        setPictureUploading(true);
        let previewUrl = "";

        try {
            const optimizedImage = await optimizeImageForUpload(image);
            previewUrl = URL.createObjectURL(optimizedImage);
            setPicturePreview(previewUrl);
            const data = await uploadProfilePicture(optimizedImage);
            setCreator((current) =>
                current ? { ...current, profilePicture: data.user.profilePicture } : current,
            );
            updateUserInfo({ profilePicture: data.user.profilePicture });
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPicturePreview("");
        } catch (error) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPicturePreview("");
            setPictureError(
                error.response?.data?.message ||
                    "The profile picture could not be uploaded. Please try again.",
            );
        } finally {
            setPictureUploading(false);
        }
    };

    const handleDeleteCreatedOutfit = (outfit) => {
        if (!isOwnProfile || removingIds.has(outfit._id)) return;
        setActionError("");
        setOutfitPendingDelete(outfit);
    };

    const confirmDeleteCreatedOutfit = async () => {
        const outfit = outfitPendingDelete;
        if (!isOwnProfile || !outfit || removingIds.has(outfit._id)) return;

        setActionError("");
        setRemovingIds((current) => new Set(current).add(outfit._id));
        try {
            await deleteCommunityOutfit(outfit._id);
            setOutfits((current) =>
                current.filter((item) => item._id !== outfit._id),
            );
            setSavedOutfits((current) =>
                current.filter((item) => item._id !== outfit._id),
            );
            setStats((current) => ({
                ...current,
                outfitCount: Math.max(0, current.outfitCount - 1),
                likeCount: Math.max(0, current.likeCount - (outfit.likeCount || 0)),
            }));
            setOutfitPendingDelete(null);
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                    "Your outfit could not be deleted. Please try again.",
            );
        } finally {
            setRemovingIds((current) => {
                const next = new Set(current);
                next.delete(outfit._id);
                return next;
            });
        }
    };

    const handleUnsaveOutfit = async (outfitId) => {
        if (!isOwnProfile || removingIds.has(outfitId)) return;
        setActionError("");
        setRemovingIds((current) => new Set(current).add(outfitId));
        try {
            await toggleCommunitySave(outfitId);
            setSavedOutfits((current) =>
                current.filter((outfit) => outfit._id !== outfitId),
            );
        } catch (error) {
            setActionError(
                error.response?.data?.message ||
                    "The saved outfit could not be removed. Please try again.",
            );
        } finally {
            setRemovingIds((current) => {
                const next = new Set(current);
                next.delete(outfitId);
                return next;
            });
        }
    };

    const visibleOutfits = activeTab === "created" ? outfits : savedOutfits;
    const visibleLoading =
        activeTab === "created" ? loading : savedLoading;
    const visibleError =
        activeTab === "created" ? loadError : savedError;
    const visibleHasMore =
        activeTab === "created" ? hasMore : savedHasMore;
    const visibleLoadingMore =
        activeTab === "created" ? loadingMore : savedLoadingMore;
    const visibleMoreError =
        activeTab === "created" ? moreError : savedMoreError;

    return (
        <main className="min-h-screen bg-bg-subtle/45 pb-16 [&_a]:cursor-pointer [&_button]:cursor-pointer">
            {creator && (
                <PageMeta
                    title={`${name}'s Community Outfits | OOTDIFY`}
                    description={`Explore outfit inspiration shared by ${name} with the OOTDIFY community.`}
                />
            )}

            <section className="mx-auto w-full max-w-screen-2xl px-3 pt-7 sm:px-5 sm:pt-10 lg:px-7">
                <Link
                    to="/community"
                    className="invisible mb-5 inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-medium text-text-secondary transition hover:text-accent-hover"
                >
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    Back to Discover
                </Link>

                {loading && !creator && (
                    <div
                        role="status"
                        aria-label="Loading creator profile"
                        className="mb-8 rounded-[1.75rem] border border-border/80 bg-bg p-6 shadow-[0_12px_38px_rgba(8,28,21,0.06)] sm:p-8"
                    >
                        <div className="flex items-center gap-5">
                            <div className="h-20 w-20 animate-pulse rounded-full bg-bg-subtle sm:h-24 sm:w-24" />
                            <div className="space-y-3">
                                <div className="h-3 w-28 animate-pulse rounded-full bg-bg-subtle" />
                                <div className="h-8 w-52 animate-pulse rounded-full bg-bg-subtle" />
                                <div className="h-3 w-40 animate-pulse rounded-full bg-bg-subtle" />
                            </div>
                        </div>
                    </div>
                )}

                {loadError && (
                    <div
                        role="alert"
                        className="rounded-[1.75rem] border border-red-200 bg-bg p-8 text-center shadow-sm"
                    >
                        <p className="font-display text-3xl text-text-primary">
                            Profile unavailable
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">
                            {loadError}
                        </p>
                        <button
                            type="button"
                            onClick={() => setRefreshKey((key) => key + 1)}
                            className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {notFound && !loading && (
                    <div className="rounded-[1.75rem] border border-border/80 bg-bg px-6 py-16 text-center shadow-sm">
                        <p className="font-display text-3xl text-text-primary">
                            Creator not found
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">
                            This community profile may no longer be available.
                        </p>
                        <Link
                            to="/community"
                            className="mt-5 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover"
                        >
                            Explore community outfits
                        </Link>
                    </div>
                )}

                {creator && (
                    <>
                        <header className="mb-6 overflow-hidden rounded-2xl border border-border/80 bg-bg shadow-[0_10px_32px_rgba(8,28,21,0.06)] sm:mb-8">
                            <div className="flex flex-wrap items-center gap-3.5 p-4 sm:gap-5 sm:p-5">
                                <div className="relative h-20 w-20 shrink-0 sm:h-22 sm:w-22">
                                    {picturePreview || creator.profilePicture?.url ? (
                                        <img
                                            src={picturePreview || creator.profilePicture.url}
                                            alt={`${name}'s profile`}
                                            className="h-full w-full rounded-full border-2 border-accent-subtle object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-accent-subtle bg-bg-subtle text-xl font-semibold uppercase text-accent-hover">
                                            {name.slice(0, 1)}
                                        </div>
                                    )}
                                    {isOwnProfile && (
                                        <>
                                            <input
                                                ref={pictureInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handlePictureChange}
                                                className="sr-only"
                                                aria-label="Choose a profile picture"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => pictureInputRef.current?.click()}
                                                disabled={pictureUploading}
                                                aria-label="Upload profile picture"
                                                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg bg-accent text-white shadow transition hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70"
                                            >
                                                {pictureUploading ? (
                                                    <LoaderCircle
                                                        aria-hidden="true"
                                                        className="h-3 w-3 animate-spin"
                                                    />
                                                ) : (
                                                    <Camera
                                                        aria-hidden="true"
                                                        className="h-3 w-3"
                                                    />
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="break-words font-display text-2xl italic leading-tight text-text-primary sm:text-3xl">
                                        {name}
                                    </h1>
                                    <p className="mt-1 text-xs text-text-secondary">
                                        Community creator
                                        {memberSince ? ` · Member since ${memberSince}` : ""}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-muted">
                                        <span>
                                            <strong className="font-semibold text-text-primary">
                                                {formatCount(stats.outfitCount)}
                                            </strong>{" "}
                                            {stats.outfitCount === 1 ? "outfit" : "outfits"}
                                        </span>
                                        <span>
                                            <strong className="font-semibold text-text-primary">
                                                {formatCount(stats.likeCount)}
                                            </strong>{" "}
                                            likes
                                        </span>
                                    </div>
                                    {pictureError && isOwnProfile && (
                                        <p
                                            role="alert"
                                            className="mt-2 text-xs text-red-700"
                                        >
                                            {pictureError}
                                        </p>
                                    )}
                                </div>
                                <Link
                                    to="/community/create"
                                    className="ml-auto inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white transition hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-md sm:text-xs"
                                >
                                    <Shirt aria-hidden="true" className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Share your outfit</span>
                                    <span className="sm:hidden">Share</span>
                                </Link>
                            </div>
                        </header>

                        <div className="mb-5 text-center">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                                    Style from the community
                                </p>
                                <h2 className="mt-1 font-display text-3xl italic text-text-primary sm:text-4xl">
                                    {isOwnProfile ? "Your community outfits" : `${name}'s outfits`}
                                </h2>
                            </div>
                        </div>

                        <div
                            role="tablist"
                            aria-label="Creator outfits"
                            className="mx-auto mb-7 flex w-fit items-center rounded-full border border-border bg-bg p-1 shadow-sm"
                        >
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === "created"}
                                onClick={() => setActiveTab("created")}
                                className={`min-w-32 cursor-pointer rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                                    activeTab === "created"
                                        ? "bg-text-primary text-bg shadow-sm"
                                        : "text-text-secondary hover:text-accent-hover"
                                }`}
                            >
                                Created
                            </button>
                            {isOwnProfile && (
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === "saved"}
                                    onClick={() => setActiveTab("saved")}
                                    className={`min-w-32 cursor-pointer rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                                        activeTab === "saved"
                                            ? "bg-text-primary text-bg shadow-sm"
                                            : "text-text-secondary hover:text-accent-hover"
                                    }`}
                                >
                                    Saved
                                </button>
                            )}
                        </div>

                        {actionError && (
                            <p
                                role="alert"
                                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {actionError}
                            </p>
                        )}

                        {visibleLoading && visibleOutfits.length === 0 && (
                            <div
                                aria-hidden="true"
                                className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-5 lg:gap-4"
                            >
                                {Array.from(
                                    { length: activeTab === "saved" ? 5 : 8 },
                                    (_, index) => (
                                    <OutfitSkeleton key={index} />
                                    ),
                                )}
                            </div>
                        )}

                        {visibleError && (
                            <div
                                role="alert"
                                className="rounded-2xl border border-red-200 bg-bg px-5 py-8 text-center"
                            >
                                <p className="text-sm text-red-700">{visibleError}</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (activeTab === "created") {
                                            setRefreshKey((key) => key + 1);
                                        } else {
                                            setSavedLoaded(false);
                                            setSavedError("");
                                        }
                                    }}
                                    className="mt-3 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent-hover"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {!visibleLoading &&
                            visibleOutfits.length === 0 &&
                            !visibleError && (
                            <div className="rounded-[1.75rem] border border-dashed border-border-strong bg-bg px-6 py-16 text-center">
                                {activeTab === "saved" ? (
                                    <Bookmark
                                        aria-hidden="true"
                                        className="mx-auto h-8 w-8 text-accent"
                                    />
                                ) : (
                                    <Shirt
                                    aria-hidden="true"
                                    className="mx-auto h-8 w-8 text-accent"
                                    />
                                )}
                                <p className="mt-4 font-display text-3xl text-text-primary">
                                    {activeTab === "saved"
                                        ? "No saved outfits yet"
                                        : "No outfits shared yet"}
                                </p>
                                <p className="mt-2 text-sm text-text-secondary">
                                    {activeTab === "saved"
                                        ? "Bookmark community outfits to find them here later."
                                        : "Check back later for more inspiration from this creator."}
                                </p>
                            </div>
                        )}

                        {visibleOutfits.length > 0 && (
                            <div
                                aria-label={
                                    activeTab === "created"
                                        ? `${name}'s created community outfits`
                                        : "Your saved community outfits"
                                }
                                className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-5 lg:gap-4"
                            >
                                {visibleOutfits.map((outfit) => (
                                    <OutfitCard
                                        key={outfit._id}
                                        outfit={outfit}
                                        isOwnProfile={isOwnProfile}
                                        onEdit={
                                            activeTab === "created"
                                                ? true
                                                : false
                                        }
                                        onDelete={
                                            activeTab === "created"
                                                ? handleDeleteCreatedOutfit
                                                : null
                                        }
                                        onUnsave={
                                            activeTab === "saved"
                                                ? handleUnsaveOutfit
                                                : null
                                        }
                                        removing={removingIds.has(outfit._id)}
                                    />
                                ))}
                            </div>
                        )}

                        <div
                            ref={sentinelRef}
                            aria-hidden="true"
                            className="h-1"
                        />
                        {visibleLoadingMore && (
                            <p
                                role="status"
                                className="py-5 text-center text-xs text-text-muted"
                            >
                                Loading more {activeTab === "created" ? "outfits" : "saved outfits"}…
                            </p>
                        )}
                        {visibleMoreError && (
                            <div className="py-5 text-center">
                                <p role="alert" className="text-sm text-red-700">
                                    {visibleMoreError}
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        activeTab === "created"
                                            ? loadMore(true)
                                            : loadMoreSaved(true)
                                    }
                                    className="mt-2 text-sm font-medium text-accent-hover underline underline-offset-4"
                                >
                                    Try loading again
                                </button>
                            </div>
                        )}
                        {!visibleHasMore &&
                            visibleOutfits.length > 0 &&
                            !visibleLoading && (
                            <p className="py-6 text-center text-xs text-text-muted">
                                {activeTab === "created"
                                    ? `You've seen all of ${name}'s outfits.`
                                    : "You've reached the end of your saved outfits."}
                            </p>
                        )}
                    </>
                )}
            </section>
            {outfitPendingDelete && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !removingIds.has(outfitPendingDelete._id)) {
                            setOutfitPendingDelete(null);
                        }
                    }}
                >
                    <section
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-outfit-title"
                        aria-describedby="delete-outfit-description"
                        className="w-full max-w-md rounded-3xl border border-border bg-bg p-6 shadow-2xl sm:p-7"
                    >
                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
                            <AlertTriangle aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <h2
                            id="delete-outfit-title"
                            className="mt-4 text-center font-display text-2xl text-text-primary"
                        >
                            Delete this outfit?
                        </h2>
                        <p
                            id="delete-outfit-description"
                            className="mt-2 text-center text-sm leading-6 text-text-secondary"
                        >
                            <span className="font-semibold text-text-primary">
                                {outfitPendingDelete.title}
                            </span>{" "}
                            and its community interactions will be permanently removed.
                        </p>
                        {actionError && (
                            <p role="alert" className="mt-4 text-center text-xs text-red-700">
                                {actionError}
                            </p>
                        )}
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                            <button
                                type="button"
                                onClick={() => setOutfitPendingDelete(null)}
                                disabled={removingIds.has(outfitPendingDelete._id)}
                                className="min-h-11 rounded-full border border-border px-5 text-sm font-medium text-text-secondary transition hover:border-accent hover:text-accent-hover disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteCreatedOutfit}
                                disabled={removingIds.has(outfitPendingDelete._id)}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
                            >
                                <Trash2 aria-hidden="true" className="h-4 w-4" />
                                {removingIds.has(outfitPendingDelete._id)
                                    ? "Deleting..."
                                    : "Delete outfit"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
};

export default CommunityCreatorProfile;
