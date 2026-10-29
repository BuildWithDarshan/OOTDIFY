import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import MasonryGridItem from "../Community/MasonryGridItem.jsx";
import { getCommunityOutfits } from "../../services/communityOutfitService.js";
import { getCommunityPreviewOutfits } from "../../data/communityPreviewOutfits.js";

const BOARD_LIMIT = 15;
const CARD_RATIOS = ["3 / 4", "4 / 5", "2 / 3", "1 / 1.15", "3 / 4.5"];

const WallSkeleton = () => (
  <div role="status" aria-label="Loading community looks" className="community-wall-grid grid grid-cols-2 [grid-auto-rows:8px] gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
    {Array.from({ length: BOARD_LIMIT }, (_, index) => (
      <MasonryGridItem key={index}>
        <div className="animate-pulse overflow-hidden rounded-[1.4rem] bg-white">
          <div className="bg-[#f2e9e8]" style={{ aspectRatio: CARD_RATIOS[index % CARD_RATIOS.length] }} />
        </div>
      </MasonryGridItem>
    ))}
  </div>
);

const RevealCard = ({ outfit, index }) => {
  const cardRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return undefined;
    const card = cardRef.current;
    if (!card) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    observer.observe(card);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={cardRef} className={`community-wall-reveal transition-[opacity,transform] duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`} style={{ transitionDelay: `${(index % 5) * 65}ms` }}>
      <div className="overflow-hidden rounded-[1.4rem] bg-[#f4eeeb] shadow-[0_10px_25px_rgba(44,20,24,0.07)]">
        <img src={outfit.image?.url} alt={outfit.title} loading="lazy" className="block w-full object-cover" style={{ aspectRatio: CARD_RATIOS[index % CARD_RATIOS.length] }} />
      </div>
    </div>
  );
};

const CommunityStyleWall = () => {
  const [retryKey, setRetryKey] = useState(0);
  const [feed, setFeed] = useState({ key: -1, outfits: [], error: false });
  const loading = feed.key !== retryKey;
  const outfits = loading ? [] : feed.outfits;

  useEffect(() => {
    let cancelled = false;
    getCommunityOutfits({ page: 1, limit: BOARD_LIMIT, sort: "latest" })
      .then(async (data) => {
        let pageOutfits = (data.outfits || []).slice(0, BOARD_LIMIT);
        if (pageOutfits.length < BOARD_LIMIT && import.meta.env.DEV) {
          const previews = await getCommunityPreviewOutfits();
          pageOutfits = [...pageOutfits, ...previews.slice(0, BOARD_LIMIT - pageOutfits.length)];
        }
        if (!cancelled) setFeed({ key: retryKey, outfits: pageOutfits, error: false });
      })
      .catch(async () => {
        const previews = await getCommunityPreviewOutfits();
        if (!cancelled) setFeed({ key: retryKey, outfits: previews, error: previews.length === 0 });
      });
    return () => { cancelled = true; };
  }, [retryKey]);

  return (
    <section aria-labelledby="community-wall-title" className="relative overflow-hidden border-t border-[#e8ddda] bg-[#fbf9f7] px-4 pb-10 pt-20 sm:px-6 sm:pb-12 sm:pt-16 lg:h-dvh lg:px-8 lg:pb-5 lg:pt-10 xl:px-10">
      <style>{`
        .community-wall-scroll { scrollbar-color: #e60023 #f4eeeb; scrollbar-width: thin; }
        .community-wall-scroll::-webkit-scrollbar { width: 6px; }
        .community-wall-scroll::-webkit-scrollbar-thumb { background: #e60023; border-radius: 999px; }
        .community-wall-scroll::-webkit-scrollbar-track { background: #f4eeeb; }
        @media (max-width: 639px) {
          .community-wall-grid > :nth-child(n + 9) { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .community-wall-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
      `}</style>
      <div className="pointer-events-none absolute -right-32 -top-28 h-96 w-96 rounded-full bg-[#fce8eb] blur-3xl" />
      <div className="relative mx-auto flex max-w-[1600px] flex-col lg:h-full lg:min-h-0">
        <header className="mx-auto mb-4 max-w-2xl shrink-0 text-center lg:mb-3">
          <p className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b3001b]"><span className="h-2 w-2 rounded-full bg-[#e60023]" /> OOTDIFY Community</p>
          <h2 id="community-wall-title" className="font-display text-4xl italic leading-none text-text-primary sm:text-5xl">The Style Board<span className="text-[#e60023]">.</span></h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">A little inspiration for your next fit check. See what the community is wearing, then share your own.</p>
        </header>

        <div className="order-2 mb-4 flex w-full shrink-0 flex-nowrap items-center justify-center gap-2 text-center sm:order-3 sm:mb-0 sm:mt-5 sm:gap-3 lg:mt-3">
          <Link to="/community" className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#e60023] px-2 text-[10px] font-semibold text-white shadow-[0_8px_20px_rgba(230,0,35,0.2)] transition hover:bg-[#b3001b] sm:min-h-11 sm:flex-none sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm">Explore the community <ArrowRight size={14} className="shrink-0 sm:h-4 sm:w-4" /></Link>
          <Link to="/community/create" className="group inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#173b2e] py-1 pl-1 pr-2 text-[10px] font-semibold text-white shadow-[0_8px_20px_rgba(23,59,46,0.18)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-1 hover:bg-[#285942] hover:shadow-[0_14px_28px_rgba(23,59,46,0.28)] active:translate-y-0 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173b2e] sm:min-h-11 sm:flex-none sm:gap-2.5 sm:py-2 sm:pl-2 sm:pr-5 sm:text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors duration-200 group-hover:bg-white/25 sm:h-8 sm:w-8"><Plus size={15} className="transition-transform duration-200 group-hover:rotate-90 sm:h-[17px] sm:w-[17px]" /></span> Share your outfit</Link>
        </div>

        <div className="relative order-3 min-h-0 sm:order-2 lg:flex-1">
          <div tabIndex={0} aria-label="Recent community looks" className="community-wall-scroll focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e60023] lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-8 lg:pr-2">
            {loading ? <WallSkeleton /> : feed.error ? (
              <div className="rounded-3xl border border-[#ecd5d8] bg-white px-6 py-14 text-center">
                <p className="font-display text-2xl italic text-text-primary">The style board is taking a moment.</p>
                <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="mt-4 min-h-11 rounded-full bg-[#e60023] px-5 py-2 text-sm font-semibold text-white hover:bg-[#b3001b]">Try again</button>
              </div>
            ) : outfits.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#e5c9cc] bg-white px-6 py-14 text-center">
                <p className="font-display text-2xl italic text-text-primary">The first look could be yours.</p>
                <p className="mt-2 text-sm text-text-secondary">Share an outfit and start the community board.</p>
                <Link to="/community" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e60023] px-5 py-2 text-sm font-semibold text-white">Visit the community <ArrowRight size={16} /></Link>
              </div>
            ) : (
              <div className="community-wall-grid grid grid-cols-2 [grid-auto-rows:8px] gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                {outfits.map((outfit, index) => (
                  <MasonryGridItem key={outfit._id}>
                    <RevealCard outfit={outfit} index={index} />
                  </MasonryGridItem>
                ))}
              </div>
            )}
          </div>
          {!loading && outfits.length > 0 && <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-12 bg-gradient-to-t from-[#fbf9f7] to-transparent lg:block" />}
        </div>

      </div>
    </section>
  );
};

export default CommunityStyleWall;
