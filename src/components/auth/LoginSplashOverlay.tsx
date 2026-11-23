"use client";

import { AnimatePresence, motion } from "motion/react";
import { APP_MOTION } from "@/lib/motion/animation.config";
import { ArchiStudioMark } from "@/components/auth/ArchiStudioMark";

interface LoginSplashOverlayProps {
  isVisible: boolean;
  animateExit: boolean;
  onLogoAnimationComplete: () => void;
}

export function LoginSplashOverlay({
  isVisible,
  animateExit,
  onLogoAnimationComplete,
}: LoginSplashOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          aria-hidden="true"
          className="login-splash-overlay fixed inset-0 z-[100] flex items-center justify-center bg-[#161719]"
          exit={animateExit ? { y: "-100%" } : undefined}
          key="login-splash"
          transition={
            animateExit
              ? {
                  delay: APP_MOTION.loginSplash.holdDuration,
                  duration: APP_MOTION.loginSplash.wipeDuration,
                  ease: APP_MOTION.easing.exit,
                }
              : undefined
          }
        >
          <ArchiStudioMark onAnimationComplete={onLogoAnimationComplete} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
