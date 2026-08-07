"use client";

import { motion } from "framer-motion";
import { Rocket, WandSparkles, Gauge, ShieldCheck, Cloud, Headset } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0
  }
};

export function FeaturesGrid() {
  const features = [
    {
      icon: Rocket,
      title: "Publish Instantly",
      description: "Go live with one click"
    },
    {
      icon: WandSparkles,
      title: "SEO Optimized",
      description: "Built-in SEO tools to rank higher on search engines"
    },
    {
      icon: Gauge,
      title: "Lightning Fast",
      description: "Optimized for speed and performance"
    },
    {
      icon: ShieldCheck,
      title: "Secure & Reliable",
      description: "Enterprise-grade security and 99.9% uptime"
    },
    {
      icon: Cloud,
      title: "Cloud Hosting",
      description: "Fast & secure hosting included"
    },
    {
      icon: Headset,
      title: "24/7 Support",
      description: "We're here to help you anytime"
    }
  ];

  return (
    <section className="w-full py-20 bg-slate-50/50 border-t border-slate-100 mt-12">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-12">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            More Powerful Features
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5"
        >
          
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition text-center space-y-3 flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <feature.icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{feature.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}

        </motion.div>

      </div>
    </section>
  );
}
