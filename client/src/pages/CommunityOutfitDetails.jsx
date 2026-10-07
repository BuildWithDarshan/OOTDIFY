import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import {
    ArrowLeft,
    AlertTriangle,
    Bookmark,
    BookmarkCheck,
    Download,
    Heart,
    MessageCircle,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Shirt,
    SlidersHorizontal,
    Send,
    Trash2,
    X,
} from "lucide-react";
import PageMeta from "../components/Common/PageMeta.jsx";
import EmojiPickerButton from "../components/Common/EmojiPickerButton.jsx";
import CommunityOutfitReport from "../components/CommunityOutfitReport.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
    attachCommunityInteractionStates,
    addCommunityComment,
    deleteCommunityComment,
    getCommunityComments,
    getCommunityInteractionState,
    toggleCommunityLike,
    toggleCommunitySave,
} from "../services/communityInteractionService.js";
import {
    deleteCommunityOutfit,
    getCommunityOutfitById,
    getRelatedCommunityOutfits,
} from "../services/communityOutfitService.js";
import { getOccasions, getOutfitTypes } from "../services/taxonomyService.js";

const COMMENT_PAGE_SIZE = 20;
const RELATED_PAGE_SIZE = 12;
const RELATED_SORT_OPTIONS = [
    { value: "relevance", label: "Most relevant" },
    { value: "latest", label: "Latest" },
    { value: "mostLiked", label: "Most liked" },
    { value: "mostSaved", label: "Most saved" },
    { value: "mostCommented", label: "Most commented" },
    { value: "trending", label: "Trending" },
];
const GENDER_OPTIONS = [
    { value: "", label: "All styles" },
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
    { value: "unisex", label: "Unisex" },
];

