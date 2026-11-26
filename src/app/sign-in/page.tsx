import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "Sign in — Still Designers",
  description:
    "Sign in to Still Designers with email or Google.",
};

export default function SignInPage() {
  return <AuthPage mode="sign-in" />;
}
