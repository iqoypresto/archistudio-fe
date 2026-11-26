"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion, type Variants } from "motion/react";
import { APP_MOTION } from "@/lib/motion/animation.config";

const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delayChildren: APP_MOTION.reportSuccess.textDelay, staggerChildren: APP_MOTION.reportSuccess.textStagger } },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: APP_MOTION.easing.enter } },
};

const reducedContentVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const reducedTextVariants: Variants = { hidden: { opacity: 0, y: 0 }, visible: { opacity: 1, y: 0 } };

export function ReportSuccessOverlay({
  isVisible,
  submittedAt,
  timeZone,
  onClose,
  onExited,
}: {
  isVisible: boolean;
  submittedAt: string | null;
  timeZone: string;
  onClose: () => void;
  onExited: () => void;
}) {
  const finishButton = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const activeContentVariants = reduceMotion ? reducedContentVariants : contentVariants;
  const activeTextVariants = reduceMotion ? reducedTextVariants : textVariants;
  const formattedTime = submittedAt
    ? new Intl.DateTimeFormat("id-ID", { timeZone, dateStyle: "medium", timeStyle: "short" }).format(new Date(submittedAt))
    : "Waktu pengiriman tercatat di server.";

  useEffect(() => {
    if (!isVisible) return;
    const timer = window.setTimeout(onClose, 2800);
    return () => window.clearTimeout(timer);
  }, [isVisible, onClose]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" onExitComplete={onExited}>
        {isVisible && (
          <motion.div
            key="report-success"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-success-title"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -8, transition: { duration: reduceMotion ? 0.12 : APP_MOTION.reportSuccess.overlayExit, ease: APP_MOTION.easing.exit } }}
            transition={{ duration: reduceMotion ? 0.12 : APP_MOTION.reportSuccess.overlayEnter, ease: APP_MOTION.easing.enter }}
            onKeyDown={(event) => {
              if (event.key === "Tab") {
                event.preventDefault();
                finishButton.current?.focus();
              }
            }}
            className="fixed inset-0 z-[80] flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#161719] px-6 py-[max(24px,env(safe-area-inset-top))] text-center text-white"
          >
            <div className="relative grid size-24 place-items-center">
              {!reduceMotion && <motion.span
                aria-hidden="true"
                initial={{ scale: 0.75, opacity: 0.38 }}
                animate={{ scale: 1.85, opacity: 0 }}
                transition={{ delay: APP_MOTION.reportSuccess.ringDelay, duration: APP_MOTION.reportSuccess.ringDuration, ease: APP_MOTION.easing.enter }}
                className="absolute inset-0 rounded-full border border-white/65"
              />}
              <motion.span
                initial={{ scale: reduceMotion ? 1 : 0.65, opacity: reduceMotion ? 1 : 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={reduceMotion
                  ? { duration: 0.12 }
                  : { type: "spring", stiffness: 280, damping: 20, bounce: 0.14, duration: APP_MOTION.reportSuccess.circleDuration, delay: APP_MOTION.reportSuccess.circleDelay }}
                className="grid size-24 place-items-center rounded-full bg-[#16A34A]"
              >
                <svg aria-hidden="true" viewBox="0 0 48 48" className="size-12 fill-none">
                  <motion.path
                    d="m11 25 8 8 18-19"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    initial={{ pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: reduceMotion ? 0.01 : APP_MOTION.reportSuccess.checkDuration, delay: reduceMotion ? 0 : APP_MOTION.reportSuccess.checkDelay, ease: APP_MOTION.easing.enter }}
                  />
                </svg>
              </motion.span>
            </div>

            <motion.div
              variants={activeContentVariants}
              initial="hidden"
              animate="visible"
              className="mt-7 max-w-sm"
            >
              <motion.h1
                id="report-success-title"
                role="status"
                aria-live="polite"
                variants={activeTextVariants}
                className="text-2xl font-bold tracking-tight"
              >
                Laporan Terkirim
              </motion.h1>
              <motion.p
                variants={activeTextVariants}
                className="mt-2 text-sm leading-relaxed text-white/75"
              >
                Data laporan dan foto telah tersimpan. {formattedTime}
              </motion.p>
            </motion.div>

            <motion.button
              ref={finishButton}
              type="button"
              onClick={onClose}
              onAnimationComplete={() => finishButton.current?.focus()}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : APP_MOTION.reportSuccess.actionDelay, duration: reduceMotion ? 0.12 : APP_MOTION.reportSuccess.actionDuration, ease: APP_MOTION.easing.enter }}
              className="mt-8 min-h-12 min-w-40 rounded-xl bg-white px-6 font-bold text-[#161719] transition-colors hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Kembali ke Daftar Laporan
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
