import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackView } from "./TrackView";

export const metadata: Metadata = { title: "Track Your Request", robots: { index: false, follow: false } };

export default function CustomCreationsTrackPage() {
  return (
    <Suspense>
      <TrackView />
    </Suspense>
  );
}
