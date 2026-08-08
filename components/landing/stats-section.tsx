"use client";

import { useInView, motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { StaggerContainer, StaggerItem } from "./motion-wrapper";

function AnimatedCounter({
  target,
  suffix = "",
  inView,
}: {
  target: number;
  suffix?: string;
  inView: boolean;
}) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);

      if (suffix === "%") {
        setDisplay(`${(current / 10).toFixed(1)}%`);
      } else {
        setDisplay(`${current.toLocaleString()}${suffix}`);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [inView, target, suffix]);

  return <>{display}</>;
}

const stats = [
  {
    number: 10000,
    suffix: "+",
    label: "Websites Created",
    color: "text-blue-600",
  },
  { number: 50000, suffix: "+", label: "Happy Users", color: "text-blue-600" },
  { number: 100, suffix: "+", label: "Templates", color: "text-blue-600" },
  { number: 999, suffix: "%", label: "Uptime", color: "text-indigo-600" },
];

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="mx-auto mt-12 w-full max-w-[1440px] px-4 md:px-12 lg:mt-16 lg:px-16"
    >
      <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-8 text-center shadow-sm sm:p-10 md:p-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="mb-8 text-sm font-medium tracking-wide text-slate-600 sm:mb-10 sm:text-base"
        >
          Trusted by creators and businesses worldwide
        </motion.p>

        <StaggerContainer
          staggerDelay={0.1}
          className="grid grid-cols-2 gap-8 divide-y divide-slate-200/60 md:grid-cols-4 md:gap-4 md:divide-x md:divide-y-0"
        >
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                <div
                  className={`text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${stat.color}`}
                >
                  <AnimatedCounter
                    target={stat.number}
                    suffix={stat.suffix}
                    inView={isInView}
                  />
                </div>
                <div className="mt-2 text-xs font-medium text-slate-600 sm:text-sm">
                  {stat.label}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
