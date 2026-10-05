import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { reportCommunityOutfit } from "../services/communityInteractionService.js";

const REPORT_REASONS = [
    { value: "spam", label: "Spam or misleading" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "copyright", label: "Copyright concern" },
    { value: "harassment", label: "Harassment" },
    { value: "other", label: "Other" },
];

const CommunityOutfitReport = ({
    outfit,
    compact = false,
    iconOnly = false,
    menuItem = false,
    onOpen,
}) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("inappropriate");
    const [details, setDetails] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const ownerId = outfit?.user?._id || outfit?.user;

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !submitting) setIsOpen(false);
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, submitting]);

    const handleOpen = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        setError("");
        onOpen?.();
        setIsOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            await reportCommunityOutfit({
                outfitId: outfit._id,
                reason,
                details: details.trim(),
            });
            setSubmitted(true);
            setIsOpen(false);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Your report could not be submitted. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (user?.id && ownerId && user.id === ownerId) return null;

    if (submitted) {
        return (
            <span role="status" className="text-xs font-medium text-accent-hover">
                Report submitted
            </span>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                aria-label={`Report ${outfit.title}`}
                title="Report this outfit"
                className={
                    menuItem
                        ? "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-primary transition hover:bg-bg-subtle hover:text-red-700"
                        : compact
                        ? "absolute left-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/90 text-text-primary shadow-md backdrop-blur transition hover:scale-105 hover:bg-white hover:text-red-700 sm:left-3 sm:top-3 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                        : iconOnly
                          ? "inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-subtle hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          : "inline-flex items-center gap-2 text-xs font-medium text-text-muted transition hover:text-text-secondary"
                }
            >
                <ShieldAlert aria-hidden="true" className="h-4 w-4" />
                {menuItem
                    ? "Report this outfit"
                    : !compact && !iconOnly && "Report this outfit"}
            </button>

            {isOpen &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                        onMouseDown={(event) => {
                            if (
                                event.target === event.currentTarget &&
                                !submitting
                            ) {
                                setIsOpen(false);
                            }
                        }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="community-report-title"
                            className="w-full max-w-md rounded-2xl border border-border bg-bg p-5 shadow-2xl sm:p-6"
                        >
                            <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                    <h2
                                        id="community-report-title"
                                        className="font-display text-2xl italic text-text-primary"
                                    >
                                        Report this outfit
                                    </h2>
                                    <p className="mt-1 line-clamp-2 text-xs text-text-muted">
                                        {outfit.title}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    disabled={submitting}
                                    aria-label="Close report dialog"
                                    className="rounded-full px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-subtle disabled:opacity-60"
                                >
                                    Close
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                                        Why are you reporting this?
                                    </span>
                                    <select
                                        value={reason}
                                        onChange={(event) =>
                                            setReason(event.target.value)
                                        }
                                        className="min-h-11 w-full rounded-xl border border-border bg-bg px-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
                                    >
                                        {REPORT_REASONS.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                                        Details{" "}
                                        <span className="text-text-muted">
                                            · Optional
                                        </span>
                                    </span>
                                    <textarea
                                        value={details}
                                        onChange={(event) =>
                                            setDetails(event.target.value)
                                        }
                                        maxLength={1000}
                                        rows={3}
                                        placeholder="Add context for the review team"
                                        className="w-full resize-y rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent focus:ring-4 focus:ring-accent/10"
                                    />
                                </label>
                                {error && (
                                    <p role="alert" className="text-xs text-red-700">
                                        {error}
                                    </p>
                                )}
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        disabled={submitting}
                                        className="rounded-full px-4 py-2.5 text-xs font-medium text-text-secondary hover:bg-bg-subtle disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="rounded-full bg-text-primary px-4 py-2.5 text-xs font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
                                    >
                                        {submitting
                                            ? "Submitting..."
                                            : "Submit report"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>,
                    document.body,
                )}
        </>
    );
};

export default CommunityOutfitReport;
