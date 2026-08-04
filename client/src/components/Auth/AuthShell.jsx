import logo from "../../assets/logos/ootdify-logo-trimmed.png";

const AuthShell = ({ eyebrow, icon: Icon, children }) => (
  <main className="auth-shell flex min-h-[100svh] items-start justify-center overflow-x-hidden bg-bg-subtle/55 px-4 py-4 font-body sm:items-center sm:px-6 sm:py-5">
    <style>{`
      @keyframes authReveal {
        from { opacity: 0; transform: translate3d(0, 24px, 0); }
        to { opacity: 1; transform: translate3d(0, 0, 0); }
      }

      @keyframes authLineReveal {
        from { opacity: 0; transform: scaleX(0); }
        to { opacity: 1; transform: scaleX(1); }
      }

      .auth-reveal-brand {
        opacity: 0;
        animation: authReveal 700ms cubic-bezier(.16, 1, .3, 1) .05s forwards;
      }

      .auth-reveal-form {
        opacity: 0;
        animation: authReveal 700ms cubic-bezier(.16, 1, .3, 1) .15s forwards;
      }

      .auth-rule {
        transform-origin: center;
        animation: authLineReveal 1s cubic-bezier(.22, 1, .36, 1) .45s both;
      }

      .auth-form-center,
      .auth-form-center .cl-rootBox,
      .auth-form-center .cl-cardBox {
        width: 100% !important;
        max-width: 30rem !important;
        margin-inline: auto !important;
      }

      .auth-form-center .cl-rootBox {
        display: flex !important;
        justify-content: center !important;
      }

      .auth-form-center .cl-card {
        width: 100% !important;
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

    <section className="w-full max-w-[30rem]">
      <header className="auth-reveal-brand mb-3 flex flex-col items-center sm:mb-4">
        <div className="px-5 py-1">
          <img
            src={logo}
            alt="OOTDIFY"
            className="h-auto w-[7.25rem] object-contain sm:w-[8rem]"
          />
        </div>

        <div className="mt-2 flex w-full items-center gap-3 px-4">
          <span className="auth-rule h-px flex-1 bg-gradient-to-r from-transparent to-border-strong" />
          <div className="flex items-center gap-2 text-accent-hover">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg border border-border">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <p className="text-center text-[0.62rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.68rem]">
              {eyebrow}
            </p>
          </div>
          <span className="auth-rule h-px flex-1 bg-gradient-to-l from-transparent to-border-strong" />
        </div>
      </header>

      <div className="auth-form-center auth-reveal-form flex w-full justify-center">
        {children}
      </div>
    </section>
  </main>
);

export default AuthShell;
