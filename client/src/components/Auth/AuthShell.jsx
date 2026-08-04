import logo from "../../assets/logos/ootdify-logo-trimmed.png";

const AuthShell = ({ eyebrow, children }) => (
  <main className="auth-shell relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#061b14] px-3 py-6 font-body sm:px-6 sm:py-10">
    <style>{`
      @keyframes authReveal {
        from { opacity: 0; transform: translate3d(0, 24px, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }

      @keyframes authLineReveal {
        from { opacity: 0; transform: scaleX(0); }
        to { opacity: 1; transform: scaleX(1); }
      }

      @keyframes authGlow {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: .5; }
        50% { transform: translate3d(-1.5rem, 1rem, 0) scale(1.08); opacity: .72; }
      }

      .auth-shell::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(rgba(210, 239, 225, .055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(210, 239, 225, .055) 1px, transparent 1px);
        background-size: 4.5rem 4.5rem;
        mask-image: linear-gradient(to bottom, black, transparent 88%);
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

      .auth-orb {
        animation: authGlow 9s ease-in-out infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .auth-reveal-brand,
        .auth-reveal-form,
        .auth-rule,
        .auth-orb {
          animation: none;
          opacity: 1;
          transform: none;
        }
      }
    `}</style>

    <div
      aria-hidden="true"
      className="auth-orb pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#4f9d7c]/35 blur-3xl sm:h-[30rem] sm:w-[30rem]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-52 -left-40 h-[34rem] w-[34rem] rounded-full border border-[#83c7a8]/20"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-64 -left-52 h-[42rem] w-[42rem] rounded-full border border-[#83c7a8]/10"
    />

    <section className="relative z-10 w-full max-w-[34rem]">
      <header className="auth-reveal-brand mb-5 flex flex-col items-center sm:mb-7">
        <div className="rounded-[1.35rem] border border-white/15 bg-[#f8f7f1] px-7 py-4 shadow-[0_18px_50px_rgba(0,0,0,.18)] sm:px-9">
          <img
            src={logo}
            alt="OOTDIFY"
            className="h-auto w-[8.5rem] object-contain sm:w-[10rem]"
          />
        </div>

        <div className="mt-5 flex w-full items-center gap-4 px-3 sm:mt-6">
          <span className="auth-rule h-px flex-1 bg-gradient-to-r from-transparent to-[#8fd0b2]/55" />
          <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#bce8d4] sm:text-xs">
            {eyebrow}
          </p>
          <span className="auth-rule h-px flex-1 bg-gradient-to-l from-transparent to-[#8fd0b2]/55" />
        </div>
      </header>

      <div className="auth-reveal-form rounded-[2.25rem] border border-white/15 bg-[#edf7ef]/90 p-2 shadow-[0_32px_90px_rgba(0,0,0,.32)] backdrop-blur-sm sm:p-3">
        {children}
      </div>
    </section>
  </main>
);

export default AuthShell;
