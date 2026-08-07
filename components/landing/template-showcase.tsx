"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";
import { ArrowRight, ChevronLeft, ChevronRight, Minus, Square, X } from "lucide-react";
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
      subtitle: "We design sustainable indoor and outdoor spaces that inspire and rejuvenate.",
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
    <section className="py-16 lg:py-24 px-4 md:px-12 lg:px-16 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Marketing Copy */}
        <div className="lg:col-span-5 flex flex-col items-start space-y-6 z-20 pr-0 lg:pr-4">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide uppercase">
            PROFESSIONAL TEMPLATES
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Beautiful templates for every business
          </h2>

          <p className="text-slate-600 text-lg sm:text-xl font-normal leading-relaxed max-w-md">
            Choose from 100+ professionally designed templates that you can fully customize.
          </p>

          <a
            href="#explore"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Explore Templates
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Right Column: Swiper Carousel */}
        <div className="lg:col-span-7 relative w-full overflow-hidden lg:overflow-visible">
          <Swiper
            modules={[EffectCoverflow, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            loop={true}
            initialSlide={0}
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
            className="template-swiper"
          >
            {templates.map((template) => (
              <SwiperSlide key={template.id}>
                {template.name === "GreenScape" && (
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                    {/* Browser Header */}
                    <div className={`${template.theme.headerBg} border-b border-slate-100 px-6 py-4 flex items-center justify-between`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                          {template.brandName}
                          <span className={`${template.theme.accentColor} font-serif italic`}>
                            {template.brandAccent}
                          </span>
                        </span>
                      </div>
                      <div className="hidden sm:flex items-center space-x-6 text-xs font-medium text-slate-600">
                        {template.navLinks?.map((link, idx) => (
                          <span
                            key={idx}
                            className={idx === 0 ? "text-slate-900 font-semibold cursor-pointer" : "hover:text-slate-900 cursor-pointer"}
                          >
                            {link}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div className={`${template.theme.bodyBg} p-6 sm:p-8 min-h-[300px] sm:min-h-[340px] flex items-center relative overflow-hidden`}>
                      <div className="max-w-[240px] sm:max-w-[280px] z-10 space-y-3">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                          {template.heading}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {template.subtitle}
                        </p>
                        <button className={`mt-2 px-4 py-2 rounded-lg ${template.theme.buttonBg} text-white text-xs font-medium transition`}>
                          {template.ctaText}
                        </button>
                      </div>

                      {/* Placeholder Image */}
                      <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-end justify-end p-2 pointer-events-none">
                        <div className={`h-full w-full ${template.theme.imageBg} rounded-xl shadow-md`} />
                      </div>
                    </div>
                  </div>
                )}

                {template.name === "Aurora" && (
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                    {/* Browser Header */}
                    <div className={`${template.theme.headerBg} border-b border-slate-100 px-6 py-4 flex items-center justify-between`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-slate-900 tracking-wider uppercase">
                          {template.brandName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-400 text-xs">
                        <Minus className="w-3 h-3" />
                        <Square className="w-2.5 h-2.5" />
                        <X className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div className={`${template.theme.bodyBg} p-6 sm:p-8 min-h-[300px] sm:min-h-[340px] flex items-center justify-between relative overflow-hidden`}>
                      <div className="space-y-1 text-slate-500 text-xs tracking-widest uppercase font-mono">
                        <div>Minimal.</div>
                        <div>Modern.</div>
                        <div>Sustainable.</div>
                      </div>

                      {/* Portrait Placeholder */}
                      <div className="relative h-[260px] w-[180px] sm:w-[210px] rounded-lg overflow-hidden shadow-lg border border-white">
                        <div className={`h-full w-full ${template.theme.imageBg}`} />

                        {/* Floating Tag */}
                        <div className="absolute bottom-3 -left-6 bg-white/95 backdrop-blur px-3 py-1.5 rounded-md shadow-md border border-slate-100 text-[10px] space-y-0.5">
                          <div className="font-bold text-slate-800">Fully customizable</div>
                          <div className="text-slate-500">Easy to use</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.name === "Lumina" && (
                  <div className={`${template.theme.headerBg} text-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden`}>
                    {/* Browser Header */}
                    <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                        <span className="text-base font-bold tracking-tight">{template.brandName}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {template.navLinks?.join(" • ")}
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div className={`${template.theme.bodyBg} p-8 min-h-[300px] sm:min-h-[340px] flex flex-col justify-center`}>
                      <span className={`${template.theme.accentColor} text-xs font-mono mb-2`}>
                        {template.subtitle}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                        {template.heading}
                      </h2>
                      <div className="mt-6 flex gap-3">
                        <span className="px-4 py-2 bg-indigo-600 rounded-lg text-xs font-semibold">
                          Get Started
                        </span>
                        <span className="px-4 py-2 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300">
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
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="swiper-custom-pagination flex items-center gap-2" />
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
