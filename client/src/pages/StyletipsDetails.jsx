import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, CheckCircle } from "lucide-react";
import { getStyleTipById } from "../services/styleTipService.js";
import PageMeta from "../components/Common/PageMeta.jsx";

const StyleTipDetails = () => {
  const { id } = useParams();
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  // const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    getStyleTipById(id)
      .then((data) => {
        if (!cancelled) setTip(data.styleTip);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    window.scrollTo({ top: 0, behavior: "instant" });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <>
      <PageMeta
        title="Styling Guide | OOTDIFY"
        description="Read practical OOTDIFY styling guidance and learn how to build a more confident look."
      />
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-widest text-text-muted uppercase">Loading editorial details...</span>
      </div>
      </>
    );
  }

  if (notFound || !tip) {
    return (
      <>
      <PageMeta
        title="Styling Guide Not Found | OOTDIFY"
        description="The requested OOTDIFY styling guide could not be found."
        noIndex
      />
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-text-secondary font-medium">This style curation could not be found.</p>
        <Link to="/style-tips" className="bg-text-primary text-bg rounded-full px-5 py-2.5 text-xs font-semibold hover:bg-accent transition-colors">
          Return to Curation Board
        </Link>
      </div>
      </>
    );
  }

  return (
    <div className="bg-bg min-h-screen pb-24 mt-10">
      <PageMeta
        title={`${tip.title} | OOTDIFY`}
        description={tip.description || tip.excerpt || `Read ${tip.title} and discover practical styling guidance from OOTDIFY.`}
        image={tip.coverImage?.url || tip.coverImage || tip.image?.url || tip.image}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-10 border-b border-border/40 pb-6">
          {/* <Link
            to="/style-tips"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-accent-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Style Tips
          </Link> */}
          {/* <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-bg-subtle)] text-[10px] font-bold text-accent border border-accent/10">
              {Math.round(scrollProgress)}% Read
            </span>
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{readingTime} min read</span>
            </div>
          </div> */}
        </div>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Side: Sticky Frame & Image */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] rounded-3xl overflow-hidden bg-[var(--color-bg-subtle)] p-6 sm:p-8 flex items-center justify-center border border-border/80 shadow-md">
              {/* Decorative radial overlay */}
              <div className="absolute inset-0 bg-radial-gradient from-accent/5 via-transparent to-transparent opacity-80" />
              
              <img
                src={tip.coverImage?.url || tip.coverImage}
                alt={tip.title}
                className="max-w-full max-h-full object-contain rounded-2xl drop-shadow-[0_20px_35px_rgba(0,0,0,0.12)] transition-transform duration-700 hover:scale-[1.02]"
              />

              {tip.category && (
                <span className="absolute top-4 left-4 text-[9px] tracking-[0.2em] font-extrabold uppercase bg-accent text-on-accent rounded-full px-3 py-1 shadow-md">
                  {tip.category}
                </span>
              )}
            </div>

            {/* Reading progress sidebar widget */}
            {/* <div className="hidden lg:block bg-bg/40 backdrop-blur-md border border-border/60 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-wider text-text-secondary uppercase">Curation Progress</span>
                <span className="text-xs font-semibold text-accent">{Math.round(scrollProgress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--color-bg-subtle)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-100 ease-out"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
              {scrollProgress >= 98 && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold uppercase tracking-wider animate-pulse pt-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Read Complete
                </div>
              )}
            </div> */}
          </div>

          {/* Right Side: Editorial Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-accent uppercase">
                  <BookOpen className="w-3.5 h-3.5" /> Style Editorial
                </span>
              </div>
              
              <h1 className="font-display italic text-3xl sm:text-4xl md:text-5xl text-text-primary leading-tight">
                {tip.title}
              </h1>
              
              <div className="h-[1px] bg-gradient-to-r from-border/80 via-border/30 to-transparent w-full" />
            </div>

            {/* Content body */}
            <div className="prose-content text-sm sm:text-base text-text-secondary leading-relaxed whitespace-pre-line space-y-6 font-light tracking-wide first-letter:text-5xl first-letter:font-display first-letter:italic first-letter:float-left first-letter:mr-3 first-letter:text-accent first-letter:leading-none">
              {tip.content}
            </div>

            {/* Editorial Footer */}
            <div className="border-t border-border/55 pt-8 mt-12">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h5 className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">About this guide</h5>
                  <p className="text-xs text-text-muted mt-1">Curated styling instructions designed to scale your aesthetic look.</p>
                </div>
                <Link
                  to="/style-tips"
                  className="inline-flex items-center justify-center bg-[var(--color-bg-subtle)] border border-border text-text-primary hover:border-accent hover:text-accent-hover rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-300 w-fit"
                >
                  Explore More Tips
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StyleTipDetails;
