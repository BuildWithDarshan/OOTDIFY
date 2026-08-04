import logo from "../../assets/logos/ootdify-logo-trimmed.png";

const AuthShell = ({ eyebrow, children }) => (
  <main className="auth-shell relative flex min-h-[100svh] items-start justify-center overflow-x-hidden bg-[#f5f7f4] px-3 py-4 font-body sm:items-center sm:px-6 sm:py-5">
    <style>{`
      @keyframes authReveal {
        from { opacity: 0; transform: translate3d(0, 24px, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }

      @keyframes authLineReveal {
        from { opacity: 0; transform: scaleX(0); }
        to { opacity: 1; transform: scaleX(1); }
      }

      .auth-shell::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(rgba(15, 62, 47, .035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(15, 62, 47, .035) 1px, transparent 1px);
        background-size: 5rem 5rem;
        mask-image: linear-gradient(to bottom, black, transparent 92%);
      }

      .auth-reveal-brand {
        opacity: 0;
        animation: authReveal .85s cubic-bezier(.22, 1, .36, 1) .08s forwards;
      }

      .auth-reveal-form {
        opacity: 0;
        animation: authReveal .9s cubic-bezier(.22, 1, .36, 1) .24s forwards;
      }

      .auth-rule {
        transform-origin: center;
        animation: authLineReveal 1s cubic-bezier(.22, 1, .36, 1) .45s both;
      }

      @media (prefers-reduced-motion: reduce) {
        .auth-reveal-brand,
        .auth-reveal-form,
        .auth-rule {
          animation: none;
          opacity: 1;
          transform: none;
        }
      }
    `}</style>

    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-[#0a3528] sm:w-2"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#dceee4] sm:h-80 sm:w-80"
    />

    <section className="relative z-10 w-full max-w-[30rem]">
      <header className="auth-reveal-brand mb-3 flex flex-col items-center sm:mb-4">
        <div className="px-5 py-1.5">
          <img
            src={logo}
            alt="OOTDIFY"
            className="h-auto w-[7.5rem] object-contain sm:w-[8.5rem]"
          />
        </div>

        <div className="mt-2 flex w-full items-center gap-3 px-5 sm:mt-2.5">
          <span className="auth-rule h-px flex-1 bg-gradient-to-r from-transparent to-[#6a9c87]/60" />
          <p className="text-center text-[0.62rem] font-semibold uppercase tracking-[0.25em] text-[#376b59] sm:text-[0.68rem]">
            {eyebrow}
          </p>
          <span className="auth-rule h-px flex-1 bg-gradient-to-l from-transparent to-[#6a9c87]/60" />
        </div>
      </header>

      <div className="auth-reveal-form">
        {children}
      </div>
    </section>
  </main>
);

export default AuthShell;
