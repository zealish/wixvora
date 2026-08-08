"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Check,
  Search,
  WandSparkles,
  FileText,
  Palette,
  Image as ImageIcon,
  Settings,
  Plus,
  Crop,
  Monitor,
  Smartphone,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  Menu,
  Layers,
  SmartphoneNfc,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function FeaturesShowcase() {
  return (
    <section className="w-full bg-white py-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="mx-auto mb-16 max-w-[1280px] space-y-3 px-6 text-center md:px-12"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
        >
          All the Tools You Need in One Platform
        </motion.h2>
        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-2xl text-base text-slate-500"
        >
          Wixvora provides a complete set of features to help you create
          professional websites faster and easier with AI.
        </motion.p>
      </motion.div>

      <div className="mx-auto max-w-[1280px] space-y-24 px-6 md:px-12">
        {/* FEATURE SHOWCASE 1: AI Website Generation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12"
        >
          {/* Left Text Column */}
          <motion.div
            variants={itemVariants}
            className="space-y-6 lg:col-span-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              AI Website Generation
            </h3>

            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
              Generate a complete website in seconds with AI. Just tell us what
              you need, and Wixvora will build it for you.
            </p>

            <ul className="space-y-3 pt-2 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span>AI generates content & images</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span>Smart layout & structure</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span>Save time and focus on your business</span>
              </li>
            </ul>
          </motion.div>

          {/* Right Visual UI Mockup */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="shadow-card relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M4 8L10 24L16 12L22 24L28 8"
                      stroke="url(#m1_logo)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient
                        id="m1_logo"
                        x1="4"
                        y1="8"
                        x2="28"
                        y2="24"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#3B82F6" />
                        <stop offset="1" stopColor="#4F46E5" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-xs font-black tracking-tight text-slate-900">
                    WIXVORA
                  </span>
                </div>
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </div>

              <div className="grid min-h-[300px] grid-cols-1 items-stretch gap-4 md:grid-cols-12">
                <div className="space-y-1 border-r border-slate-100 pr-3 text-[11px] font-medium text-slate-600 md:col-span-3">
                  <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-2.5 py-2 font-semibold text-indigo-600">
                    <WandSparkles className="h-3.5 w-3.5" />
                    <span>AI Website</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-50">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span>Pages</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-50">
                    <Palette className="h-3.5 w-3.5 text-slate-400" />
                    <span>Design</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-50">
                    <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>Media</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-50">
                    <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                    <span>AI Tools</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-50">
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    <span>Settings</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between space-y-3 py-1 md:col-span-5">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">
                      Tell us about your website
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Describe your business or website you want to create.
                    </p>

                    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-[11px] leading-relaxed text-slate-600">
                      A modern website for a digital marketing agency with
                      services, case studies, and contact form.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-700">
                      Choose style
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <div className="flex h-10 items-center justify-center rounded border-2 border-indigo-600 bg-indigo-50/40 p-1">
                        <div className="h-full w-full rounded-[2px] bg-indigo-200/60"></div>
                      </div>
                      <div className="flex h-10 items-center justify-center rounded border border-slate-200 bg-slate-50 p-1">
                        <div className="h-full w-full rounded-[2px] bg-slate-200/60"></div>
                      </div>
                      <div className="flex h-10 items-center justify-center rounded border border-slate-200 bg-slate-50 p-1">
                        <div className="h-full w-full rounded-[2px] bg-indigo-100"></div>
                      </div>
                      <div className="flex h-10 items-center justify-center rounded border border-slate-200 bg-slate-50 p-1">
                        <div className="h-full w-full rounded-[2px] bg-slate-200/60"></div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700">
                    Generate Website
                  </button>
                </div>

                <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-3 md:col-span-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 text-[9px] font-semibold text-slate-400">
                    <span>Digital Marketing</span>
                    <Crop className="h-3 w-3" />
                  </div>
                  <div className="z-10 my-auto space-y-2">
                    <h5 className="text-xs leading-snug font-black text-slate-900">
                      Digital Marketing
                      <br />
                      <span className="text-indigo-600">Grow Your Brand</span>
                      <br />
                      with Strategy That Works
                    </h5>
                    <button className="rounded bg-indigo-600 px-3 py-1 text-[9px] font-semibold text-white">
                      Get Started
                    </button>
                  </div>
                  <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-indigo-200/50 blur-xl"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* FEATURE SHOWCASE 2: Drag & Drop Builder */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 items-center gap-12 pt-8 lg:grid-cols-12"
        >
          <motion.div
            variants={itemVariants}
            className="order-2 lg:order-1 lg:col-span-7"
          >
            <div className="shadow-card relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M4 8L10 24L16 12L22 24L28 8"
                      stroke="url(#m2_logo)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient
                        id="m2_logo"
                        x1="4"
                        y1="8"
                        x2="28"
                        y2="24"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#3B82F6" />
                        <stop offset="1" stopColor="#4F46E5" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-xs font-black tracking-tight text-slate-900">
                    WIXVORA
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <div className="flex h-5 w-5 items-center justify-center rounded border border-slate-200">
                    <Monitor className="h-3 w-3" />
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded border border-slate-200">
                    <Smartphone className="h-3 w-3" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500">
                    Preview
                  </span>
                  <button className="rounded-md bg-indigo-600 px-3 py-1 text-[10px] font-semibold text-white">
                    Publish
                  </button>
                </div>
              </div>

              <div className="grid min-h-[300px] grid-cols-1 items-stretch gap-4 md:grid-cols-12">
                <div className="space-y-1 border-r border-slate-100 pr-2 text-[10px] font-medium text-slate-600 md:col-span-2">
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50">
                    <Plus className="h-3.5 w-3.5 text-slate-400" />
                    <span>Add</span>
                  </div>
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span>Pages</span>
                  </div>
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50">
                    <Palette className="h-3.5 w-3.5 text-slate-400" />
                    <span>Design</span>
                  </div>
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50">
                    <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span>Media</span>
                  </div>
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50">
                    <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                    <span>AI Tools</span>
                  </div>
                  <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50">
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    <span>Settings</span>
                  </div>
                </div>

                <div className="relative flex flex-col justify-center space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 md:col-span-6">
                  <div className="builder-selection-box space-y-2 rounded-lg bg-white p-3 shadow-sm">
                    <div className="builder-handle -top-1 -left-1"></div>
                    <div className="builder-handle -top-1 -right-1"></div>
                    <div className="builder-handle -bottom-1 -left-1"></div>
                    <div className="builder-handle -right-1 -bottom-1"></div>

                    <h4 className="text-xl leading-tight font-black text-slate-900">
                      Create your{" "}
                      <span className="text-indigo-600">success</span> online
                    </h4>
                    <p className="text-[10px] leading-relaxed text-slate-500">
                      We build websites that help your business grow faster and
                      bigger.
                    </p>
                    <button className="rounded bg-indigo-600 px-3 py-1.5 text-[10px] font-semibold text-white">
                      Get Started
                    </button>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-3 text-[10px] md:col-span-4">
                  <h5 className="border-b border-slate-100 pb-1.5 font-bold text-slate-900">
                    Edit Text
                  </h5>

                  <div className="flex items-center border-b border-slate-100 pb-1 font-semibold text-slate-400">
                    <span className="-mb-1 border-b-2 border-indigo-600 px-1 pb-1 text-indigo-600">
                      Content
                    </span>
                    <span className="px-3">Style</span>
                  </div>

                  <div className="space-y-1">
                    <span className="block font-medium text-slate-400">
                      Font
                    </span>
                    <div className="flex items-center justify-between rounded border border-slate-200 p-1.5 font-semibold text-slate-800">
                      <span>Heading 1</span>
                      <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="block font-medium text-slate-400">
                        Weight
                      </span>
                      <div className="flex items-center justify-between rounded border border-slate-200 p-1.5 font-semibold text-slate-800">
                        <span>Bold</span>
                        <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="block font-medium text-slate-400">
                        Size
                      </span>
                      <div className="flex items-center justify-between rounded border border-slate-200 p-1.5 font-semibold text-slate-800">
                        <span>64</span>
                        <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="block font-medium text-slate-400">
                      Color
                    </span>
                    <div className="flex items-center gap-2 rounded border border-slate-200 p-1">
                      <div className="h-3.5 w-3.5 rounded-full border bg-slate-900"></div>
                      <span className="font-mono text-slate-700">#111827</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-1 text-slate-500">
                    <AlignLeft className="h-3.5 w-3.5 text-indigo-600" />
                    <AlignCenter className="h-3.5 w-3.5" />
                    <AlignRight className="h-3.5 w-3.5" />
                    <AlignJustify className="h-3.5 w-3.5" />
                  </div>

                  <span className="block cursor-pointer pt-1 font-semibold text-indigo-600">
                    More settings
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="order-1 space-y-6 lg:order-2 lg:col-span-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm">
              <Layers className="h-6 w-6" />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Drag & Drop Builder
            </h3>

            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
              Build your website visually with an intuitive drag & drop builder.
              No coding required.
            </p>

            <ul className="space-y-3 pt-2 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span>Drag & drop any element</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span>Fully customizable</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span>Real-time editing</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* FEATURE SHOWCASE 3: Fully Responsive Design */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 items-center gap-12 pt-8 lg:grid-cols-12"
        >
          <motion.div
            variants={itemVariants}
            className="space-y-6 lg:col-span-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm">
              <SmartphoneNfc className="h-6 w-6" />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Fully Responsive Design
            </h3>

            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
              Your website will look perfect on any device. Wixvora
              automatically optimizes your site for desktop, tablet, and mobile.
            </p>

            <ul className="space-y-3 pt-2 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span>Mobile-first approach</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span>Auto responsive layout</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span>Preview on all devices</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-7">
            <div className="relative flex h-[320px] w-full items-center justify-center sm:h-[380px]">
              <div className="shadow-card absolute top-2 left-0 z-10 w-[82%] overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4">
                <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300"></div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-bold text-slate-800">NEIKORA</span>
                    <span>Home</span>
                    <span>About</span>
                    <span>Services</span>
                    <span>Portfolio</span>
                    <span>Contact</span>
                  </div>
                </div>

                <div className="max-w-sm space-y-3 px-4 py-6">
                  <h4 className="text-xl leading-tight font-black text-slate-900 sm:text-2xl">
                    We build digital products that drive results
                  </h4>
                  <p className="text-[10px] leading-relaxed text-slate-500">
                    Strategic digital solutions for ambitious brands and growing
                    businesses.
                  </p>
                  <button className="rounded-lg bg-indigo-600 px-4 py-1.5 text-[10px] font-semibold text-white">
                    Learn More
                  </button>
                </div>
              </div>

              <div className="absolute top-10 right-12 z-20 w-[45%] overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-2xl sm:w-[48%]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-black text-slate-800">
                    NEIKORA
                  </span>
                  <Menu className="h-3 w-3 text-slate-400" />
                </div>

                <div className="space-y-2 py-4">
                  <h5 className="text-xs leading-tight font-bold text-slate-900">
                    We build digital products that drive results
                  </h5>
                  <p className="text-[8px] leading-tight text-slate-400">
                    Strategic digital solutions for ambitious brands.
                  </p>
                  <button className="rounded bg-indigo-600 px-3 py-1 text-[8px] font-semibold text-white">
                    Learn More
                  </button>
                </div>
              </div>

              <div className="absolute right-2 bottom-2 z-30 w-[28%] rounded-[22px] border border-slate-800 bg-slate-900 p-2 shadow-2xl sm:w-[30%]">
                <div className="space-y-2 rounded-[16px] bg-white p-2.5 text-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="text-[8px] font-black">NEIKORA</span>
                    <Menu className="h-2.5 w-2.5 text-slate-400" />
                  </div>
                  <h6 className="text-[9px] leading-tight font-bold">
                    We build digital products that drive results
                  </h6>
                  <p className="text-[7px] leading-tight text-slate-400">
                    Strategic digital solutions.
                  </p>
                  <button className="w-full rounded bg-indigo-600 py-1 text-[7px] font-semibold text-white">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
