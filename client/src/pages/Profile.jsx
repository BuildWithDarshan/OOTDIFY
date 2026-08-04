import { useState } from "react";
import { Link } from "react-router-dom";
import { useClerk } from "@clerk/react";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  Mail,
  Save,
  ShieldCheck,
  User,
  Users,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { updateProfile } from "../services/userService.js";

const fieldShellClass =
  "flex w-full min-w-0 items-center overflow-hidden rounded-xl border border-border bg-bg transition-all duration-300 hover:border-border-strong focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10";

const fieldInputClass =
  "min-w-0 flex-1 bg-transparent py-3 pl-0 pr-4 text-sm text-text-primary outline-none placeholder:text-text-muted/70 disabled:cursor-not-allowed disabled:text-text-muted";

const fieldIconClass =
  "flex w-11 shrink-0 items-center justify-center self-stretch text-text-muted";

const ProfileContent = ({ user, updateUserInfo }) => {
  const { openUserProfile } = useClerk();
  const [name, setName] = useState(user?.name || "");
  const [preferredGender, setPreferredGender] = useState(
    user?.preferredGender || "",
  );
  const [preferredBudget, setPreferredBudget] = useState(
    user?.preferredBudget ?? "",
  );
  const [nameError, setNameError] = useState("");
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setNameError("");
    setNameSuccess("");

    if (!name.trim()) {
      setNameError("Name cannot be empty.");
      return;
    }

    if (preferredBudget !== "" && Number(preferredBudget) < 0) {
      setNameError("Preferred budget must be a non-negative number.");
      return;
    }

    setNameSaving(true);

    try {
      const payload = { name: name.trim() };
      if (preferredGender) payload.preferredGender = preferredGender;
      if (preferredBudget !== "") {
        payload.preferredBudget = Number(preferredBudget);
      }

      const data = await updateProfile(payload);
      updateUserInfo({
        name: data.user?.name || name.trim(),
        preferredGender: data.user?.preferredGender,
        preferredBudget: data.user?.preferredBudget,
      });
      setNameSuccess("Profile updated successfully.");
    } catch (error) {
      setNameError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setNameSaving(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-bg-subtle/55">
      <style>{`
        @keyframes profileHeaderReveal {
          from {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes profileCardLeft {
          from {
            opacity: 0;
            transform: translate3d(-30px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes profileCardRight {
          from {
            opacity: 0;
            transform: translate3d(30px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .profile-header {
          animation: profileHeaderReveal 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .profile-card-left {
          animation: profileCardLeft 700ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both;
        }

        .profile-card-right {
          animation: profileCardRight 700ms cubic-bezier(0.16, 1, 0.3, 1) 180ms both;
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-header,
          .profile-card-left,
          .profile-card-right {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:px-10">
        <header className="profile-header mt-15 mb-8 overflow-hidden rounded-[1.75rem] border border-border/80 bg-bg shadow-[0_18px_55px_rgba(8,28,21,0.08)] sm:mb-10">
          <div className="flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                Personal account
              </p>
              <h1 className="mt-1 truncate font-display text-4xl italic text-text-primary sm:text-5xl">
                Your Profile
              </h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Manage your details, style preferences, and account security.
              </p>
            </div>

            <Link
              to="/favourites"
              className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-bg-subtle px-4 py-2.5 text-xs font-medium text-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:text-accent-hover hover:shadow-md sm:w-auto"
            >
              <Heart className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              Favourites
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleProfileSubmit}
            className="profile-card-left rounded-[1.75rem] border border-border/80 bg-bg p-5 shadow-[0_12px_38px_rgba(8,28,21,0.06)] transition-all duration-500 hover:shadow-[0_18px_48px_rgba(8,28,21,0.09)] sm:p-7"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-subtle text-accent-hover">
                <User className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="font-display text-2xl italic text-text-primary">
                  Profile Information
                </h2>
                <p className="text-xs text-text-muted">
                  Keep your personal preferences up to date.
                </p>
              </div>
            </div>

            {nameError && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {nameError}
              </div>
            )}

            {nameSuccess && (
              <div
                role="status"
                className="mb-5 flex items-center gap-2 rounded-xl border border-accent/20 bg-accent-subtle/55 px-4 py-3 text-sm text-accent-hover"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {nameSuccess}
              </div>
            )}

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Name
                </span>
                <span className={fieldShellClass}>
                  <span className={fieldIconClass}>
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={fieldInputClass}
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Email
                </span>
                <span className={`${fieldShellClass} bg-bg-subtle`}>
                  <span className={fieldIconClass}>
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className={fieldInputClass}
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Preferred Gender
                </span>
                <span className={fieldShellClass}>
                  <span className={fieldIconClass}>
                    <Users className="h-4 w-4" />
                  </span>
                  <select
                    value={preferredGender}
                    onChange={(event) =>
                      setPreferredGender(event.target.value)
                    }
                    className={`${fieldInputClass} appearance-none capitalize`}
                  >
                    <option value="">No preference</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Preferred Budget (₹)
                </span>
                <span className={fieldShellClass}>
                  <span className={fieldIconClass}>
                    <WalletCards className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={preferredBudget}
                    onChange={(event) =>
                      setPreferredBudget(event.target.value)
                    }
                    placeholder="e.g. 3000"
                    className={fieldInputClass}
                  />
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={nameSaving}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-on-accent hover:shadow-lg active:translate-y-0 disabled:cursor-wait disabled:opacity-60"
            >
              <Save
                className={`h-4 w-4 ${nameSaving ? "animate-pulse" : ""}`}
              />
              {nameSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <section className="profile-card-right rounded-[1.75rem] border border-border/80 bg-bg p-5 shadow-[0_12px_38px_rgba(8,28,21,0.06)] transition-all duration-500 hover:shadow-[0_18px_48px_rgba(8,28,21,0.09)] sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-subtle text-accent-hover">
                <ShieldCheck className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="font-display text-2xl italic text-text-primary">
                  Account Security
                </h2>
                <p className="text-xs text-text-muted">
                  Managed securely through your Clerk account.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-bg-subtle/65 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p className="text-xs leading-5 text-text-muted">
                  Change your password, manage connected Google accounts, and
                  review your verified email addresses in one place.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openUserProfile()}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-on-accent hover:shadow-lg active:translate-y-0 disabled:cursor-wait disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              Manage Account &amp; Password
            </button>
          </section>
        </div>
      </div>
    </main>
  );
};

const Profile = () => {
  const {
    isAuthenticated,
    loading: authLoading,
    user,
    updateUserInfo,
  } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="text-sm text-text-muted">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-bg-subtle text-accent">
          <User className="h-6 w-6" />
        </span>
        <p className="text-text-secondary">Log in to view your profile.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-bg transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-on-accent hover:shadow-lg"
        >
          Login
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return <ProfileContent user={user} updateUserInfo={updateUserInfo} />;
};

export default Profile;
