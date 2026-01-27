"use client";

import { CardStack } from "./card-stack";

export default function Testimonials() {
  const cards = [
    {
      id: 1,
      name: "Sarah Johnson",
      designation: "Luxury Collector",
      content: (
        <p>
          "These cards are amazing, I want to use them in my project. Framer
          motion is a godsend ngl tbh fam 🙏"
        </p>
      ),
    },
    {
      id: 2,
      name: "Michael Chen",
      designation: "Fashion Enthusiast",
      content: (
        <p>
          "The quality and craftsmanship of STR products is unmatched. Each
          piece tells a story of excellence."
        </p>
      ),
    },
    {
      id: 3,
      name: "Emma Williams",
      designation: "Design Aficionado",
      content: (
        <p>
          "A confluence of exceptional and extraordinary narratives, as
          revealed by STR's design philosophy."
        </p>
      ),
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-linear-to-b from-green-50 to-green-100 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12 md:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wider mb-3 sm:mb-4">
            LOVED BY
            <br />
            <span className="font-extralight">THOUSANDS</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-light tracking-wide max-w-2xl mx-auto px-4">
            Here's what some of our customers have to say about STR.
          </p>
        </div>
        <div className="flex justify-center px-4">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
            <CardStack items={cards} />
          </div>
        </div>
      </div>
    </section>
  );
}
