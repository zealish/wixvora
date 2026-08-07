"use client";

import { useState } from "react";
import { FaqItem } from "./faq-item";
import { MotionWrapper } from "@/components/landing/motion-wrapper";

const FAQ_DATA = [
  {
    id: "faq-1",
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your account dashboard. Changes will take effect immediately.",
  },
  {
    id: "faq-2",
    question: "Is there a free trial?",
    answer:
      "Yes! Our Free plan allows you to test out the AI Builder and explore template customization completely free with no time limit or credit card required.",
  },
  {
    id: "faq-3",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards including Visa, Mastercard, American Express, PayPal, and Google Pay.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto mt-20 max-w-4xl space-y-6">
      <MotionWrapper>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Frequently Asked Questions
          </h2>
        </div>
      </MotionWrapper>

      <div className="grid grid-cols-1 gap-4 pt-4">
        {FAQ_DATA.map((faq) => (
          <FaqItem
            key={faq.id}
            question={faq.question}
            answer={faq.answer}
            isOpen={openId === faq.id}
            onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
          />
        ))}
      </div>
    </div>
  );
}
