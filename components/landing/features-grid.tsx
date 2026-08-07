import { Sparkles, Layers, Smartphone, TrendingUp, Rocket, Send } from "lucide-react";
import { MotionWrapper, StaggerContainer, StaggerItem } from "./motion-wrapper";

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="w-full bg-slate-50/60 py-20 border-t border-slate-100/80 relative"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-24">
        <div className="flex flex-col items-center text-center space-y-4">
          <MotionWrapper>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold tracking-widest uppercase">
              AI MADE EASY
            </div>
          </MotionWrapper>

          <MotionWrapper delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Everything you need to build
              <br className="hidden sm:inline" />
              amazing websites
            </h2>
          </MotionWrapper>

          <MotionWrapper delay={0.2}>
            <p className="text-slate-500 text-base sm:text-lg max-w-xl font-normal">
              Powerful features to bring your ideas to life, faster and easier.
            </p>
          </MotionWrapper>

          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 w-full text-left">
            <StaggerItem variant="scale-fade">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  AI Website Generation
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Generate a complete website in seconds with AI. Just tell us what you need.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem variant="scale-fade">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Drag & Drop Builder
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Easily customize every element with our intuitive drag & drop interface.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem variant="scale-fade">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Responsive Design
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your website will look perfect on any device, automatically.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem variant="scale-fade">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  SEO Optimized
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Built-in SEO tools to help your website rank higher on search engines.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem variant="scale-fade">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Smart Content
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  AI helps you write, optimize, and generate content that converts.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem variant="scale-fade">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Publish Instantly
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
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
