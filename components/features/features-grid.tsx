"use client";

import { motion } from "framer-motion";
import {
  Rocket,
  WandSparkles,
  Gauge,
  ShieldCheck,
  Cloud,
  Headset,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function FeaturesGrid() {
  const features = [
    {
      icon: Rocket,
      title: "Publish Instantly",
      description: "Go live with one click",
    },
    {
      icon: WandSparkles,
      title: "SEO Optimized",
      description: "Built-in SEO tools to rank higher on search engines",
    },
    {
      icon: Gauge,
      title: "Lightning Fast",
      description: "Optimized for speed and performance",
    },
    {
      icon: ShieldCheck,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and 99.9% uptime",
    },
    {
      icon: Cloud,
      title: "Cloud Hosting",
      description: "Fast & secure hosting included",
    },
    {
      icon: Headset,
      title: "24/7 Support",
      description: "We're here to help you anytime",
    },
  ];

  return (
    <section className="mt-12 w-full border-t border-slate-100 bg-slate-50/50 py-20">
      <div className="mx-auto max-w-[1280px] space-y-12 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-2 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            More Powerful Features
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center space-y-3 rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <feature.icon className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                {feature.title}
              </h4>
              <p className="text-xs leading-relaxed text-slate-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
