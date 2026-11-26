import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "Sign up — Still Designers",
  description:
    "Join Still Designers with email or Google to swap playful design discoveries.",
};

export default function SignUpPage() {
  return <AuthPage mode="sign-up" />;
}
