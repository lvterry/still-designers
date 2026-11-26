"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { GoogleMark } from "@/components/auth/google-mark";
import { PeekingBuddy } from "@/components/doodle-buddies";
import { useCommunity } from "@/context/community-context";

interface AuthMethodCardProps {
  mode: "sign-in" | "sign-up";
}

type AuthStep = "choose" | "email" | "prototype-done";
type AuthMethod = "email" | "google";

export function AuthMethodCard({ mode }: AuthMethodCardProps) {
  const router = useRouter();
  const { setRole, openGateModal } = useCommunity();

  const [step, setStep] = useState<AuthStep>("choose");
  const [method, setMethod] = useState<AuthMethod>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const isSignUp = mode === "sign-up";

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@") || trimmed.startsWith("@") || trimmed.endsWith("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setMethod("email");
    setStep("prototype-done");
  };

  const handleGoogleContinue = () => {
    setError("");
    setMethod("google");
    setStep("prototype-done");
  };

  const handleTryOnboarding = () => {
    setRole("onboarding");
    openGateModal("Welcome! Share one spark to finish joining Still Designers.");
    router.push("/");
  };

  const handleJumpToDiscover = () => {
    setRole("member");
    router.push("/");
  };

  return (
    <section
      aria-label={isSignUp ? "Sign up" : "Sign in"}
      className="relative flex w-full flex-col items-center justify-center rounded-[32px] border-2 border-line bg-elevated px-7 py-12 shadow-[var(--shadow-ambient)] sm:px-12 sm:py-16"
    >
      <AnimatePresence mode="wait">
        {step === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex w-full flex-col items-center"
          >
            <img
              src="/logo.svg"
              alt="Still Designers"
              width={954}
              height={483}
              className="h-14 w-auto sm:h-16"
            />

            <h1 className="mt-6 text-center text-[28px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink sm:text-[32px]">
              {isSignUp ? "Join the community" : "Sign in to Still Designers"}
            </h1>

            {isSignUp && (
              <p className="mt-2 text-center text-[15px] font-medium text-ink-secondary">
                New tools. Same curiosity.
              </p>
            )}

            <div className="mt-8 w-full max-w-[340px] space-y-3.5">
              <button
                type="button"
                data-tone="cobalt"
                onClick={() => {
                  setError("");
                  setStep("email");
                }}
                className="toy-button flex h-12 w-full items-center justify-center rounded-2xl px-5 text-[15.5px] font-extrabold"
              >
                Continue with email
              </button>

              <button
                type="button"
                onClick={handleGoogleContinue}
                className="toy-button-soft flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl px-5 text-[15.5px] font-bold"
              >
                <GoogleMark className="h-[18px] w-[18px] shrink-0" />
                <span>Continue with Google</span>
              </button>
            </div>

            <p className="mt-7 text-center text-[14.5px] font-medium text-ink-secondary">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="font-bold text-cobalt hover:underline"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="font-bold text-cobalt hover:underline"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </p>
          </motion.div>
        )}

        {step === "email" && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex w-full max-w-[340px] flex-col"
          >
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep("choose");
              }}
              className="inline-flex w-fit items-center gap-1.5 rounded-xl px-1 py-1 text-[14px] font-bold text-ink-secondary transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <h1 className="mt-4 text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink sm:text-[28px]">
              {isSignUp ? "Sign up with email" : "Sign in with email"}
            </h1>
            <p className="mt-2 text-[14.5px] leading-relaxed font-medium text-ink-secondary">
              We&apos;ll send a one-click link to your inbox.
            </p>

            <form onSubmit={handleEmailSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="auth-email-input"
                  className="block text-[14px] font-bold text-ink"
                >
                  Email address
                </label>
                <input
                  id="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="you@studio.design"
                  autoFocus
                  autoComplete="email"
                  className="mt-1.5 w-full rounded-2xl border-2 border-line bg-canvas px-4 py-3 text-[15px] text-ink transition-colors focus:border-cobalt focus:outline-none"
                />
                {error && (
                  <p className="mt-1.5 text-[13.5px] font-semibold text-danger">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                data-tone="cobalt"
                className="toy-button flex h-12 w-full items-center justify-center rounded-2xl px-5 text-[15.5px] font-extrabold"
              >
                Continue
              </button>
            </form>

            <p className="mt-4 text-center text-[13px] font-medium text-ink-muted">
              Prototype only — no real email is sent.
            </p>
          </motion.div>
        )}

        {step === "prototype-done" && (
          <motion.div
            key="prototype-done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex w-full max-w-[340px] flex-col items-center text-center"
          >
            <PeekingBuddy
              variant={method === "google" ? "blob" : "star"}
              className="h-14 w-14"
            />

            <h1 className="mt-5 text-[24px] leading-tight font-extrabold tracking-[-0.015em] text-ink sm:text-[26px]">
              {method === "email"
                ? "Check your inbox (prototype)"
                : "Google sign-in preview"}
            </h1>

            <p className="mt-2.5 text-[14.5px] leading-relaxed font-medium text-ink-secondary">
              {method === "email" ? (
                <>
                  We simulated sending a link to{" "}
                  <span className="font-bold text-ink">{email.trim()}</span>.
                  Real authentication isn&apos;t connected yet.
                </>
              ) : (
                "Simulated continuing with Google. Real OAuth isn't connected yet."
              )}
            </p>

            <div className="mt-7 w-full space-y-3">
              {isSignUp ? (
                <>
                  <button
                    type="button"
                    data-tone="coral"
                    onClick={handleTryOnboarding}
                    className="toy-button flex h-12 w-full items-center justify-center rounded-2xl px-5 text-[15px] font-extrabold"
                  >
                    Try the onboarding intro
                  </button>
                  <button
                    type="button"
                    onClick={handleJumpToDiscover}
                    className="toy-button-soft flex h-12 w-full items-center justify-center rounded-2xl px-5 text-[15px] font-bold"
                  >
                    Jump straight into Discover
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  data-tone="cobalt"
                  onClick={handleJumpToDiscover}
                  className="toy-button flex h-12 w-full items-center justify-center rounded-2xl px-5 text-[15px] font-extrabold"
                >
                  Continue to Discover as Maya
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                setStep("choose");
              }}
              className="mt-5 text-[13.5px] font-bold text-ink-secondary transition-colors hover:text-ink"
            >
              ← Try another method
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
