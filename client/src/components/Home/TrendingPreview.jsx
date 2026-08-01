import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { getTrendingOutfits } from '../../services/outfitService.js';

const TrendingPreview = () => {
    const [outfits, setOutfits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [inView, setInView] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const data = await getTrendingOutfits();
                if (!cancelled) setOutfits(data.outfits || []);
            } catch {
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();

        return () => {
            cancelled = true;
        };
    }, []);

    // IntersectionObserver to reveal section on scroll
    useEffect(() => {
        const currentRef = sectionRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => {
                setInView(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px"
            }
        );

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [loading]);

    if (loading) {
        return (
            <section className="px-4 sm:px-6 md:px-10 py-10 sm:py-14 bg-bg">
                <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-text-muted">Curating trending styles...</p>
                </div>
            </section>
        );
    }

    if (error || outfits.length === 0) return null;

    // Triple the items to make the infinite marquee seamless on wide monitors
    const marqueeItems = [...outfits, ...outfits, ...outfits];

    return (
        <section 
            ref={sectionRef} 
            className="py-10 sm:py-14 md:py-20 overflow-hidden bg-bg border-t border-border/20"
        >
            {/* Header Area with smooth scroll reveal */}
            <div 
                className="px-4 sm:px-6 md:px-10 text-center max-w-3xl mx-auto transition-all duration-[1200ms] ease-out"
                style={{
                    transform: inView ? 'translateY(0)' : 'translateY(30px)',
                    opacity: inView ? 1 : 0
                }}
            >
                <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl text-text-primary text-center">
                    Trending Now
                </h2>
                <p className="mt-3 sm:mt-4 text-center font-display italic text-lg sm:text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed tracking-wide mb-10 sm:mb-16">
                    The looks everyone's reaching for right now — updated as styles shift.
                </p>
            </div>

            {/* Marquee Slider with scroll-reveal fade-in */}
            <div 
                className="ootdify-marquee-wrapper group/track-container transition-all duration-[1400ms] ease-out delay-200"
                style={{
                    transform: inView ? 'translateY(0) scale(1)' : 'translateY(45px) scale(0.97)',
                    opacity: inView ? 1 : 0
                }}
            >
                <div className="ootdify-marquee-track group/track">
                    {marqueeItems.map((outfit, idx) => {
                        const imageSrc = outfit.coverImage?.url || outfit.coverImage;
                        return (
                            <Link 
                                key={`${outfit._id}-${idx}`} 
                                to={`/outfit/${outfit._id}`} 
                                className="ootdify-marquee-card group/card"
                            >
                                <div className="relative w-full h-full overflow-hidden rounded-[2rem] bg-bg-subtle border border-border/20 shadow-md transition-all duration-700">
                                    {/* Zooming Image */}
                                    <img 
                                        src={imageSrc} 
                                        alt={outfit.title} 
                                        className="w-full h-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/card:scale-110" 
                                        loading="lazy"
                                    />
                                    
                                    {/* Premium Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity duration-500" />
                                    
                                    {/* Glassmorphic floating details overlay */}
                                    <div className="absolute bottom-3 left-3 right-3 bg-bg/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/20 shadow-lg translate-y-1 opacity-90 group-hover/card:translate-y-0 group-hover/card:opacity-100 group-hover/card:bg-bg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="text-xs sm:text-sm font-semibold text-text-primary truncate font-body">
                                                    {outfit.title}
                                                </h3>
                                                <p className="font-display italic text-sm sm:text-base text-text-secondary mt-0.5">
                                                    ₹{outfit.totalPrice.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-text-primary text-bg group-hover/card:bg-accent group-hover/card:text-on-accent transition-all duration-300">
                                                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/card:rotate-45" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <style>
                {`
                .ootdify-marquee-wrapper {
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                }
                
                /* Fade edges mask to give luxury magazine look */
                .ootdify-marquee-wrapper::before,
                .ootdify-marquee-wrapper::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    width: 10%;
                    height: 100%;
                    z-index: 10;
                    pointer-events: none;
                }
                .ootdify-marquee-wrapper::before {
                    left: 0;
                    background: linear-gradient(to right, var(--color-bg), transparent);
                }
                .ootdify-marquee-wrapper::after {
                    right: 0;
                    background: linear-gradient(to left, var(--color-bg), transparent);
                }

                .ootdify-marquee-track {
                    display: flex;
                    gap: 1.5rem;
                    width: max-content;
                    padding: 1.5rem 0; /* Add padding to prevent shadow clipping */
                    animation: ootdify-scroll 45s linear infinite;
                }

                /* Pause animation on hover */
                .ootdify-marquee-wrapper:hover .ootdify-marquee-track {
                    animation-play-state: paused;
                }

                .ootdify-marquee-card {
                    flex: 0 0 auto;
                    width: 55vw;
                    max-width: 220px;
                    aspect-ratio: 3 / 4.2;
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                /* Dim other cards inside the track when one is hovered */
                .group\\/track:hover .ootdify-marquee-card {
                    opacity: 0.65;
                    filter: grayscale(20%) blur(0.5px);
                }
                .group\\/track .ootdify-marquee-card:hover {
                    opacity: 1 !important;
                    filter: none !important;
                    transform: scale(1.06) translateY(-10px);
                    z-index: 20;
                }

                @media (min-width: 640px) {
                    .ootdify-marquee-card {
                        width: 30vw;
                        max-width: 260px;
                    }
                    .ootdify-marquee-track {
                        gap: 2rem;
                    }
                }

                @media (min-width: 1024px) {
                    .ootdify-marquee-card {
                        width: 18vw;
                        max-width: 290px;
                    }
                }

                @keyframes ootdify-scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-33.3333%); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .ootdify-marquee-track {
                        animation: none;
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                }
                `}
            </style>
        </section>
    );
};

export default TrendingPreview;
