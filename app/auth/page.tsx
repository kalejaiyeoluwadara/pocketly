"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Image from "next/image";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({
          email: "Invalid credentials",
          password: "Invalid credentials",
        });
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setErrors({ email: "An error occurred", password: "" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/",
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-zinc-100/70 py-3 pl-11 text-[15px] text-zinc-900 placeholder-zinc-400 transition-shadow duration-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-800/60 dark:text-zinc-50 dark:focus:bg-zinc-800";

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12 bg-zinc-50 dark:bg-black">
      {/* Ambient atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-24 h-[26rem] w-[26rem] rounded-full bg-amber-500/[0.07] blur-3xl"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-md"
      >
        {/* Brand */}
        <motion.div variants={item} className="mb-9 text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-700 shadow-elevated-lg shadow-indigo-900/20">
            <Image
              src="/images/wallet-icon.svg"
              alt=""
              width={34}
              height={34}
              className="brightness-0 invert"
            />
          </div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600 dark:text-indigo-400">
            Pocketly
          </p>
          <h1 className="font-display text-[2rem] font-bold leading-tight text-zinc-900 dark:text-zinc-50">
            Money, in its place.
          </h1>
          <p className="mt-2 text-[15px] text-zinc-500 dark:text-zinc-400">
            Sign in to your pockets
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-white p-7 shadow-elevated-lg sm:p-8 dark:border-zinc-800/60 dark:bg-zinc-900"
        >
          {/* Pocket seam — stitched curve, the card is the pocket */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-10 w-full text-indigo-500/30 dark:text-indigo-400/25"
            viewBox="0 0 400 40"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M-8 8 Q 200 46 408 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 7"
              strokeLinecap="round"
            />
          </svg>

          <div className="space-y-6 pt-4">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] font-medium text-zinc-900 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                or continue with email
              </span>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({ ...errors, email: "" });
                    }}
                    disabled={isLoading}
                    className={`${inputBase} pr-4 ${
                      errors.email
                        ? "border-red-400/70 dark:border-red-500/50"
                        : "border-transparent"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: "" });
                    }}
                    disabled={isLoading}
                    className={`${inputBase} pr-12 ${
                      errors.password
                        ? "border-red-400/70 dark:border-red-500/50"
                        : "border-transparent"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-indigo-900/25 transition-all duration-200 hover:bg-indigo-700 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-xs text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
        >
          No account yet? Signing in with a new email creates one
          automatically.
        </motion.p>
      </motion.div>
    </div>
  );
}
