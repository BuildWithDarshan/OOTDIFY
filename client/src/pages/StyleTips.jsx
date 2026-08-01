import { useState, useEffect, useMemo } from 'react';
import PageHero from "../components/Common/PageHero.jsx";
import CategoryTabs from '../components/StyleTips/CategoryTabs.jsx';
import StyleTipCard from '../components/StyleTips/StyleTipCard.jsx';
import { getStyleTips } from '../services/styleTipService.js';
import styleTipsBanner from "../assets/images/style-tips-banner.png";
import styleTipsBannerMobile from "../assets/images/style-tips-banner-mobile.png";
import { Compass } from 'lucide-react';

const StyleTips = () => {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeCategory, setActiveCategory] = useState("");

    useEffect(() => {
        let cancelled = false;

        getStyleTips()
        .then((data) => {
            if(!cancelled) setTips(data.styleTips || []);
        })
        .catch(() => {
            if(!cancelled) setError(true);
        })
        .finally(() => {
            if(!cancelled) setLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const categories = useMemo(() => {
        const set = new Set(tips.map((t) => t.category).filter(Boolean));
        return Array.from(set);
    }, [tips]);

    const filteredTips = useMemo(() => {
        if(!activeCategory) return tips;
        return tips.filter((t) => t.category === activeCategory);
    }, [tips, activeCategory]);

    // Separate featured tip and grid tips
    const featuredTip = filteredTips[0];
    const gridTips = filteredTips.slice(1);

    return (
        <div className="bg-bg min-h-screen pb-20">
            {/* Custom Premium Styles */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            <PageHero
                desktopImage={styleTipsBanner}
                mobileImage={styleTipsBannerMobile}
                wordmark="STYLE TIPS"
                topRightLabel="GUIDE"
                dividerLeft="LEARN"
                dividerCenter="DRESS WITH CONFIDENCE"
                dividerRight="STYLE"
                fullHeight
            />

            <div className="px-4 sm:px-6 md:px-10 py-10 max-w-6xl mx-auto">
                
                {/* Heading Description */}
                <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
                    <h2 className="font-display italic text-3xl sm:text-4xl text-text-primary mb-4">
                        Curated Dressing Guides
                    </h2>
                    <p className="text-text-secondary text-xs sm:text-sm font-light leading-relaxed">
                        Discover styling tips, fashion rules, and dynamic wardrobe inspirations carefully structured by our expert stylists to build your dream aesthetic.
                    </p>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        <p className='text-xs font-semibold tracking-widest text-text-muted uppercase'>
                            Curating Style Tips...
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-20 bg-[var(--color-bg-subtle)] rounded-3xl border border-border p-8 max-w-lg mx-auto">
                        <p className='text-sm text-text-secondary mb-4'>
                            We encountered a minor issue loading the editorial logs.
                        </p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-text-primary text-bg rounded-full px-5 py-2 text-xs font-semibold hover:bg-accent transition-colors"
                        >
                            Retry Loading
                        </button>
                    </div>
                )}

                {!loading && !error && tips.length === 0 && (
                    <div className="text-center py-24 bg-[var(--color-bg-subtle)] rounded-3xl border border-dashed border-border p-10 max-w-lg mx-auto">
                        <Compass className="w-8 h-8 text-text-muted mx-auto mb-4" />
                        <p className='text-sm font-medium text-text-secondary'>No style curations published yet.</p>
                        <p className='text-xs text-text-muted mt-1'>Check back soon for upcoming lookbooks and updates.</p>
                    </div>
                )}

                {!loading && !error && tips.length > 0 && (
                    <div className="space-y-12">
                        {/* Category Selector */}
                        {categories.length > 0 && (
                            <div className="mb-6">
                                <CategoryTabs categories={categories} active={activeCategory} onChange={setActiveCategory}/>
                            </div>
                        )}
                        
                        {filteredTips.length === 0 ? (
                            <div className="text-center py-20 bg-[var(--color-bg-subtle)] rounded-3xl border border-border">
                                <p className="text-sm text-text-muted font-medium">No tips in this category yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {/* Featured Spot */}
                                {featuredTip && (
                                    <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                                        <StyleTipCard tip={featuredTip} featured={true}/>
                                    </div>
                                )}

                                {/* Remaining Grid */}
                                {gridTips.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <h4 className="text-[10px] font-bold tracking-[0.2em] text-text-secondary uppercase">
                                                More Curations ({gridTips.length})
                                            </h4>
                                            <div className="flex-1 h-[1px] bg-border/55" />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                            {gridTips.map((tip, idx) => (
                                                <div 
                                                    key={tip._id} 
                                                    className="opacity-0 animate-fade-in-up"
                                                    style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                                                >
                                                    <StyleTipCard tip={tip} featured={false}/>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StyleTips;
