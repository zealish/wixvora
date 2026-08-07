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
  { number: 10000, suffix: "+", label: "Websites Created", color: "text-blue-600" },
  { number: 50000, suffix: "+", label: "Happy Users", color: "text-blue-600" },
  { number: 100, suffix: "+", label: "Templates", color: "text-blue-600" },
  { number: 999, suffix: "%", label: "Uptime", color: "text-indigo-600" },
];

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="w-full mt-12 lg:mt-16 px-4 md:px-12 lg:px-16 max-w-[1440px] mx-auto">
      <div className="bg-slate-50/80 border border-slate-100 rounded-3xl p-8 sm:p-10 md:p-12 text-center shadow-sm">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="text-slate-600 font-medium text-sm sm:text-base mb-8 sm:mb-10 tracking-wide"
        >
          Trusted by creators and businesses worldwide
        </motion.p>

        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/60">
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                <div
                  className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${stat.color}`}
                >
                  <AnimatedCounter
                    target={stat.number}
                    suffix={stat.suffix}
                    inView={isInView}
                  />
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-600 mt-2">
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
