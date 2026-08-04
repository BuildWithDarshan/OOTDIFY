import { SignIn } from "@clerk/react";
import logo from "../assets/logos/ootdify-logo-trimmed.png";

const Login = () => (
  <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-14 font-body">
    <div className="flex w-full max-w-md flex-col items-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent-hover">
        Welcome back
      </p>
      <img
        src={logo}
        alt="OOTDIFY"
        className="mb-8 h-auto w-[8.75rem] object-contain sm:w-[10rem]"
      />
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/register"
        fallbackRedirectUrl="/"
        appearance={{
          variables: {
            colorPrimary: "#0b3025",
            borderRadius: "0.9rem",
          },
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none",
            card: "w-full border border-border bg-bg shadow-[0_20px_60px_rgba(8,28,21,0.08)]",
            headerTitle: "font-display italic text-text-primary",
            headerSubtitle: "text-text-secondary",
            formButtonPrimary: "bg-text-primary hover:bg-accent",
            footerActionLink: "text-accent-hover",
          },
        }}
      />
    </div>
  </main>
);

export default Login;
