import { Sparkles, Laptop, Wand2, Globe } from "lucide-react";

export function HowItWorks() {
  return (
    <section className="w-full bg-slate-50/60 py-20 relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-24">
        <div className="flex flex-col items-center text-center space-y-12 pt-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Wixvora Works
          </h2>

          <div className="w-full relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="flex flex-col items-center text-center group">
                <div className="relative w-full flex justify-center items-center mb-6">
                  <div className="hidden lg:block absolute top-1/2 left-[50%] right-[-50%] h-[2px] border-t-2 border-dashed border-indigo-200 -translate-y-1/2 -z-10"></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/30">
                    1
                  </div>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Sparkles className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Tell AI Your Idea
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[210px]">
                  Answer a few questions about your website.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="relative w-full flex justify-center items-center mb-6">
                  <div className="hidden lg:block absolute top-1/2 left-[50%] right-[-50%] h-[2px] border-t-2 border-dashed border-indigo-200 -translate-y-1/2 -z-10"></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/30">
                    2
                  </div>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Laptop className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  AI Builds Your Website
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[210px]">
                  Our AI generates a complete website tailored for you.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="relative w-full flex justify-center items-center mb-6">
                  <div className="hidden lg:block absolute top-1/2 left-[50%] right-[-50%] h-[2px] border-t-2 border-dashed border-indigo-200 -translate-y-1/2 -z-10"></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/30">
                    3
                  </div>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Wand2 className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Customize & Edit
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[210px]">
                  Edit content, images, and design with our easy drag & drop builder.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="relative w-full flex justify-center items-center mb-6">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/30">
                    4
                  </div>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Globe className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Publish & Go Live
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[210px]">
                  Publish your website and share it with the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
