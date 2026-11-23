"use client";

import { motion } from "motion/react";
import { APP_MOTION } from "@/lib/motion/animation.config";

export function ArchiStudioMark({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  return (
    <motion.svg
      aria-label="ArchiStudio"
      animate={{ opacity: 1, scale: 1 }}
      className="size-28 text-white"
      focusable="false"
      height="112"
      initial={{ opacity: 0, scale: 0.7 }}
      onAnimationComplete={onAnimationComplete}
      role="img"
      transition={{
        duration: APP_MOTION.loginSplash.logoDuration,
        ease: APP_MOTION.easing.enter,
      }}
      viewBox="0 0 512 512"
      width="112"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M138 102h71l131 151h-62L138 102Z" fill="currentColor" />
      <path d="M80 329c32-38 66-49 102-39 36 9 67 30 100 45 34 15 64 21 94 6 23-11 39-29 56-45v58c-21 20-39 36-62 46-38 17-77 5-107-7-32-13-61-35-91-46-28-10-56-2-92 37v-55Z" fill="currentColor" />
    </motion.svg>
  );
}
