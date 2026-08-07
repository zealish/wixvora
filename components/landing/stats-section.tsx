export function StatsSection() {
  const stats = [
    { number: "10K+", label: "Websites Created", color: "text-blue-600" },
    { number: "50K+", label: "Happy Users", color: "text-blue-600" },
    { number: "100+", label: "Templates", color: "text-indigo-600" },
    { number: "99.9%", label: "Uptime", color: "text-indigo-600" },
  ];

  return (
    <section className="w-full mt-12 lg:mt-16 px-4 md:px-12 lg:px-16 max-w-[1440px] mx-auto">
      <div className="bg-slate-50/80 border border-slate-100 rounded-3xl p-8 sm:p-10 md:p-12 text-center shadow-sm">
        <p className="text-slate-600 font-medium text-sm sm:text-base mb-8 sm:mb-10 tracking-wide">
          Trusted by creators and businesses worldwide
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/60">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center pt-4 md:pt-0"
            >
              <div
                className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${stat.color}`}
              >
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
