import { Sparkles, Zap, Check } from "lucide-react";

export function AuthShowcase() {
  return (
    <div className="space-y-8 lg:col-span-6">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-brand-600">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI-Powered Website Builder</span>
        </div>

        <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
          Build, Launch & Scale <br />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Your Web Dream
          </span>
        </h1>

        <p className="max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
          Sign in to access your intelligent website studio, manage domains, and
          turn prompts into live, responsive websites in seconds.
        </p>
      </div>

      {/* Interactive Preview Card */}
      <div className="relative pb-4 pr-4 pt-2">
        <div className="relative z-10 space-y-5 rounded-3xl border border-slate-200/90 bg-white/85 p-6 shadow-2xl backdrop-blur-xl">
          {/* Header status bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-purple-600 text-xs font-black text-white shadow-md shadow-brand-200">
                AI
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Wixvora Prompt Assistant
                </p>
                <p className="text-[11px] font-medium text-slate-400">
                  Generating responsive design...
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-600">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500"></span>
              Live Studio
            </span>
          </div>

          {/* Prompt Simulation */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3.5 text-xs font-medium text-slate-700">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <span className="italic text-slate-700">
              &quot;Create a high-converting portfolio with dark mode, animations, and
              custom domain setup...&quot;
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-slate-600">
              <span>AI Layout Processing</span>
              <span className="text-brand-600">98% Complete</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full border border-slate-200/50 bg-slate-100 p-0.5">
              <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-indigo-500 via-brand-600 to-purple-600 transition-all duration-1000"></div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">Speed</p>
              <p className="mt-0.5 text-xs font-extrabold text-slate-900">&lt; 30 sec</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">Code</p>
              <p className="mt-0.5 text-xs font-extrabold text-slate-900">Clean HTML/JS</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">SEO</p>
              <p className="mt-0.5 text-xs font-extrabold text-emerald-600">Automated</p>
            </div>
          </div>
        </div>

        {/* Floating Metric 1 */}
        <div className="absolute -right-2 -top-4 z-20 flex animate-float items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900">100+ Templates</p>
            <p className="text-[10px] font-medium text-slate-500">Fully customizable</p>
          </div>
        </div>

        {/* Floating Metric 2 */}
        <div className="absolute -bottom-4 -left-4 z-20 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
          <div className="flex -space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-[10px] font-extrabold text-white">
              JD
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-purple-600 text-[10px] font-extrabold text-white">
              SK
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px] font-extrabold text-white">
              AM
            </div>
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900">12,500+ Creators</p>
            <p className="text-[10px] font-bold text-emerald-600">★ 4.9/5 Rating</p>
          </div>
        </div>
      </div>

      {/* Feature Checks */}
      <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-600">
        {[
          "No coding required",
          "Free custom subdomain",
          "Mobile responsive",
          "Instant SSL Certificate",
        ].map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
