"use client";

import React from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthMethodCard } from "@/components/auth/auth-method-card";
import { SignupShowcasePanel } from "@/components/auth/signup-showcase-panel";

interface AuthPageProps {
  mode: "sign-in" | "sign-up";
}

export function AuthPage({ mode }: AuthPageProps) {
  const isSignUp = mode === "sign-up";

  return (
    <div className="paper-dots flex min-h-screen flex-col">
      <AuthHeader mode={mode} />

      {isSignUp ? (
        <main className="mx-auto flex w-full max-w-[1220px] flex-1 items-center px-4 py-8 sm:px-8 sm:py-12">
          <div className="grid w-full grid-cols-1 items-stretch gap-6 lg:min-h-[600px] lg:grid-cols-2">
            <AuthMethodCard mode="sign-up" />
            <SignupShowcasePanel />
          </div>
        </main>
      ) : (
        <main className="mx-auto flex w-full max-w-[540px] flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
          <div className="flex w-full items-stretch lg:min-h-[480px]">
            <AuthMethodCard mode="sign-in" />
          </div>
        </main>
      )}
    </div>
  );
}
