import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Which Richmond Neighborhood Fits You? | Free Quiz",
  description:
    "Moving to Richmond? Take our free neighborhood matching quiz. Answer 7 quick questions about your lifestyle, budget, and commute to find your perfect Richmond neighborhood. Personalized results with real market data.",
  keywords: [
    "relocating to Richmond VA",
    "Richmond VA neighborhoods",
    "best neighborhood in Richmond",
    "moving to Richmond Virginia",
    "Richmond neighborhood quiz",
    "Richmond relocation",
    "where to live in Richmond VA",
    "Richmond VA real estate quiz",
  ],
  alternates: {
    canonical: "/quiz",
  },
  openGraph: {
    title: "Which Richmond Neighborhood Fits You? | Free Quiz",
    description:
      "Answer 7 quick questions and we'll match you with the Richmond neighborhoods that fit your lifestyle, budget, and commute. Free, personalized results.",
    url: "https://mamsnow.com/quiz",
    images: [
      {
        url: "/images/miles-hero.jpg",
        width: 1200,
        height: 630,
        alt: "MAMS Richmond Neighborhood Quiz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Which Richmond Neighborhood Fits You? | Free Quiz",
    description:
      "Answer 7 quick questions and find your perfect Richmond neighborhood. Free, personalized results with real market data.",
    images: ["/images/miles-hero.jpg"],
  },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
