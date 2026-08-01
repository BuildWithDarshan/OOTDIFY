import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/Common/PageHero.jsx";
import aboutusBanner from "../assets/images/about-banner.png";
import aboutusBannerMobile from "../assets/images/about-banner-mobile.png";
import aboutImage from "../assets/logos/ootdify.svg";
import {
  Shirt,
  ExternalLink,
  PackageOpen,
  Compass,
  MoveRight,
} from "lucide-react";

const features = [
  {
    title: "Curated Outfits",
    description:
      "Complete looks built by occasion, season, and budget — not single items you have to piece together yourself.",
    icon: Shirt,
    tone: "from-green-50 to-white",
  },
  {
    title: "Shop Anywhere",
    description:
      "Every piece links directly to trusted retailers like Myntra, AJIO, Amazon, Flipkart, H&M, and Zara — no lock-in, no middleman checkout.",
    icon: ExternalLink,
    tone: "from-green-100/60 to-white",
  },
  {
    title: "Wardrobe Essentials",
    description:
      "A running edit of timeless basics worth owning, so you can build a base wardrobe that actually gets worn.",
    icon: PackageOpen,
    tone: "from-green-50 to-white",
  },
  {
    title: "Style Guidance",
    description:
      "Trend breakdowns and styling tips written to help you dress with more confidence, not just more choices.",
    icon: Compass,
    tone: "from-green-100/60 to-white",
  },
];

