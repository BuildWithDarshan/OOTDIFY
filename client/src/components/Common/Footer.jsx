import { Link } from "react-router-dom";
import { InstagramIcon, FacebookIcon, TwitterIcon } from "./SocialIcons.jsx";
import footerBanner from "../../assets/images/footer-banner.png"; 
import logo from "../../assets/logos/ootdify-logo-trimmed.png"
const shoppingPartners = ["Myntra", "AJIO", "Amazon", "Flipkart", "H&M", "Zara"];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: "#000000" }}>
      {/* animated gradient hairline at the top */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent to-transparent bg-[length:200%_100%] animate-[footer-shimmer_6s_linear_infinite]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pt-14 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Brand column */}
          <div>
             <Link to='/' className='shrink-0'>
    <img src={logo} alt="OOTDIFY" className='h-7 sm:h-11 w-auto' />
</Link>
            <p className="mt-4 text-sm sm:text-base text-white/50 leading-relaxed max-w-md">
              Complete outfit inspiration by occasion, budget, and season — styled for you, shopped wherever you like.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="OOTDIFY on Instagram"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-black hover:bg-accent hover:border-accent hover:-translate-y-1 hover:shadow-[0_6px_18px_-4px_var(--color-accent)] transition-all duration-300"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="OOTDIFY on Facebook"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-black hover:bg-accent hover:border-accent hover:-translate-y-1 hover:shadow-[0_6px_18px_-4px_var(--color-accent)] transition-all duration-300"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="OOTDIFY on Twitter"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-black hover:bg-accent hover:border-accent hover:-translate-y-1 hover:shadow-[0_6px_18px_-4px_var(--color-accent)] transition-all duration-300"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop With — styled as pill tags instead of a plain list */}
          <div className="flex flex-col justify-center lg:items-end">
            <h3 className="text-xs font-semibold tracking-[0.25em] text-accent uppercase mb-5 lg:text-right">
              We Shop With
            </h3>
            <div className="flex flex-wrap gap-2.5 lg:justify-end">
              {shoppingPartners.map((partner) => (
                <span
                  key={partner}
                  className="text-xs sm:text-sm text-white/70 border border-white/15 rounded-full px-4 py-2 hover:border-accent hover:text-accent transition-colors duration-300"
                >
                  {partner}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 sm:mt-16 pt-6 border-t border-dashed border-white/20 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="font-display italic text-lg text-accent">
            OOTDIFY
          </p>
          <p className="text-xs text-white/40">
            © {year}
          </p>
          <p className="text-xs text-white/40 max-w-md">
            OOTDIFY may earn a commission from purchases made through links to our retail partners, at no extra cost to you.
          </p>
        </div>
      </div>

      {/* Image band with wordmark */}
      <div className="px-4 sm:px-6 md:px-10 pb-6 sm:pb-8">
        <div className="relative w-full h-[22vh] sm:h-[28vh] md:h-[40vh] rounded-2xl overflow-hidden">
          <img
            src={footerBanner}
            alt="OOTDIFY"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <h2 className="absolute inset-0 flex items-center justify-center font-display not-italic text-white leading-none select-none text-[clamp(2.5rem,13vw,10rem)] text-center">
            OOTDIFY
          </h2>
        </div>
      </div>

      <style>{`
        @keyframes footer-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          footer .animate-\\[footer-shimmer_6s_linear_infinite\\] {
            animation: none;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
