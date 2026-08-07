"use client";

import { Check, Minus } from "lucide-react";
import { MotionWrapper } from "@/components/landing/motion-wrapper";

const FEATURES = [
  {
    name: "AI Website Builder",
    free: "check",
    starter: "check",
    pro: "check",
    premium: "check",
  },
  {
    name: "Storage",
    free: "500 MB",
    starter: "10 GB",
    pro: "50 GB",
    premium: "Unlimited",
  },
  {
    name: "Custom Domain",
    free: "minus",
    starter: "check",
    pro: "check",
    premium: "check",
  },
  {
    name: "Premium Templates",
    free: "Limited",
    starter: "check",
    pro: "check",
    premium: "check",
  },
  {
    name: "SEO Tools",
    free: "Basic",
    starter: "Basic",
    pro: "Advanced",
    premium: "Advanced",
  },
  {
    name: "AI Content Generator",
    free: "minus",
    starter: "minus",
    pro: "check",
    premium: "check",
  },
  {
    name: "Team Collaboration",
    free: "minus",
    starter: "minus",
    pro: "minus",
    premium: "check",
  },
  {
    name: "Support",
    free: "Community",
    starter: "Email",
    pro: "Priority",
    premium: "Dedicated",
  },
] as const;

function CellValue({ value }: { value: string }) {
  if (value === "check") {
    return <Check className="mx-auto h-4 w-4 text-indigo-600" />;
  }
  if (value === "minus") {
    return <Minus className="mx-auto h-4 w-4 text-slate-300" />;
  }
  const isHighlighted =
    value === "Advanced" || value === "50 GB" || value === "Priority";
  return (
    <span
      className={`font-semibold ${
        isHighlighted ? "text-indigo-600" : "text-slate-700"
      }`}
    >
      {value}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <MotionWrapper className="mt-20">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs text-slate-700">
                <th className="p-4 text-base font-bold text-slate-900 sm:p-5">
                  Compare All Plans
                </th>
                <th className="w-1/5 p-4 text-center font-bold text-slate-900 sm:p-5">
                  Free
                </th>
                <th className="w-1/5 p-4 text-center font-bold text-slate-900 sm:p-5">
                  Starter
                </th>
                <th className="relative w-1/5 p-4 text-center font-bold text-brand-600 sm:p-5">
                  Pro
                  <span className="mt-0.5 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-extrabold text-brand-600">
                    MOST POPULAR
                  </span>
                </th>
                <th className="w-1/5 p-4 text-center font-bold text-slate-900 sm:p-5">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {FEATURES.map((row) => (
                <tr
                  key={row.name}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="p-4 font-bold text-slate-800 sm:p-5">
                    {row.name}
                  </td>
                  <td className="p-4 text-center sm:p-5">
                    <CellValue value={row.free} />
                  </td>
                  <td className="p-4 text-center sm:p-5">
                    <CellValue value={row.starter} />
                  </td>
                  <td className="bg-indigo-50/20 p-4 text-center sm:p-5">
                    <CellValue value={row.pro} />
                  </td>
                  <td className="p-4 text-center sm:p-5">
                    <CellValue value={row.premium} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MotionWrapper>
  );
}
