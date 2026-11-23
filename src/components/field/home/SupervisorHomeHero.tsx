"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { APP_MOTION } from "@/lib/motion/animation.config";

const HERO_SLIDES = [
  "/brand/supervisor-home-hero.webp",
  "/brand/supervisor-home-hero-02.webp",
  "/brand/supervisor-home-hero-03.webp",
];
const SLIDE_INTERVAL = 6_500;

function useAutomaticSlideIndex(): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  return activeIndex;
}

export function SupervisorHomeHero({ name }: { name: string }) {
  const activeIndex = useAutomaticSlideIndex();
  const reduceMotion = useReducedMotion();
  const activeSlide = HERO_SLIDES[activeIndex];

  useEffect(() => {
    HERO_SLIDES.forEach((src) => {
      const image = new window.Image();
      image.src = src;
    });
  }, []);

  return (
    <section aria-label="Selamat datang">
      <AspectRatio ratio={16 / 9} className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
          <MotionConfig reducedMotion="user">
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.7,
                  ease: APP_MOTION.easing.enter,
                }}
                className="absolute inset-0"
              >
                <Image
                  src={activeSlide}
                  alt=""
                  fill
                  sizes="(max-width: 448px) 100vw, 448px"
                  quality={80}
                  preload={activeIndex === 0}
                  draggable={false}
                  className="object-cover object-center"
                />
              </motion.div>
            </AnimatePresence>
          </MotionConfig>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/65"
        />
        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-8 pt-24 text-white">
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight">Halo, {name}</h1>
          <p className="mt-2 flex items-center gap-2 text-base font-medium text-white/95">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-emerald-400" />
            Supervisor Proyek
          </p>
        </div>
      </AspectRatio>
    </section>
  );
}
