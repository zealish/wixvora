import { Sparkles, Laptop, Wand2, Globe } from "lucide-react";
import { MotionWrapper, StaggerContainer, StaggerItem } from "./motion-wrapper";

const steps = [
  {
    number: 1,
    icon: Sparkles,
    title: "Tell AI Your Idea",
    description: "Answer a few questions about your website.",
    hasLine: true,
  },
  {
    number: 2,
    icon: Laptop,
    title: "AI Builds Your Website",
    description: "Our AI generates a complete website tailored for you.",
    hasLine: true,
  },
  {
    number: 3,
    icon: Wand2,
    title: "Customize & Edit",
    description: "Edit content, images, and design with our easy drag & drop builder.",
    hasLine: true,
  },
  {
    number: 4,
    icon: Globe,
    title: "Publish & Go Live",
    description: "Publish your website and share it with the world.",
    hasLine: false,
  },
];

export function HowItWorks() {
  return (
    <section className="w-full bg-slate-50/60 py-20 relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-24">
        <div className="flex flex-col items-center text-center space-y-12 pt-6">
          <MotionWrapper>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Wixvora Works
            </h2>
          </MotionWrapper>

          <div className="w-full relative">
            <StaggerContainer staggerDelay={0.15} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {steps.map((step) => (
                <StaggerItem key={step.number}>
                  <div className="flex flex-col items-center text-center group">
                    <div className="relative w-full flex justify-center items-center mb-6">
                      {step.hasLine && (
                        <div className="hidden lg:block absolute top-1/2 left-[50%] right-[-50%] h-[2px] border-t-2 border-dashed border-indigo-200 -translate-y-1/2 -z-10" />
                      )}
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/30">
                        {step.number}
                      </div>
                    </div>

                    <div className="w-20 h-20 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      <step.icon className="w-8 h-8" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-[210px]">
                      {step.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
