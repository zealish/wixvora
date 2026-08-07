"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  Square,
  X,
} from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import { useRef } from "react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

export function TemplateShowcase() {
  const swiperRef = useRef<SwiperType | null>(null);

  const templates = [
    {
      id: 1,
      name: "GreenScape",
      brandName: "Green",
      brandAccent: "Scape",
      navLinks: ["Home", "About", "Services", "Projects", "Contact"],
      heading: "Beautiful spaces, better living.",
      subtitle:
        "We design sustainable indoor and outdoor spaces that inspire and rejuvenate.",
      ctaText: "Discover More",
      theme: {
        headerBg: "bg-white",
        bodyBg: "bg-slate-50/50",
        accentColor: "text-emerald-700",
        buttonBg: "bg-emerald-900 hover:bg-emerald-800",
        imageBg: "bg-gradient-to-br from-emerald-100 to-emerald-200",
      },
    },
    {
      id: 2,
      name: "Aurora",
      brandName: "AURORA",
      navLinks: null,
      heading: null,
      subtitle: null,
      ctaText: null,
      theme: {
        headerBg: "bg-white",
        bodyBg: "bg-slate-100/70",
        accentColor: null,
        buttonBg: null,
        imageBg: "bg-gradient-to-br from-slate-100 to-slate-200",
      },
    },
    {
      id: 3,
      name: "Lumina",
      brandName: "LUMINA.AI",
      navLinks: ["Products", "API", "Pricing"],
      heading: "Empower your workflow with intelligent code.",
      subtitle: "# NextGen AI Platform",
      ctaText: null,
      theme: {
        headerBg: "bg-slate-900",
        bodyBg: "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900",
        accentColor: "text-indigo-400",
        buttonBg: null,
        imageBg: null,
      },
    },
  ];

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-12 lg:px-16 lg:py-24">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        {/* Left Column: Marketing Copy */}
        <div className="z-20 flex flex-col items-start space-y-6 pr-0 lg:col-span-5 lg:pr-4">
          <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-indigo-600 uppercase">
            PROFESSIONAL TEMPLATES
          </div>

          <h2 className="text-4xl leading-[1.15] font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[52px]">
            Beautiful templates for every business
          </h2>

          <p className="max-w-md text-lg leading-relaxed font-normal text-slate-600 sm:text-xl">
            Choose from 100+ professionally designed templates that you can
            fully customize.
          </p>

          <a
            href="#explore"
            className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98]"
          >
            Explore Templates
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Right Column: Swiper Carousel */}
        <div className="relative flex w-full flex-col items-center overflow-hidden lg:col-span-7 lg:overflow-visible">
          <Swiper
            modules={[EffectCoverflow, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            loop={true}
            initialSlide={2}
            coverflowEffect={{
              rotate: 0,
              stretch: 20,
              depth: 120,
              modifier: 1,
              slideShadows: false,
            }}
            pagination={{
              clickable: true,
              el: ".swiper-custom-pagination",
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="template-swiper w-full"
          >
            {templates.map((template) => (
              <SwiperSlide key={template.id}>
                {template.name === "GreenScape" && (
                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                    {/* Browser Header */}
                    <div
                      className={`${template.theme.headerBg} flex items-center justify-between border-b border-slate-100 px-6 py-4`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900">
                          {template.brandName}
                          <span
                            className={`${template.theme.accentColor} font-serif italic`}
                          >
                            {template.brandAccent}
                          </span>
                        </span>
                      </div>
                      <div className="hidden items-center space-x-6 text-xs font-medium text-slate-600 sm:flex">
                        {template.navLinks?.map((link, idx) => (
                          <span
                            key={idx}
                            className={
                              idx === 0
                                ? "cursor-pointer font-semibold text-slate-900"
                                : "cursor-pointer hover:text-slate-900"
                            }
                          >
                            {link}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div
                      className={`${template.theme.bodyBg} relative flex min-h-[300px] items-center overflow-hidden p-6 sm:min-h-[340px] sm:p-8`}
                    >
                      <div className="z-10 max-w-[240px] space-y-3 sm:max-w-[280px]">
                        <h2 className="text-2xl leading-tight font-extrabold text-slate-900 sm:text-3xl">
                          {template.heading}
                        </h2>
                        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                          {template.subtitle}
                        </p>
                        <button
                          className={`mt-2 rounded-lg px-4 py-2 ${template.theme.buttonBg} text-xs font-medium text-white transition`}
                        >
                          {template.ctaText}
                        </button>
                      </div>

                      {/* Placeholder Image */}
                      <div className="pointer-events-none absolute top-0 right-0 bottom-0 flex w-1/2 items-end justify-end p-2">
                        <div
                          className={`h-full w-full ${template.theme.imageBg} rounded-xl shadow-md`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {template.name === "Aurora" && (
                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                    {/* Browser Header */}
                    <div
                      className={`${template.theme.headerBg} flex items-center justify-between border-b border-slate-100 px-6 py-4`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold tracking-wider text-slate-900 uppercase">
                          {template.brandName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400">
                        <Minus className="h-3 w-3" />
                        <Square className="h-2.5 w-2.5" />
                        <X className="h-3 w-3" />
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div
                      className={`${template.theme.bodyBg} relative flex min-h-[300px] items-center justify-between overflow-hidden p-6 sm:min-h-[340px] sm:p-8`}
                    >
                      <div className="space-y-1 font-mono text-xs tracking-widest text-slate-500 uppercase">
                        <div>Minimal.</div>
                        <div>Modern.</div>
                        <div>Sustainable.</div>
                      </div>

                      {/* Portrait Placeholder */}
                      <div className="relative h-[260px] w-[180px] overflow-hidden rounded-lg border border-white shadow-lg sm:w-[210px]">
                        <div
                          className={`h-full w-full ${template.theme.imageBg}`}
                        />

                        {/* Floating Tag */}
                        <div className="absolute bottom-3 -left-6 space-y-0.5 rounded-md border border-slate-100 bg-white/95 px-3 py-1.5 text-[10px] shadow-md backdrop-blur">
                          <div className="font-bold text-slate-800">
                            Fully customizable
                          </div>
                          <div className="text-slate-500">Easy to use</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.name === "Lumina" && (
                  <div
                    className={`${template.theme.headerBg} overflow-hidden rounded-2xl border border-slate-800 text-white shadow-2xl`}
                  >
                    {/* Browser Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                        <span className="text-base font-bold tracking-tight">
                          {template.brandName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {template.navLinks?.join(" • ")}
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div
                      className={`${template.theme.bodyBg} flex min-h-[300px] flex-col justify-center p-8 sm:min-h-[340px]`}
                    >
                      <span
                        className={`${template.theme.accentColor} mb-2 font-mono text-xs`}
                      >
                        {template.subtitle}
                      </span>
                      <h2 className="text-2xl leading-tight font-bold sm:text-3xl">
                        {template.heading}
                      </h2>
                      <div className="mt-6 flex gap-3">
                        <span className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold">
                          Get Started
                        </span>
                        <span className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300">
                          Docs
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Pagination Controls */}
          <div className="mt-2.5 flex items-center justify-center gap-3">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="cursor-pointer text-slate-400 transition-colors select-none hover:text-blue-500"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <div className="swiper-custom-pagination flex items-center gap-0" />
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="cursor-pointer text-slate-400 transition-colors select-none hover:text-blue-500"
              aria-label="Next slide"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
