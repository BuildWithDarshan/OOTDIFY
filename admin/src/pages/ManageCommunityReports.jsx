import { useCallback, useEffect, useState } from "react";
import {
    Eye,
    EyeOff,
    ExternalLink,
    LoaderCircle,
    ShieldCheck,
} from "lucide-react";
import {
    getCommunityReports,
    reviewCommunityReport,
    setCommunityOutfitVisibility,
} from "../services/communityReportService.js";

const PAGE_SIZE = 20;
const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL?.replace(/\/+$/, "");
const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "actioned", label: "Actioned" },
    { value: "dismissed", label: "Dismissed" },
    { value: "all", label: "All reports" },
];
const REASON_LABELS = {
    spam: "Spam or misleading",
    inappropriate: "Inappropriate content",
    copyright: "Copyright concern",
    harassment: "Harassment",
    other: "Other",
};

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
};

const statusClass = (status) => {
    if (status === "pending") return "bg-amber-100 text-amber-800";
    if (status === "actioned") return "bg-red-100 text-red-800";
    return "bg-bg-subtle text-text-secondary";
};

const ManageCommunityReports = () => {
    const [reports, setReports] = useState([]);
    const [status, setStatus] = useState("pending");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [busyReportId, setBusyReportId] = useState("");
    const [notes, setNotes] = useState({});
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        Promise.resolve().then(async () => {
            if (cancelled) return;
            setLoading(true);
            setError("");
            try {
                const data = await getCommunityReports({
                    status,
                    page,
                    limit: PAGE_SIZE,
                });
                if (cancelled) return;
                setReports(data.reports || []);
                setPagination(data.pagination || null);
            } catch (requestError) {
                if (!cancelled) {
                    setError(
                        requestError.response?.data?.message ||
                            "Community reports could not be loaded.",
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [page, refreshKey, status]);

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setPage(1);
        setActionError("");
    };

    const handleReview = async (report, nextStatus) => {
        if (busyReportId) return;
        setBusyReportId(report._id);
        setActionError("");

        try {
            const data = await reviewCommunityReport(report._id, {
                status: nextStatus,
                moderatorNote: notes[report._id] || "",
            });
            if (status === "all") {
                setReports((current) =>
                    current.map((item) =>
                        item._id === report._id
                            ? {
                                  ...item,
                                  status: data.report.status,
                                  moderatorNote: data.report.moderatorNote,
                                  reviewedAt: data.report.reviewedAt,
                              }
                            : item,
                    ),
                );
            } else {
                setReports((current) =>
                    current.filter((item) => item._id !== report._id),
                );
                setPagination((current) =>
                    current
                        ? { ...current, total: Math.max(0, current.total - 1) }
                        : current,
                );
            }
            setNotes((current) => {
                const updated = { ...current };
                delete updated[report._id];
                return updated;
            });
        } catch (requestError) {
            setActionError(
                requestError.response?.data?.message ||
                    "The report could not be reviewed. Please try again.",
            );
        } finally {
            setBusyReportId("");
        }
    };

    const handleVisibility = async (report) => {
        const outfit = report.outfit;
        if (!outfit?._id || busyReportId) return;
        setBusyReportId(report._id);
        setActionError("");

        try {
            const data = await setCommunityOutfitVisibility(
                outfit._id,
                !outfit.isVisible,
            );
            setReports((current) =>
                current.map((item) =>
                    item._id === report._id
                        ? {
                              ...item,
                              outfit: {
                                  ...item.outfit,
                                  isVisible: data.outfit.isVisible,
                              },
                          }
                        : item,
                ),
            );
        } catch (requestError) {
            setActionError(
                requestError.response?.data?.message ||
                    "Outfit visibility could not be updated.",
            );
        } finally {
            setBusyReportId("");
        }
    };

    const retry = useCallback(() => {
        setRefreshKey((current) => current + 1);
    }, []);

    return (
        <div className="mx-auto w-full max-w-7xl">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-hover">
                        Community safety
                    </p>
                    <h1 className="mt-1 font-display text-3xl text-text-primary sm:text-4xl">
                        Outfit reports
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                        Review reports submitted by community members and decide whether
                        to dismiss them, record action, or hide the reported outfit.
                    </p>
                </div>
                <label className="block w-full sm:w-52">
                    <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                        Show reports
                    </span>
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="min-h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </header>

            {actionError && (
                <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                    {actionError}
                </div>
            )}

            {loading && (
                <div role="status" className="flex items-center gap-2 py-12 text-sm text-text-secondary">
                    <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                    Loading reports...
                </div>
            )}

            {!loading && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
                    <p role="alert">{error}</p>
                    <button
                        type="button"
                        onClick={retry}
                        className="mt-3 font-semibold underline underline-offset-2"
                    >
                        Try again
                    </button>
                </div>
            )}

            {!loading && !error && reports.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border-strong bg-bg px-5 py-14 text-center">
                    <ShieldCheck
                        aria-hidden="true"
                        className="mx-auto h-8 w-8 text-accent-hover"
                    />
                    <h2 className="mt-3 font-display text-2xl text-text-primary">
                        No {status === "all" ? "" : `${status} `}reports
                    </h2>
                    <p className="mt-1 text-sm text-text-secondary">
                        Reports matching this status will appear here.
                    </p>
                </div>
            )}

            {!loading && !error && reports.length > 0 && (
                <div className="space-y-4">
                    {reports.map((report) => {
                        const outfit = report.outfit;
                        const reporter =
                            typeof report.user === "object" ? report.user : null;
                        const creator =
                            typeof outfit?.user === "object" ? outfit.user : null;
                        const isPending = report.status === "pending";
                        const isBusy = busyReportId === report._id;

                        return (
                            <article
                                key={report._id}
                                className="overflow-hidden rounded-2xl border border-border bg-bg shadow-sm"
                            >
                                <div className="grid gap-0 md:grid-cols-[200px_minmax(0,1fr)]">
                                    <div className="relative min-h-48 bg-bg-subtle md:min-h-full">
                                        {outfit?.image?.url ? (
                                            <img
                                                src={outfit.image.url}
                                                alt={outfit.title || "Reported community outfit"}
                                                className="absolute inset-0 h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full min-h-48 items-center justify-center text-sm text-text-muted">
                                                Outfit unavailable
                                            </div>
                                        )}
                                        {outfit && (
                                            <span
                                                className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                                    outfit.isVisible
                                                        ? "bg-white/90 text-accent-hover"
                                                        : "bg-red-700 text-white"
                                                }`}
                                            >
                                                {outfit.isVisible ? "Visible" : "Hidden"}
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-w-0 p-4 sm:p-5">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="font-display text-xl text-text-primary">
                                                        {outfit?.title || "Deleted outfit"}
                                                    </h2>
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusClass(report.status)}`}
                                                    >
                                                        {report.status}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-text-muted">
                                                    Reported {formatDate(report.createdAt)}
                                                </p>
                                            </div>
                                            {outfit?._id && PUBLIC_SITE_URL && (
                                                <a
                                                    href={`${PUBLIC_SITE_URL}/community/${outfit._id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium text-text-secondary transition hover:border-accent hover:text-accent-hover"
                                                >
                                                    View outfit
                                                    <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-xl bg-bg-subtle/70 p-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                                                    Reason
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-text-primary">
                                                    {REASON_LABELS[report.reason] || report.reason}
                                                </p>
                                            </div>
                                            <div className="rounded-xl bg-bg-subtle/70 p-3">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                                                    Reported by
                                                </p>
                                                <p className="mt-1 truncate text-sm font-semibold text-text-primary">
                                                    {reporter?.name || "Community member"}
                                                </p>
                                                {reporter?.email && (
                                                    <p className="truncate text-xs text-text-muted">
                                                        {reporter.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3 text-xs text-text-secondary">
                                            Creator: {creator?.name || "Unavailable"}
                                        </div>
                                        <div className="mt-3 rounded-xl border border-border/70 p-3">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                                                Reporter details
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                                                {report.details || "No additional details provided."}
                                            </p>
                                        </div>

                                        {report.moderatorNote && (
                                            <p className="mt-3 text-xs leading-5 text-text-muted">
                                                Moderator note: {report.moderatorNote}
                                            </p>
                                        )}

                                        {outfit?._id && (
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleVisibility(report)}
                                                    disabled={isBusy || Boolean(busyReportId)}
                                                    className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
                                                        outfit.isVisible
                                                            ? "border-red-200 text-red-700 hover:bg-red-50"
                                                            : "border-border text-text-secondary hover:border-accent hover:text-accent-hover"
                                                    }`}
                                                >
                                                    {outfit.isVisible ? (
                                                        <EyeOff aria-hidden="true" className="h-4 w-4" />
                                                    ) : (
                                                        <Eye aria-hidden="true" className="h-4 w-4" />
                                                    )}
                                                    {outfit.isVisible ? "Hide outfit" : "Restore outfit"}
                                                </button>
                                            </div>
                                        )}

                                        {isPending && (
                                            <>
                                                <label className="mt-4 block">
                                                    <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                                                        Moderator note · Optional
                                                    </span>
                                                    <textarea
                                                        value={notes[report._id] || ""}
                                                        onChange={(event) =>
                                                            setNotes((current) => ({
                                                                ...current,
                                                                [report._id]: event.target.value,
                                                            }))
                                                        }
                                                        maxLength={1000}
                                                        rows={2}
                                                        placeholder="Record why this report was dismissed or actioned"
                                                        className="w-full resize-y rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent focus:ring-4 focus:ring-accent/10"
                                                    />
                                                </label>
                                                <div className="mt-3 flex flex-wrap justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReview(report, "dismissed")}
                                                        disabled={isBusy || Boolean(busyReportId)}
                                                        className="min-h-10 rounded-full border border-border px-4 text-xs font-semibold text-text-secondary transition hover:border-accent hover:text-accent-hover disabled:cursor-wait disabled:opacity-60"
                                                    >
                                                        Dismiss report
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReview(report, "actioned")}
                                                        disabled={isBusy || Boolean(busyReportId)}
                                                        className="inline-flex min-h-10 items-center gap-2 rounded-full bg-red-700 px-4 text-xs font-semibold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
                                                    >
                                                        {isBusy && (
                                                            <LoaderCircle
                                                                aria-hidden="true"
                                                                className="h-3.5 w-3.5 animate-spin"
                                                            />
                                                        )}
                                                        Mark actioned
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {!loading && !error && pagination?.total > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-text-muted">
                        {pagination.total} report{pagination.total === 1 ? "" : "s"} · Page{" "}
                        {pagination.page} of {Math.max(1, pagination.totalPages)}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={page <= 1}
                            className="min-h-10 rounded-full border border-border px-4 text-xs font-semibold text-text-secondary hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={!pagination.hasMore}
                            className="min-h-10 rounded-full border border-border px-4 text-xs font-semibold text-text-secondary hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCommunityReports;