const Reveal = ({
  children,
  className = "",
  direction = "up",
  delay = 0,
}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`about-reveal about-reveal-${direction} ${
        isVisible ? "is-visible" : ""
      } ${className}`}
      style={{ "--about-delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const About = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-b from-bg via-bg to-bg-subtle/55 pb-24">
      <style>{`
        .about-reveal {
          opacity: 0;
          transition:
            opacity 850ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 850ms cubic-bezier(0.16, 1, 0.3, 1);
          transition-delay: var(--about-delay);
          will-change: opacity, transform;
        }

        .about-reveal-up {
          transform: translate3d(0, 42px, 0);
        }

        .about-reveal-left {
          transform: translate3d(-52px, 0, 0);
        }

        .about-reveal-right {
          transform: translate3d(52px, 0, 0);
        }

        .about-reveal-scale {
          transform: translate3d(0, 28px, 0) scale(0.96);
        }

        .about-reveal.is-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }

        @keyframes aboutShimmer {
          from {
            transform: translateX(-140%) skewX(-18deg);
          }
          to {
            transform: translateX(240%) skewX(-18deg);
          }
        }

        .about-image-shimmer {
          animation: aboutShimmer 1.2s ease-out both;
          animation-play-state: paused;
        }

        .about-image:hover .about-image-shimmer {
          animation-play-state: running;
        }

        @media (prefers-reduced-motion: reduce) {
          .about-reveal,
          .about-reveal-up,
          .about-reveal-left,
          .about-reveal-right,
          .about-reveal-scale {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .about-image-shimmer {
            animation: none;
          }
        }
      `}</style>

      <PageHero
        desktopImage={aboutusBanner}
        mobileImage={aboutusBannerMobile}
        wordmark="ABOUT"
        topRightLabel="OOTDIFY"
        dividerLeft="OUR"
        dividerCenter="STORY & PURPOSE"
        dividerRight="STYLE"
        fullHeight
      />

      <div className="relative mx-auto max-w-6xl space-y-20 px-4 py-12 sm:space-y-32 sm:px-6 sm:py-20 md:px-10">
        <div className="pointer-events-none absolute -left-48 top-40 hidden h-96 w-96 rounded-full bg-green-100/35 blur-3xl md:block" />
        <div className="pointer-events-none absolute -right-56 top-[48rem] hidden h-[28rem] w-[28rem] rounded-full bg-green-50/70 blur-3xl md:block" />

        <section className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16">
          <Reveal
            direction="left"
            className="relative order-1 w-full lg:col-span-5"
          >
            <div className="about-image group relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-green-200/70 bg-bg-subtle shadow-[0_24px_65px_rgba(8,28,21,0.14)] sm:aspect-[3/4] lg:aspect-[4/5]">
              <img
                src={aboutImage}
                alt="OOTDIFY styling"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.045]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-800/35 via-transparent to-green-50/10" />
              <div className="about-image-shimmer pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>
          </Reveal>

          <Reveal
            direction="right"
            delay={100}
            className="relative order-2 space-y-6 lg:col-span-7"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/15 bg-green-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-accent-hover">
              Who We Are
            </span>
            <h1 className="font-display text-3xl italic leading-tight text-text-primary sm:text-4xl md:text-5xl">
              Fashion inspiration,
              <br />
              not another storefront.
            </h1>
            <div className="h-px w-full bg-gradient-to-r from-accent via-green-200 to-transparent" />
            <div className="border-l-2 border-green-200 pl-5 text-sm font-light leading-relaxed text-text-secondary sm:pl-6 sm:text-base">
              <div className="space-y-4">
                <p>
                  OOTDIFY exists to solve a simple problem: putting together a
                  great outfit takes more time and taste than most people have to
                  spare. We do that part for you — complete, occasion-ready looks
                  curated by our styling team, organized by budget, season, and
                  the moment you&apos;re dressing for.
                </p>
                <p>
                  We&apos;re not a marketplace. Every outfit points you to the
                  individual pieces on the retailers we trust, so you always shop
                  directly with them — we simply handle the curation and the
                  styling decisions in between.
                </p>
                <p>
                  Whether you&apos;re getting dressed for a wedding, a first day
                  at work, or just trying to build a wardrobe that holds up season
                  after season, OOTDIFY is built to make that decision easier.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="relative space-y-10 sm:space-y-12">
          <Reveal className="mx-auto max-w-xl space-y-3 text-center">
            <h2 className="font-display text-3xl italic text-text-primary sm:text-4xl">
              What We Offer
            </h2>
            <p className="text-xs font-light text-text-muted sm:text-sm">
              We focus on styling solutions rather than just endless catalogs.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Reveal key={feature.title} delay={index * 110}>
                  <article
                    className={`group relative h-full overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${feature.tone} p-6 shadow-[0_12px_32px_rgba(8,28,21,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_52px_rgba(8,28,21,0.14)]`}
                  >
                    <span className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-green-100/55 transition-transform duration-700 group-hover:scale-150" />
                    <div className="relative mb-4 flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-accent shadow-[0_6px_18px_rgba(8,28,21,0.1)] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-accent group-hover:text-on-accent">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="font-display text-lg italic text-text-primary transition-colors duration-300 group-hover:text-accent-hover sm:text-xl">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="relative text-xs font-light leading-relaxed text-text-secondary sm:text-sm">
                      {feature.description}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-accent to-green-300 transition-transform duration-500 group-hover:scale-x-100" />
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>

        <Reveal
          direction="scale"
          className="mx-auto max-w-3xl"
        >
          <section className="space-y-6 rounded-3xl border border-border/80 bg-text-primary p-8 text-center shadow-sm sm:p-12">
            <div className="space-y-2">
              <h3 className="font-display text-2xl italic text-white sm:text-3xl">
                Ready to find your next look?
              </h3>
              <p className="mx-auto max-w-md text-xs font-light text-text-secondary sm:text-sm">
                Explore curated wardrobes designed to build style confidence
                instantly.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/men"
                className="group flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-white bg-text-primary px-8 py-3 text-xs font-semibold uppercase tracking-wider text-bg transition-colors hover:bg-accent hover:text-on-accent sm:w-auto"
              >
                Shop Men
                <MoveRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/women"
                className="group flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-border px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-accent hover:text-accent-hover sm:w-auto"
              >
                Shop Women
                <MoveRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </main>
  );
};

export default About;
