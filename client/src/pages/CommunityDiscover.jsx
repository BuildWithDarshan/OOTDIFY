import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Bookmark,
    BookmarkCheck,
    Heart,
    MessageCircle,
    Plus,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import Select from "react-select";
import { getCommunityOutfits } from "../services/communityOutfitService.js";
import { toggleCommunitySave } from "../services/communityInteractionService.js";
import { getOccasions, getOutfitTypes } from "../services/taxonomyService.js";
import { useAuth } from "../context/AuthContext.jsx";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
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

const getSelectStyles = (compact = false) => ({
    container: (base) => ({
        ...base,
        width: "100%",
        minWidth: compact ? 0 : 175,
    }),
    control: (base, state) => ({
        ...base,
        minHeight: compact ? 42 : 46,
        borderRadius: 999,
        borderColor: state.isFocused ? "#40916c" : "#b7e4c7",
        backgroundColor: "#ffffff",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(64,145,108,.12)" : "none",
        cursor: "pointer",
        transition: "border-color 180ms ease, box-shadow 180ms ease",
        ":hover": { borderColor: "#40916c" },
    }),
    valueContainer: (base) => ({ ...base, padding: "0 14px" }),
    placeholder: (base) => ({
        ...base,
        color: "#52b788",
        fontSize: 12,
        whiteSpace: "nowrap",
    }),
    singleValue: (base) => ({
        ...base,
        color: "#081c15",
        fontSize: 12,
        fontWeight: 500,
    }),
    input: (base) => ({ ...base, color: "#081c15", fontSize: 12 }),
    indicatorsContainer: (base) => ({ ...base, color: "#40916c" }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: "0 12px 0 4px",
        color: "#40916c",
        ":hover": { color: "#2d6a4f" },
    }),
    clearIndicator: (base) => ({
        ...base,
        padding: 4,
        color: "#718078",
        ":hover": { color: "#081c15" },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 80 }),
    menu: (base) => ({
        ...base,
        overflow: "hidden",
        border: "1px solid #b7e4c7",
        borderRadius: 14,
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 45px rgba(8,28,21,.16)",
    }),
    menuList: (base) => ({ ...base, padding: 6 }),
    option: (base, state) => ({
        ...base,
        marginBlock: 2,
        borderRadius: 9,
        backgroundColor: state.isSelected
            ? "#1b4332"
            : state.isFocused
              ? "#d8f3dc"
              : "transparent",
        color: state.isSelected ? "#ffffff" : "#173328",
        cursor: "pointer",
        fontSize: 12,
    }),
    noOptionsMessage: (base) => ({ ...base, color: "#718078", fontSize: 12 }),
});

const selectCommonProps = {
    isSearchable: true,
    menuPosition: "fixed",
    menuPortalTarget: typeof document !== "undefined" ? document.body : null,
    noOptionsMessage: () => "No matching options",
};