const RELATED_SELECT_STYLES = {
    container: (base) => ({ ...base, width: "100%", minWidth: 0 }),
    control: (base, state) => ({
        ...base,
        minHeight: 42,
        borderRadius: 999,
        borderColor: state.isFocused ? "#40916c" : "#b7e4c7",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(64,145,108,.12)" : "none",
        ":hover": { borderColor: "#40916c" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 14px" }),
    placeholder: (base) => ({ ...base, color: "#52b788", fontSize: 12 }),
    singleValue: (base) => ({
        ...base,
        color: "#081c15",
        fontSize: 12,
        fontWeight: 500,
    }),
    input: (base) => ({ ...base, color: "#081c15", fontSize: 12 }),
    menuPortal: (base) => ({ ...base, zIndex: 80 }),
    menu: (base) => ({
        ...base,
        overflow: "hidden",
        border: "1px solid #b7e4c7",
        borderRadius: 14,
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 45px rgba(8,28,21,.16)",
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? "#1b4332"
            : state.isFocused
              ? "#d8f3dc"
              : "transparent",
        color: state.isSelected ? "#ffffff" : "#173328",
        cursor: "pointer",
        fontSize: 12,
    }),
};

const formatDate = (value) => {
    if (!value) return "";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
    }).format(new Date(value));
};

const LoadingState = () => (
    <main
        role="status"
        className="flex min-h-[60vh] items-center justify-center px-5"
    >
        <div className="text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg-subtle">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent/25 border-t-accent" />
            </span>
            <p className="font-display text-2xl italic text-text-secondary">
                Loading this look...
            </p>
        </div>
    </main>
);

const MasonryGridItem = ({ children, className = "" }) => {
    const itemRef = useRef(null);

    useEffect(() => {
        const item = itemRef.current;
        const grid = item?.parentElement;
        const content = item?.firstElementChild;
        if (!item || !grid || !content) return undefined;

        const updateRowSpan = () => {
            const gridStyles = window.getComputedStyle(grid);
            const rowHeight = Number.parseFloat(gridStyles.gridAutoRows) || 8;
            const rowGap = Number.parseFloat(gridStyles.rowGap) || 0;
            const contentHeight = content.getBoundingClientRect().height;
            const rowSpan = Math.ceil(
                (contentHeight + rowGap) / (rowHeight + rowGap),
            );

            item.style.gridRowEnd = `span ${Math.max(1, rowSpan)}`;
        };
        const observer = new ResizeObserver(updateRowSpan);
        observer.observe(content);
        updateRowSpan();

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={itemRef}
            className={`self-start ${className}`}
            style={{ gridRowEnd: "span 1" }}
        >
            {children}
        </div>
    );
};

const RelatedCommunityCard = ({ outfit }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [saved, setSaved] = useState(Boolean(outfit.isSaved));
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    const handleSave = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        if (saving) return;

        const previousSaved = saved;
        setSaved(!saved);
        setSaving(true);
        setSaveError("");
        try {
            const data = await toggleCommunitySave(outfit._id);
            setSaved(Boolean(data.saved));
        } catch (error) {
            setSaved(previousSaved);
            setSaveError(
                error.response?.data?.message || "Could not update saved outfit.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-border/70 bg-bg shadow-[0_8px_28px_rgba(8,28,21,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(8,28,21,0.11)]">
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
            {outfit.user?._id && (
                <Link
                    to={`/community/creator/${outfit.user._id}`}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`View ${outfit.user.name || "creator"}'s profile`}
                    title={outfit.user.name || "Community creator"}
                    className="absolute left-2.5 top-2.5 z-10 hidden h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white/90 text-xs font-semibold uppercase text-accent-hover shadow-md backdrop-blur transition-opacity sm:flex sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                    {outfit.user.profilePicture?.url ? (
                        <img
                            src={outfit.user.profilePicture.url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        (outfit.user.name || "C").slice(0, 1)
                    )}
                </Link>
            )}
            <div className="p-3 sm:p-3.5">
                <div className="flex min-w-0 items-center justify-between gap-2">
                    <Link
                        to={`/community/${outfit._id}`}
                        className="min-w-0 flex-1 truncate font-display text-lg leading-tight text-text-primary sm:text-xl"
                    >
                        {outfit.title}
                    </Link>
                    <span className="inline-flex shrink-0 items-center gap-2 text-[11px] text-text-muted">
                        <span
                            className={`inline-flex items-center gap-1 ${
                                outfit.isLiked ? "text-accent-hover" : ""
                            }`}
                        >
                            <Heart
                                aria-hidden="true"
                                className={`h-3.5 w-3.5 ${outfit.isLiked ? "fill-current" : ""}`}
                            />
                            {outfit.likeCount ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                        <MessageCircle
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                        />
                        {outfit.commentCount ?? 0}
                        </span>
                    </span>
                </div>
            </div>
            <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                aria-label={saved ? "Remove from saved outfits" : "Save outfit"}
                aria-pressed={saved}
                title={saveError || (saved ? "Remove from saved outfits" : "Save outfit")}
                className={`absolute right-2.5 top-2.5 z-10 hidden h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-text-primary shadow-md backdrop-blur transition hover:scale-105 hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:right-3 sm:top-3 sm:flex sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 ${
                    saved ? "text-accent-hover sm:opacity-100" : ""
                }`}
            >
                {saved ? (
                    <BookmarkCheck aria-hidden="true" className="h-4 w-4" />
                ) : (
                    <Bookmark aria-hidden="true" className="h-4 w-4" />
                )}
            </button>
            {saveError && (
                <span role="status" className="block px-3 pb-3 text-[10px] text-red-700">
                    {saveError}
                </span>
            )}
        </article>
    );
};

const RelatedCommunityCardSkeleton = () => (
    <div
        aria-hidden="true"
        className="group relative overflow-hidden rounded-2xl border border-border/70 bg-bg"
    >
        <div className="aspect-[4/5] animate-pulse bg-bg-subtle" />
        <div className="flex items-center justify-between gap-2 p-3 sm:p-3.5">
            <div className="h-4 w-2/5 animate-pulse rounded-full bg-bg-subtle" />
            <div className="flex shrink-0 items-center gap-2">
                <div className="h-3 w-8 animate-pulse rounded-full bg-bg-subtle" />
                <div className="h-3 w-8 animate-pulse rounded-full bg-bg-subtle" />
            </div>
        </div>
        <div className="absolute left-2.5 top-2.5 hidden h-9 w-9 animate-pulse rounded-full bg-white/70 sm:block sm:opacity-0 sm:group-hover:opacity-100" />
        <div className="absolute right-2.5 top-2.5 hidden h-9 w-9 animate-pulse rounded-full bg-white/70 sm:block sm:opacity-0 sm:group-hover:opacity-100" />
    </div>
);

const RelatedCommunityOutfits = ({ outfitId, children }) => {
    const { user, isAuthenticated } = useAuth();
    const [categories, setCategories] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [gender, setGender] = useState("");
    const [category, setCategory] = useState("");
    const [occasion, setOccasion] = useState("");
    const [sort, setSort] = useState("relevance");
    const [outfits, setOutfits] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [taxonomyError, setTaxonomyError] = useState("");
    const [retryKey, setRetryKey] = useState(0);
    const sentinelRef = useRef(null);
    const loadingMoreRef = useRef(false);
    const requestIdRef = useRef(0);
    const query = useMemo(
        () => ({ search, gender, category, occasion, sort }),
        [search, gender, category, occasion, sort],
    );
    const categoryOptions = categories.map((item) => ({
        value: item._id,
        label: item.name,
    }));
    const occasionOptions = occasions.map((item) => ({
        value: item._id,
        label: item.name,
    }));
    const selectedSort =
        RELATED_SORT_OPTIONS.find((option) => option.value === sort) ||
        RELATED_SORT_OPTIONS[0];
    const hasActiveFilters = Boolean(
        search || gender || category || occasion || sort !== "relevance",
    );

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearch(searchInput.trim());
        }, 300);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        let cancelled = false;
        Promise.all([getOutfitTypes(), getOccasions()])
            .then(([typeData, occasionData]) => {
                if (cancelled) return;
                setCategories(typeData.outfitTypes || []);
                setOccasions(occasionData.occasions || []);
            })
            .catch(() => {
                if (!cancelled) {
                    setTaxonomyError(
                        "Category or occasion filters could not be loaded.",
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const requestId = ++requestIdRef.current;
        loadingMoreRef.current = false;

        Promise.resolve().then(async () => {
            if (cancelled) return;
            setLoadingMore(false);
            setLoading(true);
            setError("");
            setOutfits([]);
            setPage(1);
            setHasMore(false);

            try {
                const data = await getRelatedCommunityOutfits(outfitId, {
                    ...query,
                    page: 1,
                    limit: RELATED_PAGE_SIZE,
                });
                if (cancelled || requestId !== requestIdRef.current) return;
                const pageOutfits = isAuthenticated
                    ? await attachCommunityInteractionStates(data.outfits || [])
                    : data.outfits || [];
                if (cancelled || requestId !== requestIdRef.current) return;
                setOutfits(pageOutfits);
                setPage(1);
                setHasMore(Boolean(data.pagination?.hasMore));
            } catch (requestError) {
                if (!cancelled && requestId === requestIdRef.current) {
                    setError(
                        requestError.response?.data?.message ||
                            "Related outfits could not be loaded.",
                    );
                }
            } finally {
                if (!cancelled && requestId === requestIdRef.current) {
                    setLoading(false);
                }
            }
        });

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, outfitId, query, retryKey]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loading || loadingMoreRef.current || error) return;

        const requestId = requestIdRef.current;
        loadingMoreRef.current = true;
        setLoadingMore(true);

        try {
            const nextPage = page + 1;
            const data = await getRelatedCommunityOutfits(outfitId, {
                ...query,
                page: nextPage,
                limit: RELATED_PAGE_SIZE,
            });
            if (requestId !== requestIdRef.current) return;
            const pageOutfits = isAuthenticated
                ? await attachCommunityInteractionStates(data.outfits || [])
                : data.outfits || [];
            if (requestId !== requestIdRef.current) return;

            setOutfits((current) => {
                const knownIds = new Set(current.map((item) => item._id));
                return [
                    ...current,
                    ...pageOutfits.filter(
                        (item) => !knownIds.has(item._id),
                    ),
                ];
            });
            setPage(nextPage);
            setHasMore(Boolean(data.pagination?.hasMore));
        } catch (requestError) {
            if (requestId === requestIdRef.current) {
                setError(
                    requestError.response?.data?.message ||
                        "More related outfits could not be loaded.",
                );
            }
        } finally {
            if (requestId === requestIdRef.current) {
                loadingMoreRef.current = false;
                setLoadingMore(false);
            }
        }
    }, [error, hasMore, isAuthenticated, loading, outfitId, page, query]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore || loading || error) return undefined;

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
    }, [error, hasMore, loadMore, loading]);

    const retry = () => {
        if (loadingMoreRef.current) return;
        if (outfits.length > 0) {
            setError("");
            setHasMore(true);
            return;
        }
        setError("");
        setLoading(true);
        setRetryKey((current) => current + 1);
    };

    const clearFilters = () => {
        setSearchInput("");
        setGender("");
        setCategory("");
        setOccasion("");
        setSort("relevance");
    };

    const profileLink = isAuthenticated && user?.id
        ? `/community/creator/${user.id}`
        : "/login";
    const profileControl = (
        <Link
            to={profileLink}
            aria-label={isAuthenticated ? `${user?.name || "Your"} creator profile` : "Log in to OOTDIFY"}
            title={isAuthenticated ? user?.name || "Your profile" : "Log in"}
            className="hidden"
        >
            {user?.profilePicture?.url ? (
                <img src={user.profilePicture.url} alt="" className="h-full w-full object-cover" />
            ) : (
                <span className="flex h-full w-full items-center justify-center bg-bg-subtle text-xs font-semibold uppercase text-accent-hover">
                    {(user?.name || (isAuthenticated ? "U" : "G")).slice(0, 1)}
                </span>
            )}
        </Link>
    );
    const controlButtons = (
        <>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchOpen((current) => !current);
                            setFiltersOpen(false);
                        }}
                        aria-label={searchOpen ? "Close search" : "Search related outfits"}
                        aria-expanded={searchOpen}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                            searchOpen
                                ? "border-accent bg-accent-subtle text-accent-hover"
                                : "border-border bg-bg text-text-primary hover:border-accent hover:text-accent-hover"
                        }`}
                    >
                        {searchOpen ? (
                            <X aria-hidden="true" className="h-4 w-4" />
                        ) : (
                            <Search aria-hidden="true" className="h-4 w-4" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setFiltersOpen((current) => !current);
                            setSearchOpen(false);
                        }}
                        aria-label={filtersOpen ? "Close filters" : "Filter related outfits"}
                        aria-expanded={filtersOpen}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition ${
                            filtersOpen || hasActiveFilters
                                ? "border-accent bg-accent-subtle text-accent-hover"
                                : "border-border bg-bg text-text-primary hover:border-accent hover:text-accent-hover"
                        }`}
                    >
                        {filtersOpen ? (
                            <X aria-hidden="true" className="h-4 w-4" />
                        ) : (
                            <SlidersHorizontal
                                aria-hidden="true"
                                className="h-4 w-4"
                            />
                        )}
                        {hasActiveFilters && (
                            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-bg" />
                        )}
                    </button>
        </>
    );
    const filterPanel = (
        <>

            {searchOpen && (
                <div className="fixed left-3 right-3 top-16 z-50 lg:left-[calc(50%+3.875rem)] lg:right-auto lg:top-4 lg:w-[min(calc(100vw-38rem),55rem)] lg:-translate-x-1/2">
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                    />
                    <input
                        autoFocus
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search outfits, styles, tags..."
                        aria-label="Search related community outfits"
                        className="min-h-12 w-full rounded-2xl border border-border bg-bg pl-11 pr-4 text-sm text-text-primary shadow-lg outline-none transition placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/15"
                    />
                </div>
            )}

            {filtersOpen && (
                <div className="fixed left-3 right-3 top-16 z-50 rounded-2xl border border-border bg-bg p-3 shadow-[0_12px_36px_rgba(8,28,21,0.18)] sm:p-4 lg:left-[calc(50%+3.875rem)] lg:right-auto lg:top-4 lg:w-[min(calc(100vw-38rem),55rem)] lg:-translate-x-1/2">
                    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                        <Select
                            value={
                                GENDER_OPTIONS.find(
                                    (option) => option.value === gender,
                                ) || null
                            }
                            onChange={(option) =>
                                setGender(option?.value || "")
                            }
                            options={GENDER_OPTIONS}
                            aria-label="Filter related outfits by gender"
                            placeholder="All styles"
                            styles={RELATED_SELECT_STYLES}
                        />
                        <Select
                            value={
                                categoryOptions.find(
                                    (option) => option.value === category,
                                ) || null
                            }
                            onChange={(option) =>
                                setCategory(option?.value || "")
                            }
                            options={categoryOptions}
                            aria-label="Filter related outfits by category"
                            placeholder="All categories"
                            isClearable
                            styles={RELATED_SELECT_STYLES}
                        />
                        <Select
                            value={
                                occasionOptions.find(
                                    (option) => option.value === occasion,
                                ) || null
                            }
                            onChange={(option) =>
                                setOccasion(option?.value || "")
                            }
                            options={occasionOptions}
                            aria-label="Filter related outfits by occasion"
                            placeholder="All occasions"
                            isClearable
                            styles={RELATED_SELECT_STYLES}
                        />
                        <Select
                            value={selectedSort}
                            onChange={(option) =>
                                setSort(option?.value || "relevance")
                            }
                            options={RELATED_SORT_OPTIONS}
                            aria-label="Sort related outfits"
                            isSearchable={false}
                            styles={RELATED_SELECT_STYLES}
                        />
                    </div>
                    {(hasActiveFilters || taxonomyError) && (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            {taxonomyError && (
                                <p role="status" className="text-xs text-text-muted">
                                    {taxonomyError}
                                </p>
                            )}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="ml-auto min-h-8 rounded-full px-3 text-xs font-medium text-text-secondary transition hover:text-accent-hover"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );

    return (
        <>
            {profileControl}
            <div className="fixed right-5 top-4 z-40 hidden items-center gap-2 lg:flex">
                {controlButtons}
                <Link
                    to={profileLink}
                    aria-label={isAuthenticated ? `${user?.name || "Your"} creator profile` : "Log in to OOTDIFY"}
                    className="inline-flex max-w-48 items-center gap-2 rounded-full border border-border bg-bg py-1.5 pl-1.5 pr-3 transition hover:border-accent hover:bg-bg-subtle"
                >
                    {user?.profilePicture?.url ? (
                        <img src={user.profilePicture.url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                    ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-xs font-semibold uppercase text-accent-hover">
                            {(user?.name || (isAuthenticated ? "U" : "G")).slice(0, 1)}
                        </span>
                    )}
                    <span className="truncate text-xs font-semibold text-text-primary">
                        {isAuthenticated ? user?.name || "Your profile" : "Log in"}
                    </span>
                </Link>
            </div>
            <div className="fixed right-16 top-3 z-40 flex items-center gap-1.5 lg:hidden">
                {controlButtons}
            </div>
            {filterPanel}

            <div
                aria-label="Community outfit and related outfits"
                className="grid grid-cols-2 [grid-auto-flow:dense] [grid-auto-rows:8px] gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5"
                role={loading && outfits.length === 0 ? "status" : undefined}
            >
                <MasonryGridItem className="col-span-full lg:col-span-3">
                    {children}
                </MasonryGridItem>

                {loading &&
                    outfits.length === 0 &&
                    Array.from({ length: 5 }, (_, index) => (
                        <MasonryGridItem
                            key={`initial-${index}`}
                            className="col-span-1"
                        >
                            <RelatedCommunityCardSkeleton />
                        </MasonryGridItem>
                    ))}

                {outfits.map((relatedOutfit) => (
                    <MasonryGridItem
                        key={relatedOutfit._id}
                        className="col-span-1"
                    >
                        <RelatedCommunityCard outfit={relatedOutfit} />
                    </MasonryGridItem>
                ))}

                {loadingMore &&
                    Array.from({ length: 5 }, (_, index) => (
                        <MasonryGridItem
                            key={`more-${index}`}
                            className="col-span-1"
                        >
                            <RelatedCommunityCardSkeleton />
                        </MasonryGridItem>
                    ))}
            </div>

            {!loading && error && outfits.length === 0 && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    <p role="alert">{error}</p>
                    <button
                        type="button"
                        onClick={retry}
                        className="mt-2 text-xs font-semibold underline underline-offset-2"
                    >
                        Try again
                    </button>
                </div>
            )}
            {!loading && !error && outfits.length === 0 && (
                <p className="mt-5 rounded-2xl border border-dashed border-border-strong bg-bg px-4 py-6 text-sm leading-6 text-text-secondary">
                    No similar community outfits yet. Check back as more looks are shared.
                </p>
            )}
            {error && outfits.length > 0 && (
                <div className="py-4 text-center">
                    <p role="alert" className="text-xs text-red-700">{error}</p>
                    <button
                        type="button"
                        onClick={retry}
                        className="mt-2 text-xs font-semibold text-accent-hover underline"
                    >
                        Try loading more
                    </button>
                </div>
            )}
            {outfits.length > 0 && !hasMore && !loading && (
                <p className="py-5 text-center text-[10px] uppercase tracking-[0.16em] text-text-muted">
                    You’re all caught up
                </p>
            )}
            <div ref={sentinelRef} aria-hidden="true" className="h-1" />
        </>
    );
};

const CommunityOutfitDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [outfitResult, setOutfitResult] = useState({
        id: null,
        outfit: null,
        notFound: false,
        error: "",
    });
    const [interactionState, setInteractionState] = useState(null);
    const [interactionLoading, setInteractionLoading] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentsPage, setCommentsPage] = useState(1);
    const [commentsHaveMore, setCommentsHaveMore] = useState(false);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState("");
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentsLoadedFor, setCommentsLoadedFor] = useState("");
    const [commentText, setCommentText] = useState("");
    const commentInputRef = useRef(null);
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentActionError, setCommentActionError] = useState("");
    const [deletingCommentId, setDeletingCommentId] = useState("");
    const [deleteOutfitLoading, setDeleteOutfitLoading] = useState(false);
    const [deleteOutfitError, setDeleteOutfitError] = useState("");
    const [deleteOutfitDialogOpen, setDeleteOutfitDialogOpen] = useState(false);
    const [outfitMenuOpen, setOutfitMenuOpen] = useState(false);
    const [imageDownloadError, setImageDownloadError] = useState("");
    const [imageDownloading, setImageDownloading] = useState(false);

    const handleDownloadImage = async () => {
        setImageDownloading(true);
        setImageDownloadError("");
        try {
            const response = await fetch(outfit.image.url);
            if (!response.ok) {
                throw new Error("The outfit image could not be downloaded.");
            }

            const imageBlob = await response.blob();
            const downloadUrl = URL.createObjectURL(imageBlob);
            const link = document.createElement("a");
            const fileExtension =
                imageBlob.type.split("/")[1]?.split(";")[0] || "jpg";
            link.href = downloadUrl;
            link.download = `${(outfit.title || "community-outfit")
                .trim()
                .replace(/[^\w.-]+/g, "-")}.${fileExtension}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
            setOutfitMenuOpen(false);
        } catch (error) {
            setImageDownloadError(
                error.message || "The outfit image could not be downloaded.",
            );
        } finally {
            setImageDownloading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        getCommunityOutfitById(id)
            .then((data) => {
                if (!cancelled) {
                    setOutfitResult({
                        id,
                        outfit: data.outfit,
                        notFound: false,
                        error: "",
                    });
                }
            })
            .catch((error) => {
                if (cancelled) return;
                if (error.response?.status === 404) {
                    setOutfitResult({
                        id,
                        outfit: null,
                        notFound: true,
                        error: "",
                    });
                } else {
                    setOutfitResult({
                        id,
                        outfit: null,
                        notFound: false,
                        error:
                            error.response?.data?.message ||
                            "The outfit could not be loaded. Please try again.",
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        if (authLoading || !isAuthenticated) return undefined;

        let cancelled = false;

        getCommunityInteractionState(id)
            .then((data) => {
                if (cancelled) return;
                setInteractionState({
                    outfitId: id,
                    userId: user?.id,
                    liked: Boolean(data.liked),
                    saved: Boolean(data.saved),
                    error: "",
                });
            })
            .catch((error) => {
                if (!cancelled) {
                    setInteractionState({
                        outfitId: id,
                        userId: user?.id,
                        liked: false,
                        saved: false,
                        error:
                            error.response?.data?.message ||
                            "Could not load your like and save status.",
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [authLoading, id, isAuthenticated, user?.id]);

    const loadComments = useCallback(
        async (page, append = false) => {
            setCommentsLoading(true);
            setCommentsError("");

            try {
                const data = await getCommunityComments(id, {
                    page,
                    limit: COMMENT_PAGE_SIZE,
                });

                setComments((current) =>
                    append
                        ? [...current, ...(data.comments || [])]
                        : data.comments || [],
                );
                setCommentsPage(page);
                setCommentsHaveMore(Boolean(data.pagination?.hasMore));
                setCommentsLoadedFor(id);
            } catch (error) {
                setCommentsError(
                    error.response?.data?.message ||
                        "Comments could not be loaded. Please try again.",
                );
            } finally {
                setCommentsLoading(false);
            }
        },
        [id],
    );

    useEffect(() => {
        let cancelled = false;
        Promise.resolve().then(() => {
            if (cancelled) return;
            setComments([]);
            setCommentsPage(1);
            setCommentsHaveMore(false);
            setCommentsLoading(false);
            setCommentsError("");
            setCommentsOpen(false);
            setCommentsLoadedFor("");
        });

        return () => {
            cancelled = true;
        };
    }, [loadComments]);

    const toggleComments = () => {
        const willOpen = !commentsOpen;
        setCommentsOpen(willOpen);

        if (willOpen && commentsLoadedFor !== id && !commentsLoading) {
            loadComments(1);
        }
    };

    const handleToggleLike = async () => {
        if (!isAuthenticated) return;
        if (interactionLoading) return;

        const previousState = interactionMatchesUser
            ? interactionState
            : { outfitId: id, userId: user?.id, liked: false, saved };
        const nextLiked = !liked;
        const previousCount = outfit.likeCount ?? 0;
        setInteractionState({
            ...previousState,
            outfitId: id,
            userId: user?.id,
            liked: nextLiked,
            saved,
            error: "",
        });
        setOutfitResult((current) =>
            current.id === id && current.outfit
                ? {
                      ...current,
                      outfit: {
                          ...current.outfit,
                          likeCount: Math.max(
                              0,
                              previousCount + (nextLiked ? 1 : -1),
                          ),
                      },
                  }
                : current,
        );
        setInteractionLoading(true);
        try {
            const data = await toggleCommunityLike(id);
            setInteractionState((current) => ({
                outfitId: id,
                userId: user?.id,
                liked: Boolean(data.liked),
                saved: current?.saved || false,
                error: "",
            }));
            setOutfitResult((current) =>
                current.id === id && current.outfit
                    ? {
                          ...current,
                          outfit: { ...current.outfit, likeCount: data.likeCount },
                      }
                    : current,
            );
        } catch (error) {
            setInteractionState({
                ...previousState,
                outfitId: id,
                userId: user?.id,
                liked,
                error:
                    error.response?.data?.message || "Could not update your like.",
            });
            setOutfitResult((current) =>
                current.id === id && current.outfit
                    ? {
                          ...current,
                          outfit: { ...current.outfit, likeCount: previousCount },
                      }
                    : current,
            );
        } finally {
            setInteractionLoading(false);
        }
    };

    const handleToggleSave = async () => {
        if (!isAuthenticated) return;
        if (interactionLoading) return;

        const previousState = interactionMatchesUser
            ? interactionState
            : { outfitId: id, userId: user?.id, liked, saved: false };
        const nextSaved = !saved;
        const previousCount = outfit.saveCount ?? 0;
        setInteractionState({
            ...previousState,
            outfitId: id,
            userId: user?.id,
            liked,
            saved: nextSaved,
            error: "",
        });
        setOutfitResult((current) =>
            current.id === id && current.outfit
                ? {
                      ...current,
                      outfit: {
                          ...current.outfit,
                          saveCount: Math.max(
                              0,
                              previousCount + (nextSaved ? 1 : -1),
                          ),
                      },
                  }
                : current,
        );
        setInteractionLoading(true);
        try {
            const data = await toggleCommunitySave(id);
            setInteractionState((current) => ({
                outfitId: id,
                userId: user?.id,
                liked: current?.liked || false,
                saved: Boolean(data.saved),
                error: "",
            }));
            setOutfitResult((current) =>
                current.id === id && current.outfit
                    ? {
                          ...current,
                          outfit: { ...current.outfit, saveCount: data.saveCount },
                      }
                    : current,
            );
        } catch (error) {
            setInteractionState({
                ...previousState,
                outfitId: id,
                userId: user?.id,
                saved,
                error:
                    error.response?.data?.message ||
                    "Could not update your saved outfits.",
            });
            setOutfitResult((current) =>
                current.id === id && current.outfit
                    ? {
                          ...current,
                          outfit: { ...current.outfit, saveCount: previousCount },
                      }
                    : current,
            );
        } finally {
            setInteractionLoading(false);
        }
    };

    const handleDeleteOutfit = async () => {
        if (!isOwner || deleteOutfitLoading) return;

        setDeleteOutfitError("");
        setDeleteOutfitLoading(true);
        try {
            await deleteCommunityOutfit(id);
            navigate(
                creatorId ? `/community/creator/${creatorId}` : "/community",
                { replace: true },
            );
        } catch (error) {
            setDeleteOutfitError(
                error.response?.data?.message ||
                    "This outfit could not be deleted. Please try again.",
            );
        } finally {
            setDeleteOutfitLoading(false);
        }
    };

    const handleSubmitComment = async (event) => {
        event.preventDefault();
        const text = commentText.trim();

        if (!text || commentSubmitting) return;

        setCommentSubmitting(true);
        setCommentActionError("");

        try {
            const data = await addCommunityComment(id, text);
            setComments((current) => [...current, data.comment]);
            setCommentText("");
            setOutfitResult((current) =>
                current.id === id && current.outfit
                    ? {
                          ...current,
                          outfit: {
                              ...current.outfit,
                              commentCount: data.commentCount,
                          },
                      }
                    : current,
            );
        } catch (error) {
            setCommentActionError(
                error.response?.data?.message || "Your comment could not be posted.",
            );
        } finally {
            setCommentSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        setDeletingCommentId(commentId);
        setCommentActionError("");

        try {
            await deleteCommunityComment(commentId);
            setComments((current) =>
                current.filter((comment) => comment._id !== commentId),
            );
            setOutfitResult((current) =>
                current.id === id && current.outfit
                    ? {
                          ...current,
                          outfit: {
                              ...current.outfit,
                              commentCount: Math.max(
                                  0,
                                  (current.outfit.commentCount || 0) - 1,
                              ),
                          },
                      }
                    : current,
            );
        } catch (error) {
            setCommentActionError(
                error.response?.data?.message || "Could not delete this comment.",
            );
        } finally {
            setDeletingCommentId("");
        }
    };

    const resultMatchesRoute = outfitResult.id === id;
    const outfit = resultMatchesRoute ? outfitResult.outfit : null;
    const notFound = resultMatchesRoute && outfitResult.notFound;
    const loadError = resultMatchesRoute ? outfitResult.error : "";

    if (!resultMatchesRoute || (!outfit && !notFound && !loadError)) {
        return <LoadingState />;
    }

    if (notFound || loadError || !outfit) {
        return (
            <>
                <PageMeta
                    title="Community Outfit Unavailable | OOTDIFY"
                    description="This community outfit could not be found."
                    noIndex
                />
                <main className="flex min-h-[65vh] flex-col items-center justify-center px-5 text-center">
                    <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-bg-subtle text-accent">
                        <Shirt aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <h1 className="font-display text-3xl italic text-text-primary">
                        {notFound ? "This look is unavailable" : "We couldn't load this look"}
                    </h1>
                    <p role={loadError ? "alert" : undefined} className="mt-2 max-w-md text-sm text-text-secondary">
                        {loadError ||
                            "It may have been removed or is no longer visible in the community."}
                    </p>
                    <Link
                        to="/community"
                        className="invisible mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-bg px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:border-accent hover:text-accent-hover"
>

                        <ArrowLeft className="h-4 w-4" />
                        Back to Discover
                    </Link>
                </main>
            </>
        );
    }

    const outfitOwnerId =
        typeof outfit.user === "string" ? outfit.user : outfit.user?._id;
    const creatorId = outfitOwnerId;
    const isOwner = Boolean(user?.id && outfitOwnerId === user.id);
    const productLinks = outfit.productLinks || {};
    const interactionMatchesUser = Boolean(
        isAuthenticated &&
            interactionState?.outfitId === id &&
            interactionState?.userId === user?.id,
    );
    const liked = interactionMatchesUser && interactionState.liked;
    const saved = interactionMatchesUser && interactionState.saved;
    const interactionError = interactionMatchesUser
        ? interactionState.error
        : "";

    return (
        <main className="relative isolate min-h-screen overflow-clip bg-bg-subtle/35 pb-16 [&_a]:cursor-pointer [&_button]:cursor-pointer">
            <PageMeta
                title={`${outfit.title} | OOTDIFY Community`}
                description={
                    outfit.description ||
                    `${outfit.title}, shared by ${outfit.user?.name || "the OOTDIFY community"}.`
                }
                image={outfit.image?.url}
            />

            <div className="pointer-events-none absolute -left-32 top-48 -z-10 hidden h-72 w-72 rounded-full bg-accent-subtle/35 blur-3xl sm:block" />
            <div className="pointer-events-none absolute -right-40 top-[42rem] -z-10 hidden h-96 w-96 rounded-full bg-bg-subtle blur-3xl sm:block" />

            <div className="relative z-10 mx-auto w-full px-3 pt-24 pb-8 sm:px-4 sm:pt-28 lg:px-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <Link
                        to="/community"
                        className="invisible group inline-flex items-center gap-2 rounded-full px-1 py-2 text-xs font-medium text-text-secondary transition hover:gap-2.5 hover:text-accent-hover sm:text-sm"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg transition group-hover:border-accent group-hover:bg-bg-subtle">
                            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                        </span>
                        Back to Discover
                    </Link>
                    <Link
                        to="/community/create"
                        className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-text-primary px-3 text-[9px] font-semibold uppercase tracking-[0.04em] text-bg transition hover:bg-accent-hover sm:px-4 sm:text-[10px]"
                    >
                        <Plus aria-hidden="true" className="h-4 w-4 shrink-0" />
                        Create your outfit
                    </Link>
                </div>

                <RelatedCommunityOutfits key={id} outfitId={id}>
                    <section className="min-w-0 overflow-hidden rounded-3xl border border-border/80 bg-bg shadow-[0_18px_55px_rgba(8,28,21,0.09)]">
                        <div className="group relative flex items-center justify-center overflow-hidden bg-bg-subtle/60">
                            <img
                                src={outfit.image?.url}
                                alt={outfit.title}
                                className="block h-auto max-h-[62dvh] w-full object-contain sm:max-h-[75dvh]"
                            />
                            <div className="absolute right-3 top-3 z-20">
                                <button
                                    type="button"
                                    onClick={() => setOutfitMenuOpen((open) => !open)}
                                    aria-label="More outfit options"
                                    aria-expanded={outfitMenuOpen}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-text-primary shadow-md backdrop-blur transition hover:bg-white"
                                >
                                    <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
                                </button>
                                {outfitMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-bg p-1.5 shadow-[0_12px_32px_rgba(8,28,21,0.18)]">
                                        <button
                                            type="button"
                                            onClick={handleDownloadImage}
                                            disabled={imageDownloading}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-primary transition hover:bg-bg-subtle disabled:cursor-wait disabled:opacity-60"
                                        >
                                            <Download aria-hidden="true" className="h-4 w-4" />
                                            {imageDownloading ? "Preparing download..." : "Download image"}
                                        </button>
                                        {imageDownloadError && (
                                            <p role="alert" className="px-3 py-1.5 text-xs text-red-700">
                                                {imageDownloadError}
                                            </p>
                                        )}
                                        {!isOwner && (
                                            <CommunityOutfitReport
                                                outfit={outfit}
                                                menuItem
                                                onSubmitted={() => setOutfitMenuOpen(false)}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
                        <section>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                                    Shared by the community
                                </p>
                                <span className="text-xs text-text-muted">
                                    {formatDate(outfit.createdAt)}
                                </span>
                            </div>

                            <h1 className="font-display not-italic text-xl font-normal leading-tight text-text-primary sm:text-3xl sm:font-medium">
                                {outfit.title}
                            </h1>

                            {creatorId ? (
                                <Link
                                    to={`/community/creator/${creatorId}`}
                                    className="mt-4 flex items-center gap-3 group/creator"
                                >
                                    {outfit.user?.profilePicture?.url ? (
                                        <img
                                            src={outfit.user.profilePicture.url}
                                            alt=""
                                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-sm font-semibold uppercase text-accent-hover">
                                            {(outfit.user?.name || "C").slice(0, 1)}
                                        </span>
                                    )}
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold text-text-primary transition group-hover/creator:text-accent-hover">
                                            {outfit.user?.name || "Community member"}
                                        </span>
                                        <span className="block text-xs text-text-muted">
                                            Outfit creator
                                        </span>
                                    </span>
                                </Link>
                            ) : (
                                <div className="mt-4 flex items-center gap-3">
                                    {outfit.user?.profilePicture?.url ? (
                                        <img
                                            src={outfit.user.profilePicture.url}
                                            alt=""
                                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-sm font-semibold uppercase text-accent-hover">
                                            {(outfit.user?.name || "C").slice(0, 1)}
                                        </span>
                                    )}
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-text-primary">
                                            {outfit.user?.name || "Community member"}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            Outfit creator
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleToggleLike}
                                    disabled={
                                        !isAuthenticated ||
                                        interactionLoading ||
                                        authLoading ||
                                        (isAuthenticated && !interactionMatchesUser)
                                    }
                                    aria-pressed={liked}
                                    title={!isAuthenticated ? "Sign in to like this outfit" : undefined}
                                    className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                        liked
                                            ? "bg-accent-subtle text-accent-hover"
                                            : "border border-border bg-bg text-text-secondary hover:border-accent hover:text-accent-hover"
                                    }`}
                                >
                                    <Heart
                                        aria-hidden="true"
                                        className={`h-4 w-4 ${liked ? "fill-current" : ""}`}
                                    />
                                    <span>{outfit.likeCount ?? 0}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleToggleSave}
                                    disabled={
                                        !isAuthenticated ||
                                        interactionLoading ||
                                        authLoading ||
                                        (isAuthenticated && !interactionMatchesUser)
                                    }
                                    aria-pressed={saved}
                                    title={!isAuthenticated ? "Sign in to save this outfit" : undefined}
                                    className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                        saved
                                            ? "bg-accent-subtle text-accent-hover"
                                            : "border border-border bg-bg text-text-secondary hover:border-accent hover:text-accent-hover"
                                    }`}
                                >
                                    {saved ? (
                                        <BookmarkCheck aria-hidden="true" className="h-4 w-4" />
                                    ) : (
                                        <Bookmark aria-hidden="true" className="h-4 w-4" />
                                    )}
                                    <span>{outfit.saveCount ?? 0}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleComments}
                                    aria-expanded={commentsOpen}
                                    aria-controls="community-comments-panel"
                                    className={`inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:border-accent hover:text-accent-hover ${
                                        commentsOpen
                                            ? "bg-accent-subtle text-accent-hover"
                                            : "bg-bg text-text-secondary"
                                    }`}
                                >
                                    <MessageCircle aria-hidden="true" className="h-4 w-4" />
                                    {outfit.commentCount ?? 0}
                                </button>
                                {isOwner && (
                                    <>
                                        <Link
                                            to={`/community/${id}/edit`}
                                            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-bg px-4 text-sm font-medium text-text-secondary transition hover:border-accent hover:text-accent-hover"
                                        >
                                            <Pencil aria-hidden="true" className="h-4 w-4" />
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDeleteOutfitError("");
                                                setDeleteOutfitDialogOpen(true);
                                            }}
                                            disabled={deleteOutfitLoading}
                                            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-red-200 bg-bg px-4 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                                        >
                                            <Trash2
                                                aria-hidden="true"
                                                className={`h-4 w-4 ${deleteOutfitLoading ? "animate-pulse" : ""}`}
                                            />
                                            {deleteOutfitLoading ? "Deleting..." : "Delete"}
                                        </button>
                                    </>
                                )}
                            </div>

                            {outfit.description && (
                                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                                    {outfit.description}
                                </p>
                            )}

                            {(outfit.outfitType?.name ||
                                outfit.occasion?.name ||
                                outfit.gender) && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {[outfit.gender, outfit.outfitType?.name, outfit.occasion?.name]
                                        .filter(Boolean)
                                        .map((detail) => (
                                            <span
                                                key={detail}
                                                className="rounded-full bg-text-primary px-3.5 py-2 text-sm font-medium capitalize text-bg"
                                            >
                                                {detail}
                                            </span>
                                        ))}
                                </div>
                            )}

                            {!isAuthenticated && (
                                <p className="mt-3 text-xs text-text-muted">
                                    <Link to="/login" className="font-semibold text-accent-hover underline underline-offset-2">
                                        Sign in
                                    </Link>{" "}
                                    to like, save, or comment on this look.
                                </p>
                            )}

                            {interactionError && (
                                <p role="alert" className="mt-3 text-xs text-red-700">
                                    {interactionError}
                                </p>
                            )}
                            {deleteOutfitError && (
                                <p role="alert" className="mt-3 text-xs text-red-700">
                                    {deleteOutfitError}
                                </p>
                            )}

                            {Object.entries(productLinks).some(([, url]) => url) && (
                                <div className="mt-5 rounded-2xl bg-bg-subtle/70 p-4">
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-primary">
                                        Shop this look
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            ["topwear", "Get the topwear"],
                                            ["bottomwear", "Get the bottomwear"],
                                            ["footwear", "Get the footwear"],
                                        ].map(([key, label]) =>
                                            productLinks[key] ? (
                                                <a
                                                    key={key}
                                                    href={productLinks[key]}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-text-primary px-5 text-sm font-medium text-bg shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-md"
                                                >
                                                    {label}
                                                    <span aria-hidden="true" className="text-base">→</span>
                                                </a>
                                            ) : null,
                                        )}
                                    </div>
                                </div>
                            )}

                            {outfit.tags?.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {outfit.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-accent-subtle px-3 py-1.5 text-sm font-medium text-accent-hover"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>

                        {commentsOpen && (
                        <section
                            id="community-comments-panel"
                            className="border-t border-border pt-5"
                        >
                            <div className="mb-5 flex items-end justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                                        Community conversation
                                    </p>
                                    <h2 className="mt-1 font-display text-3xl italic text-text-primary">
                                        Comments
                                    </h2>
                                </div>
                                <span className="rounded-full bg-bg-subtle px-3 py-1 text-xs font-medium text-text-secondary">
                                    {outfit.commentCount ?? 0}
                                </span>
                            </div>

                            {isAuthenticated ? (
                                <form onSubmit={handleSubmitComment} className="mb-6">
                                    <label htmlFor="community-comment" className="sr-only">
                                        Write a comment
                                    </label>
                                    <div className="rounded-2xl border border-border bg-bg transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10">
                                        <textarea
                                            ref={commentInputRef}
                                            id="community-comment"
                                            value={commentText}
                                            onChange={(event) =>
                                                setCommentText(event.target.value)
                                            }
                                            maxLength={1000}
                                            rows={3}
                                            placeholder="Leave a kind note or ask about the look..."
                                            className="w-full resize-y bg-transparent px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
                                        />
                                        <div className="flex items-center justify-between border-t border-border px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <EmojiPickerButton
                                                    inputRef={commentInputRef}
                                                    maxLength={1000}
                                                    onChange={setCommentText}
                                                    value={commentText}
                                                />
                                                <span className="text-[10px] text-text-muted">
                                                    {commentText.length}/1000
                                                </span>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!commentText.trim() || commentSubmitting}
                                                className="inline-flex items-center gap-2 rounded-full bg-text-primary px-4 py-2 text-xs font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Send aria-hidden="true" className="h-3.5 w-3.5" />
                                                {commentSubmitting ? "Posting..." : "Comment"}
                                            </button>
                                        </div>
                                    </div>
                                    {commentActionError && (
                                        <p role="alert" className="mt-2 text-xs text-red-700">
                                            {commentActionError}
                                        </p>
                                    )}
                                </form>
                            ) : (
                                <div className="mb-6 rounded-2xl bg-bg-subtle/55 px-4 py-4 text-sm text-text-secondary">
                                    <Link to="/login" className="font-semibold text-accent-hover underline underline-offset-2">
                                        Sign in
                                    </Link>{" "}
                                    to join the conversation.
                                </div>
                            )}

                            {commentsLoading && comments.length === 0 && (
                                <p role="status" className="py-5 text-center text-sm text-text-muted">
                                    Loading comments...
                                </p>
                            )}

                            {commentsError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    <p role="alert">{commentsError}</p>
                                    <button
                                        type="button"
                                        onClick={() => loadComments(1)}
                                        className="mt-2 text-xs font-semibold underline underline-offset-2"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}

                            {!commentsLoading && !commentsError && comments.length === 0 && (
                                <p className="rounded-2xl bg-bg-subtle/45 px-4 py-6 text-center text-sm text-text-secondary">
                                    No comments yet. Be the first to share a kind thought.
                                </p>
                            )}

                            {comments.length > 0 && (
                                <div className="divide-y divide-border">
                                    {comments.map((comment) => {
                                        const commentUserId =
                                            typeof comment.user === "string"
                                                ? comment.user
                                                : comment.user?._id;
                                        const isCommentOwner =
                                            user?.id && commentUserId === user.id;

                                        return (
                                            <article
                                                key={comment._id}
                                                className="flex gap-3 py-4 first:pt-0"
                                            >
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-xs font-semibold uppercase text-accent-hover">
                                                    {(comment.user?.name || "C").slice(0, 1)}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                                        <p className="text-xs font-semibold text-text-primary">
                                                            {comment.user?.name || "Community member"}
                                                        </p>
                                                        <time
                                                            dateTime={comment.createdAt}
                                                            className="text-[10px] text-text-muted"
                                                        >
                                                            {formatDate(comment.createdAt)}
                                                        </time>
                                                        {isCommentOwner && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteComment(comment._id)
                                                                }
                                                                disabled={
                                                                    deletingCommentId === comment._id
                                                                }
                                                                aria-label="Delete your comment"
                                                                className="ml-auto rounded-full p-1 text-text-muted transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                                            >
                                                                <Trash2
                                                                    aria-hidden="true"
                                                                    className="h-3.5 w-3.5"
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                                                        {comment.text}
                                                    </p>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}

                            {commentsHaveMore && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        loadComments(commentsPage + 1, true)
                                    }
                                    disabled={commentsLoading}
                                    className="mt-4 w-full rounded-full border border-border py-2.5 text-xs font-semibold text-text-secondary transition hover:border-accent hover:text-accent-hover disabled:opacity-50"
                                >
                                    {commentsLoading ? "Loading..." : "Load more comments"}
                                </button>
                            )}
                        </section>
                        )}
                    </div>
                    </section>
                </RelatedCommunityOutfits>
            </div>
            {isOwner && deleteOutfitDialogOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !deleteOutfitLoading
                        ) {
                            setDeleteOutfitDialogOpen(false);
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
                                {outfit.title}
                            </span>{" "}
                            and its community interactions will be permanently removed.
                        </p>
                        {deleteOutfitError && (
                            <p
                                role="alert"
                                className="mt-4 text-center text-xs text-red-700"
                            >
                                {deleteOutfitError}
                            </p>
                        )}
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                            <button
                                type="button"
                                onClick={() => setDeleteOutfitDialogOpen(false)}
                                disabled={deleteOutfitLoading}
                                className="min-h-11 rounded-full border border-border px-5 text-sm font-medium text-text-secondary transition hover:border-accent hover:text-accent-hover disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteOutfit}
                                disabled={deleteOutfitLoading}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
                            >
                                <Trash2
                                    aria-hidden="true"
                                    className={`h-4 w-4 ${deleteOutfitLoading ? "animate-pulse" : ""}`}
                                />
                                {deleteOutfitLoading
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

export default CommunityOutfitDetails;
