import { SignUp } from "@clerk/react";
import { UserRoundPlus } from "lucide-react";
import AuthShell from "../components/Auth/AuthShell.jsx";
import clerkAppearance from "../components/Auth/clerkAppearance.js";

const Register = () => (
  <AuthShell eyebrow="Join the wardrobe" icon={UserRoundPlus}>
    <SignUp
      routing="path"
      path="/register"
      signInUrl="/login"
      fallbackRedirectUrl="/"
      appearance={clerkAppearance}
    />
  </AuthShell>
);

export default Register;