const CommunityCard = ({ outfit }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [saved, setSaved] = useState(false);
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

        setSaving(true);
        setSaveError("");
        try {
            const data = await toggleCommunitySave(outfit._id);
            setSaved(Boolean(data.saved));
        } catch (error) {
            setSaveError(
                error.response?.data?.message || "Could not update saved outfit.",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <article className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-border/70 bg-bg shadow-[0_8px_28px_rgba(8,28,21,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(8,28,21,0.11)] sm:mb-4">
            <Link
                to={`/community/${outfit._id}`}
                className="block"
                aria-label={`View ${outfit.title}`}
            >
                <div className="relative overflow-hidden bg-bg-subtle">
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
                onClick={handleSave}
                disabled={saving}
                aria-label={saved ? "Remove from saved outfits" : "Save outfit"}
                aria-pressed={saved}
                title={
                    saveError ||
                    (saved ? "Remove from saved outfits" : "Save outfit")
                }
                className={`absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-text-primary shadow-md backdrop-blur transition duration-200 hover:scale-105 hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:right-3 sm:top-3 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 ${
                    saved ? "text-accent-hover sm:opacity-100" : ""
                }`}
            >
                {saved ? (
                    <BookmarkCheck aria-hidden="true" className="h-4 w-4" />
                ) : (
                    <Bookmark aria-hidden="true" className="h-4 w-4" />
                )}
            </button>

            <div className="p-3 sm:p-3.5">
                <Link to={`/community/${outfit._id}`} className="block">
                    <h2 className="line-clamp-2 font-display text-lg leading-tight text-text-primary sm:text-xl">
                        {outfit.title}
                    </h2>
                </Link>
                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border/70 pt-2.5 text-[11px] text-text-muted sm:hidden">
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
                            onClick={(event) => event.stopPropagation()}
                            className="max-w-[55%] truncate text-right text-text-secondary transition hover:text-accent-hover"
                        >
                            By {outfit.user?.name || "Community member"}
                        </Link>
                    ) : (
                        <span className="max-w-[55%] truncate text-right text-text-secondary">
                            By {outfit.user?.name || "Community member"}
                        </span>
                    )}
                </div>
                {outfit.user?._id ? (
                    <Link
                        to={`/community/creator/${outfit.user._id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="mt-3 hidden min-w-0 items-center gap-2.5 border-t border-border/70 pt-3 transition sm:flex"
                    >
                        {outfit.user.profilePicture?.url ? (
                            <img
                                src={outfit.user.profilePicture.url}
                                alt=""
                                loading="lazy"
                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-xs font-semibold uppercase text-accent-hover">
                                {(outfit.user.name || "C").slice(0, 1)}
                            </span>
                        )}
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-text-secondary transition hover:text-accent-hover">
                            {outfit.user.name || "Community member"}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-2 text-[10px] text-text-muted">
                            <span className="inline-flex items-center gap-1">
                                <Heart
                                    aria-hidden="true"
                                    className="h-3 w-3"
                                />
                                {outfit.likeCount ?? 0}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <MessageCircle
                                    aria-hidden="true"
                                    className="h-3 w-3"
                                />
                                {outfit.commentCount ?? 0}
                            </span>
                        </span>
                    </Link>
                ) : null}
                {saveError && (
                    <span role="status" className="mt-2 block text-[10px] text-red-700">
                        {saveError}
                    </span>
                )}
            </div>
        </article>
    );
};

const CommunityCardSkeleton = () => (
    <div
        aria-hidden="true"
        className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border/70 bg-bg sm:mb-5"
    >
        <div className="aspect-[4/5] animate-pulse bg-bg-subtle" />
        <div className="space-y-3 p-3.5">
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-bg-subtle" />
            <div className="flex justify-between">
                <div className="h-3 w-1/4 animate-pulse rounded-full bg-bg-subtle" />
                <div className="h-3 w-2/5 animate-pulse rounded-full bg-bg-subtle" />
            </div>
        </div>
    </div>
);

const CommunityDiscover = () => {
    const { user, isAuthenticated } = useAuth();
    const [outfits, setOutfits] = useState([]);
    const [categories, setCategories] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [gender, setGender] = useState("");
    const [category, setCategory] = useState("");
    const [occasion, setOccasion] = useState("");
    const [sort, setSort] = useState("latest");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);
    const [taxonomyError, setTaxonomyError] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const sentinelRef = useRef(null);
    const requestIdRef = useRef(0);
    const loadingMoreRef = useRef(false);
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
    const selectedGender =
        GENDER_OPTIONS.find((option) => option.value === gender) || null;
    const selectedCategory =
        categoryOptions.find((option) => option.value === category) || null;
    const selectedOccasion =
        occasionOptions.find((option) => option.value === occasion) || null;
    const selectedSort =
        SORT_OPTIONS.find((option) => option.value === sort) || SORT_OPTIONS[0];

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
                if (!cancelled) setTaxonomyError(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const requestId = ++requestIdRef.current;
        let cancelled = false;

        loadingMoreRef.current = false;
        Promise.resolve().then(() => {
            if (cancelled) return;
            setLoading(true);
            setLoadingMore(false);
            setError(false);
            setPage(1);
            setHasMore(false);
        });

        getCommunityOutfits({
            ...query,
            page: 1,
            limit: PAGE_SIZE,
        })
            .then((data) => {
                if (cancelled || requestId !== requestIdRef.current) return;
                setOutfits(data.outfits || []);
                setHasMore(Boolean(data.pagination?.hasMore));
            })
            .catch(() => {
                if (!cancelled && requestId === requestIdRef.current) {
                    setError(true);
                }
            })
            .finally(() => {
                if (!cancelled && requestId === requestIdRef.current) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [query, refreshKey]);

    const loadMore = useCallback(async () => {
        if (loading || loadingMoreRef.current || !hasMore || error) return;

        const requestId = requestIdRef.current;
        loadingMoreRef.current = true;
        setLoadingMore(true);

        try {
            const nextPage = page + 1;
            const data = await getCommunityOutfits({
                ...query,
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
        } catch {
            if (requestId === requestIdRef.current) {
                setError(true);
            }
        } finally {
            if (requestId === requestIdRef.current) {
                loadingMoreRef.current = false;
                setLoadingMore(false);
            }
        }
    }, [
        error,
        hasMore,
        loading,
        page,
        query,
    ]);

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
        setError(false);
        if (outfits.length > 0) {
            setHasMore(true);
            return;
        }

        setLoading(true);
        setRefreshKey((key) => key + 1);
    };

    const clearFilters = () => {
        setSearchInput("");
        setGender("");
        setCategory("");
        setOccasion("");
        setSort("latest");
    };

    const hasActiveFilters = Boolean(
        search || gender || category || occasion || sort !== "latest",
    );

    return (
        <main className="min-h-screen bg-bg pb-16">
            <Link
                to={
                    isAuthenticated && user?.id
                        ? `/community/creator/${user.id}`
                        : "/login"
                }
                aria-label={
                    isAuthenticated
                        ? `${user?.name || "Your"} creator profile`
                        : "Log in to OOTDIFY"
                }
                title={isAuthenticated ? user?.name || "Your profile" : "Log in"}
                className="fixed right-3 top-3 z-40 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-bg shadow-sm transition hover:border-accent lg:hidden"
            >
                {user?.profilePicture?.url ? (
                    <img
                        src={user.profilePicture.url}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="flex h-full w-full items-center justify-center bg-bg-subtle text-xs font-semibold uppercase text-accent-hover">
                        {(user?.name || (isAuthenticated ? "U" : "G")).slice(0, 1)}
                    </span>
                )}
            </Link>
            <div className="fixed right-5 top-4 z-40 hidden items-center gap-2 lg:flex">
                <button
                    type="button"
                    onClick={() => {
                        setSearchOpen((current) => !current);
                        setFiltersOpen(false);
                    }}
                    aria-label={searchOpen ? "Close search" : "Search outfits"}
                    aria-expanded={searchOpen}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition ${
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
                    aria-label={filtersOpen ? "Close filters" : "Open filters"}
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
                        <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                    )}
                    {hasActiveFilters && (
                        <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-bg" />
                    )}
                </button>
                <Link
                    to={
                        isAuthenticated && user?.id
                            ? `/community/creator/${user.id}`
                            : "/login"
                    }
                    aria-label={
                        isAuthenticated
                            ? `${user?.name || "Your"} creator profile`
                            : "Log in to OOTDIFY"
                    }
                    className="inline-flex max-w-48 items-center gap-2 rounded-full border border-border bg-bg py-1.5 pl-1.5 pr-3 transition hover:border-accent hover:bg-bg-subtle"
                >
                    {user?.profilePicture?.url ? (
                        <img
                            src={user.profilePicture.url}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
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

            <section
                aria-label="Discover community outfits"
                className="mx-auto w-full px-3 pt-28 sm:px-4 sm:pt-28 lg:px-5"
            >
                <div className="mb-5">
                    <div className="flex min-h-12 flex-col items-center gap-3 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
                        <div className="min-w-0">
                            <h1 className="font-display text-3xl italic leading-none text-text-primary sm:text-4xl">
                                Community Feed
                            </h1>
                            <p className="mt-1.5 text-[11px] text-text-muted sm:text-xs">
                                Discover outfits shared by OOTDIFY creators.
                            </p>
                        </div>
                        <Link
                            to="/community/create"
                            className="hidden min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-text-primary px-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-bg transition hover:bg-accent-hover lg:inline-flex"
                        >
                            <Plus
                                aria-hidden="true"
                                className="h-4 w-4 shrink-0"
                            />
                            Create your outfit
                        </Link>
                    </div>
                    <div className="mt-3 flex w-full items-center justify-between gap-2 lg:hidden">
                        <Link
                            to="/community/create"
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-text-primary px-3 text-[9px] font-semibold uppercase tracking-[0.04em] text-bg transition hover:bg-accent-hover"
                        >
                            <Plus aria-hidden="true" className="h-4 w-4 shrink-0" />
                            Create your outfit
                        </Link>
                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchOpen((current) => !current);
                                    setFiltersOpen(false);
                                }}
                                aria-label={searchOpen ? "Close search" : "Search outfits"}
                                aria-expanded={searchOpen}
                                className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition ${
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
                                aria-label={filtersOpen ? "Close filters" : "Open filters"}
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
                        </div>
                    </div>

                    {searchOpen && (
                        <div className="relative mt-3 lg:fixed lg:left-[18rem] lg:right-[19rem] lg:top-4 lg:z-40 lg:mt-0">
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
                                aria-label="Search community outfits"
                                className="min-h-12 w-full rounded-2xl border border-border bg-bg pl-11 pr-4 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/15"
                            />
                        </div>
                    )}

                    {filtersOpen && (
                        <div className="mt-3 rounded-2xl border border-border bg-bg p-3 shadow-[0_12px_36px_rgba(8,28,21,0.08)] sm:p-4 lg:fixed lg:left-[18rem] lg:right-[19rem] lg:top-4 lg:z-40 lg:mt-0">
                            <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                                <Select
                                    {...selectCommonProps}
                                    value={selectedGender}
                                    onChange={(option) =>
                                        setGender(option?.value || "")
                                    }
                                    options={GENDER_OPTIONS}
                                    aria-label="Filter by gender"
                                    placeholder="All styles"
                                    styles={getSelectStyles(true)}
                                />
                                <Select
                                    {...selectCommonProps}
                                    value={selectedCategory}
                                    onChange={(option) =>
                                        setCategory(option?.value || "")
                                    }
                                    options={categoryOptions}
                                    aria-label="Filter by category"
                                    placeholder="All categories"
                                    isClearable
                                    styles={getSelectStyles(true)}
                                />
                                <Select
                                    {...selectCommonProps}
                                    value={selectedOccasion}
                                    onChange={(option) =>
                                        setOccasion(option?.value || "")
                                    }
                                    options={occasionOptions}
                                    aria-label="Filter by occasion"
                                    placeholder="All occasions"
                                    isClearable
                                    styles={getSelectStyles(true)}
                                />
                                <Select
                                    {...selectCommonProps}
                                    value={selectedSort}
                                    onChange={(option) =>
                                        setSort(option?.value || "latest")
                                    }
                                    options={SORT_OPTIONS}
                                    aria-label="Sort outfits"
                                    isSearchable={false}
                                    styles={getSelectStyles(true)}
                                />
                            </div>
                            {(hasActiveFilters || taxonomyError) && (
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                    {taxonomyError && (
                                        <p
                                            role="status"
                                            className="text-xs text-text-muted"
                                        >
                                            Category or occasion filters could not be loaded.
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

                </div>

                {loading && outfits.length === 0 && (
                    <div
                        role="status"
                        aria-label="Loading community outfits"
                        className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-5 lg:gap-4"
                    >
                        {Array.from({ length: 5 }, (_, index) => (
                            <CommunityCardSkeleton key={index} />
                        ))}
                    </div>
                )}

                {!loading && error && outfits.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="font-display text-3xl text-text-primary">
                            The feed didn’t load.
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">
                            Please check your connection and try again.
                        </p>
                        <button
                            type="button"
                            onClick={retry}
                            className="mt-5 rounded-full bg-text-primary px-5 py-2.5 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && outfits.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-border-strong bg-bg-subtle/40 px-5 py-16 text-center">
                        <p className="font-display text-3xl text-text-primary">
                            No looks found just yet.
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
                            Try another search or clear a filter to see more
                            community inspiration.
                        </p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-5 text-sm font-semibold text-accent-hover underline underline-offset-4"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {outfits.length > 0 && (
                    <div
                        aria-label="Community outfit results"
                        className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-5 lg:gap-4"
                    >
                        {outfits.map((outfit) => (
                            <CommunityCard key={outfit._id} outfit={outfit} />
                        ))}
                        {loadingMore &&
                            Array.from({ length: 5 }, (_, index) => (
                                <CommunityCardSkeleton key={`loading-${index}`} />
                            ))}
                    </div>
                )}

                {error && outfits.length > 0 && (
                    <div className="py-7 text-center">
                        <p className="text-sm text-text-secondary">
                            Could not load more outfits.
                        </p>
                        <button
                            type="button"
                            onClick={retry}
                            className="mt-2 text-sm font-semibold text-accent-hover underline underline-offset-4"
                        >
                            Try again
                        </button>
                    </div>
                )}

                <div ref={sentinelRef} aria-hidden="true" className="h-1" />

                {!hasMore && outfits.length > 0 && !loading && (
                    <p className="py-8 text-center text-xs uppercase tracking-[0.16em] text-text-muted">
                        You’re all caught up
                    </p>
                )}
            </section>
        </main>
    );
};

export default CommunityDiscover;
