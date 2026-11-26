import type { FeedView } from "@/components/header";
import { PlaygroundShell } from "@/components/playground-shell";

const VALID_VIEWS: FeedView[] = [
  "discover",
  "prompt",
  "about",
  "favorites",
  "works",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const initialView: FeedView = VALID_VIEWS.includes(view as FeedView)
    ? (view as FeedView)
    : "discover";

  return <PlaygroundShell initialView={initialView} />;
}
