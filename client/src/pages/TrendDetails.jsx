import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { getTrendById } from "../services/trendService.js";
import OutfitCard from "../components/Outfit/OutfitCard.jsx";
import PageMeta from "../components/Common/PageMeta.jsx";

const TrendDetails = () => {
  const { id } = useParams();
  const [trend, setTrend] = useState(null);
  const [notFoundId, setNotFoundId] = useState(null);
  const loading = trend?._id !== id && notFoundId !== id;
  const notFound = notFoundId === id;

  useEffect(() => {
    let cancelled = false;

    getTrendById(id)
      .then((data) => {
        if (!cancelled) setTrend(data.trend);
      })
      .catch(() => {
        if (!cancelled) setNotFoundId(id);
      });

    window.scrollTo({ top: 0, behavior: "instant" });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <>
      <PageMeta
        title="Fashion Trend Details | OOTDIFY"
        description="Explore this fashion trend, discover how to style it, and find related curated outfits."
      />
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="text-sm text-text-muted">Loading trend...</span>
      </div>
      </>
    );
  }

  if (notFound || !trend) {
    return (
      <>
      <PageMeta
        title="Trend Not Found | OOTDIFY"
        description="The requested OOTDIFY fashion trend could not be found."
        noIndex
      />
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-text-secondary">This trend couldn&apos;t be found.</p>
        <Link
          to="/trends"
          className="inline-flex items-center gap-2 text-sm text-accent-hover hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trends
        </Link>
      </div>
      </>
    );
  }

  return (
    <main>
      <PageMeta
        title={`${trend.title} | OOTDIFY`}
        description={trend.description || `Discover ${trend.title}, styling guidance, and related curated outfits on OOTDIFY.`}
        image={trend.coverImage?.url || trend.coverImage || trend.image?.url || trend.image}
      />
      <style>{`
        @keyframes trendDetailsSlideLeft {
          from {
            opacity: 0;
            transform: translate3d(-42px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes trendDetailsSlideRight {
          from {
            opacity: 0;
            transform: translate3d(42px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes trendDetailsTipReveal {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes trendDetailsFadeUp {
          from {
            opacity: 0;
            transform: translate3d(0, 28px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .trend-details-left {
          animation: trendDetailsSlideLeft 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .trend-details-right {
          animation: trendDetailsSlideRight 700ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both;
        }

        .trend-details-tip {
          animation: trendDetailsTipReveal 550ms cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: var(--tip-delay);
        }

        .trend-details-related {
          animation: trendDetailsFadeUp 700ms cubic-bezier(0.16, 1, 0.3, 1) 350ms both;
        }

        .trend-details-outfit {
          animation: trendDetailsTipReveal 550ms cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: var(--outfit-delay);
        }

        @media (prefers-reduced-motion: reduce) {
          .trend-details-left,
          .trend-details-right,
          .trend-details-tip,
          .trend-details-related,
          .trend-details-outfit {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto mt-15 max-w-6xl px-4 py-6 sm:px-6 sm:py-10 md:px-10">
        <Link
          to="/trends"
          className="group mb-6 hidden items-center gap-2 rounded-full border border-transparent px-1 py-2 text-xs font-medium text-text-secondary transition-all duration-300 hover:gap-2.5 hover:text-accent-hover md:inline-flex md:text-sm"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg transition-all duration-300 group-hover:border-accent group-hover:bg-bg-subtle">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          </span>
          Back to Trends
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: existing image, title and gender treatment */}
          <section className="trend-details-left lg:sticky lg:top-6 lg:self-start">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[var(--color-bg-subtle)]">
              <img
                src={trend.coverImage?.url || trend.coverImage}
                alt={trend.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                {trend.gender && (
                  <span className="mb-3 inline-block rounded-full bg-bg/85 px-3 py-1 text-[10px] font-medium capitalize tracking-wide text-text-primary backdrop-blur-sm">
                    {trend.gender}
                  </span>
                )}
                <h1 className="font-display text-2xl italic leading-tight text-white sm:text-3xl md:text-4xl">
                  {trend.title}
                </h1>
              </div>
            </div>
          </section>

          {/* Right: description and interactive styling tips */}
          <section className="trend-details-right min-w-0 lg:pt-3">
            {trend.description && (
              <p className="mb-8 text-sm leading-relaxed text-text-secondary sm:text-base">
                {trend.description}
              </p>
            )}

            {trend.stylingTips?.length > 0 && (
              <div className="px-1 sm:px-0">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
                  Styling Tips
                </h2>

                <ol className="w-full space-y-3">
                  {trend.stylingTips.map((tip, index) => (
                    <li
                      key={index}
                      className="trend-details-tip group/tip flex w-full min-w-0 items-start gap-3 overflow-hidden rounded-2xl bg-bg px-4 py-4 transition-all duration-300 hover:bg-bg-subtle/35 hover:shadow-[0_10px_30px_rgba(8,28,21,0.06)] sm:items-center sm:gap-4 sm:p-4 sm:hover:translate-x-1"
                      style={{ "--tip-delay": `${300 + index * 110}ms` }}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-subtle font-display text-xs italic text-accent-hover transition-all duration-300 group-hover/tip:border-accent/30 group-hover/tip:bg-accent group-hover/tip:text-on-accent sm:h-9 sm:w-9 sm:text-sm">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="min-w-0 flex-1 break-words text-sm leading-6 text-text-secondary [overflow-wrap:anywhere] sm:self-center sm:text-base sm:leading-7">
                        {tip}
                      </p>
                      <span className="hidden h-7 w-7 shrink-0 self-center items-center justify-center rounded-full text-text-muted transition-all duration-300 group-hover/tip:bg-accent-subtle group-hover/tip:text-accent-hover sm:flex">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        </div>

        {trend.relatedOutfits?.length > 0 && (
          <section className="trend-details-related mt-12 sm:mt-16">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
              Shop This Trend
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {trend.relatedOutfits.map((outfit, index) => (
                <div
                  key={outfit._id}
                  className="trend-details-outfit group/outfit min-w-0 [&>a]:h-full [&>a]:rounded-[1.35rem] [&>a]:border-border/80 [&>a]:shadow-[0_8px_24px_rgba(8,28,21,0.05)] [&>a]:transition-all [&>a]:duration-500 hover:[&>a]:-translate-y-1.5 hover:[&>a]:border-accent/40 hover:[&>a]:shadow-[0_18px_40px_rgba(8,28,21,0.11)] [&_h3]:transition-colors [&_h3]:duration-300 hover:[&_h3]:text-accent-hover"
                  style={{ "--outfit-delay": `${500 + index * 90}ms` }}
                >
                  <OutfitCard outfit={outfit} coverImage />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default TrendDetails;
