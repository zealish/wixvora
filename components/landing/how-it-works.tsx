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
    description:
      "Edit content, images, and design with our easy drag & drop builder.",
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
    <section className="relative w-full bg-slate-50/60 py-20">
      <div className="mx-auto max-w-[1280px] space-y-24 px-6 md:px-12">
        <div className="flex flex-col items-center space-y-12 pt-6 text-center">
          <MotionWrapper>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              How Wixvora Works
            </h2>
          </MotionWrapper>

          <div className="relative w-full">
            <StaggerContainer
              staggerDelay={0.15}
              className="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {steps.map((step) => (
                <StaggerItem key={step.number}>
                  <div className="group flex flex-col items-center text-center">
                    <div className="relative mb-6 flex w-full items-center justify-center">
                      {step.hasLine && (
                        <div className="absolute top-1/2 right-[-50%] left-[50%] -z-10 hidden h-[2px] -translate-y-1/2 border-t-2 border-dashed border-indigo-200 lg:block" />
                      )}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-500/30">
                        {step.number}
                      </div>
                    </div>

                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50/90 text-2xl text-indigo-600 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white">
                      <step.icon className="h-8 w-8" />
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="max-w-[210px] text-sm leading-relaxed text-slate-500">
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
