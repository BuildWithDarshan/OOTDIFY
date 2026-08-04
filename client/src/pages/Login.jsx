import { SignIn } from "@clerk/react";
import AuthShell from "../components/Auth/AuthShell.jsx";
import clerkAppearance from "../components/Auth/clerkAppearance.js";

const Login = () => (
  <AuthShell eyebrow="Welcome back">
    <SignIn
      routing="path"
      path="/login"
      signUpUrl="/register"
      fallbackRedirectUrl="/"
      appearance={clerkAppearance}
    />
  </AuthShell>
);

export default Login;
