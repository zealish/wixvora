import {
  Sparkles,
  Layers,
  Smartphone,
  TrendingUp,
  Rocket,
  Send,
} from "lucide-react";
import { MotionWrapper, StaggerContainer, StaggerItem } from "./motion-wrapper";

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="relative w-full border-t border-slate-100/80 bg-slate-50/60 py-20"
    >
      <div className="mx-auto max-w-[1280px] space-y-24 px-6 md:px-12">
        <div className="flex flex-col items-center space-y-4 text-center">
          <MotionWrapper>
            <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-[11px] font-bold tracking-widest text-indigo-600 uppercase">
              AI MADE EASY
            </div>
          </MotionWrapper>

          <MotionWrapper delay={0.1}>
            <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-[42px]">
              Everything you need to build
              <br className="hidden sm:inline" />
              amazing websites
            </h2>
          </MotionWrapper>

          <MotionWrapper delay={0.2}>
            <p className="max-w-xl text-base font-normal text-slate-500 sm:text-lg">
              Powerful features to bring your ideas to life, faster and easier.
            </p>
          </MotionWrapper>

          <StaggerContainer
            staggerDelay={0.1}
            className="grid w-full grid-cols-1 gap-6 pt-8 text-left md:grid-cols-2 lg:grid-cols-3"
          >
            <StaggerItem variant="scale-fade">
              <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 text-xl text-indigo-600 transition-transform group-hover:scale-110">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  AI Website Generation
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  Generate a complete website in seconds with AI. Just tell us
                  what you need.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem variant="scale-fade">
              <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 text-xl text-indigo-600 transition-transform group-hover:scale-110">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  Drag & Drop Builder
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  Easily customize every element with our intuitive drag & drop
                  interface.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem variant="scale-fade">
              <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 text-xl text-indigo-600 transition-transform group-hover:scale-110">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  Responsive Design
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  Your website will look perfect on any device, automatically.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem variant="scale-fade">
              <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 text-xl text-indigo-600 transition-transform group-hover:scale-110">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  SEO Optimized
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  Built-in SEO tools to help your website rank higher on search
                  engines.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem variant="scale-fade">
              <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 text-xl text-indigo-600 transition-transform group-hover:scale-110">
                  <Rocket className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  Smart Content
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  AI helps you write, optimize, and generate content that
                  converts.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem variant="scale-fade">
              <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-lg">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/80 text-xl text-indigo-600 transition-transform group-hover:scale-110">
                  <Send className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  Publish Instantly
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  One click to publish your website and go live to the world.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
