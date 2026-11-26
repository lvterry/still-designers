"use client";

import React, { useRef, useState } from "react";
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

type AuthStep = "choose" | "email" | "otp" | "google-preview";

const EMPTY_OTP = ["", "", "", "", "", ""];

export function AuthMethodCard({ mode }: AuthMethodCardProps) {
  const router = useRouter();
  const { setRole, closeGateModal } = useCommunity();

  const [step, setStep] = useState<AuthStep>("choose");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(EMPTY_OTP);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isSignUp = mode === "sign-up";

  const handleEnterAsNewMember = () => {
    setRole("onboarding");
    closeGateModal();
    router.push("/");
  };

  const handleJumpToDiscover = () => {
    closeGateModal();
    setRole("member");
    router.push("/");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (
      !trimmed ||
      !trimmed.includes("@") ||
      trimmed.startsWith("@") ||
      trimmed.endsWith("@")
    ) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setOtp(EMPTY_OTP);
    setResent(false);
    setStep("otp");
  };

  const handleGoogleContinue = () => {
    setError("");
    setStep("google-preview");
  };

  const handleOtpChange = (idx: number, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");
    if (!digits) {
      const next = [...otp];
      next[idx] = "";
      setOtp(next);
      if (error) setError("");
      return;
    }

    if (digits.length > 1) {
      const next = [...otp];
      const start = digits.length >= 6 ? 0 : idx;
      for (let i = 0; i < digits.length && start + i < 6; i++) {
        next[start + i] = digits[i];
      }
      setOtp(next);
      if (error) setError("");
      const focusIdx = Math.min(start + digits.length - 1, 5);
      otpRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...otp];
    next[idx] = digits;
    setOtp(next);
    if (error) setError("");
    if (idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        const next = [...otp];
        next[idx] = "";
        setOtp(next);
        if (error) setError("");
        e.preventDefault();
      } else if (idx > 0) {
        const next = [...otp];
        next[idx - 1] = "";
        setOtp(next);
        if (error) setError("");
        otpRefs.current[idx - 1]?.focus();
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      otpRefs.current[idx - 1]?.focus();
      return;
    }

    if (e.key === "ArrowRight" && idx < 5) {
      e.preventDefault();
      otpRefs.current[idx + 1]?.focus();
      return;
    }

    if (/^[0-9]$/.test(e.key) && otp[idx]) {
      e.preventDefault();
      const next = [...otp];
      next[idx] = e.key;
      setOtp(next);
      if (error) setError("");
      if (idx < 5) {
        otpRefs.current[idx + 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (
    idx: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = [...otp];
    const start = pasted.length >= 6 ? 0 : idx;
    let lastFilled = start;
    for (let i = 0; i < pasted.length && start + i < 6; i++) {
      next[start + i] = pasted[i];
      lastFilled = start + i;
    }
    setOtp(next);
    if (error) setError("");
    otpRefs.current[Math.min(lastFilled, 5)]?.focus();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError("");
    if (isSignUp) {
      handleEnterAsNewMember();
    } else {
      handleJumpToDiscover();
    }
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
              We&apos;ll send a 6-digit code to your inbox.
            </p>

            <form
              onSubmit={handleEmailSubmit}
              noValidate
              className="mt-6 space-y-4"
            >
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

        {step === "otp" && (
          <motion.div
            key="otp"
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
                setResent(false);
                setStep("email");
              }}
              className="inline-flex w-fit items-center gap-1.5 rounded-xl px-1 py-1 text-[14px] font-bold text-ink-secondary transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <h1 className="mt-4 text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink sm:text-[28px]">
              Enter verification code
            </h1>
            <p className="mt-2 text-[14.5px] leading-relaxed font-medium text-ink-secondary">
              We sent a 6-digit code to{" "}
              <span className="font-bold text-ink">{email.trim()}</span>.
            </p>

            <form
              onSubmit={handleOtpSubmit}
              noValidate
              className="mt-6 space-y-4"
            >
              <div>
                <div
                  role="group"
                  aria-label="6-digit verification code"
                  className="flex w-full divide-x-2 divide-line overflow-hidden rounded-2xl border-2 border-line bg-canvas transition-colors focus-within:border-cobalt focus-within:ring-2 focus-within:ring-cobalt/20"
                >
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={idx === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      autoFocus={idx === 0}
                      aria-label={`Digit ${idx + 1} of 6`}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={(e) => handleOtpPaste(idx, e)}
                      className="h-14 w-full min-w-0 bg-transparent text-center text-[20px] font-extrabold text-ink transition-colors focus:bg-elevated focus:outline-none focus-visible:outline-none"
                    />
                  ))}
                </div>
                {error && (
                  <p className="mt-2 text-[13.5px] font-semibold text-danger">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                data-tone="cobalt"
                className="toy-button flex h-12 w-full items-center justify-center rounded-2xl px-5 text-[15.5px] font-extrabold"
              >
                {isSignUp ? "Verify and continue" : "Verify and sign in"}
              </button>
            </form>

            <p className="mt-4 text-center text-[13.5px] font-medium text-ink-secondary">
              Didn&apos;t get a code?{" "}
              <button
                type="button"
                onClick={() => setResent(true)}
                className="font-bold text-cobalt hover:underline"
              >
                {resent ? "Code resent!" : "Resend"}
              </button>
            </p>

            <p className="mt-2 text-center text-[12.5px] font-medium text-ink-muted">
              Prototype: enter any 6 digits to continue.
            </p>
          </motion.div>
        )}

        {step === "google-preview" && (
          <motion.div
            key="google-preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex w-full max-w-[340px] flex-col items-center text-center"
          >
            <PeekingBuddy variant="blob" className="h-14 w-14" />

            <h1 className="mt-5 text-[24px] leading-tight font-extrabold tracking-[-0.015em] text-ink sm:text-[26px]">
              Google sign-in preview
            </h1>

            <p className="mt-2.5 text-[14.5px] leading-relaxed font-medium text-ink-secondary">
              Simulated continuing with Google. Real OAuth isn&apos;t connected
              yet.
            </p>

            <div className="mt-7 w-full">
              {isSignUp ? (
                <button
                  type="button"
                  data-tone="coral"
                  onClick={handleEnterAsNewMember}
                  className="toy-button flex h-12 w-full items-center justify-center rounded-2xl px-5 text-[15px] font-extrabold"
                >
                  Enter Still Designers
                </button>
              ) : (
                <button
                  type="button"
                  data-tone="cobalt"
                  onClick={handleJumpToDiscover}
                  className="toy-button flex h-12 w-full items-center justify-center rounded-2xl px-5 text-[15px] font-extrabold"
                >
                  Continue to Discover
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
