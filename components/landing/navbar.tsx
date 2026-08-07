"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-6 md:px-12">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 8L10 24L16 12L22 24L28 8"
                stroke="url(#logo_grad)"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient
                  id="logo_grad"
                  x1="4"
                  y1="8"
                  x2="28"
                  y2="24"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3B82F6" />
                  <stop offset="1" stopColor="#4F46E5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            WIXVORA
          </span>
        </Link>

        <nav className="hidden items-center space-x-10 text-[15px] font-medium text-slate-700 md:flex">
          <div className="relative py-1">
            <Link
              href="/features"
              className={`transition-colors ${
                pathname === "/features"
                  ? "font-semibold text-indigo-600"
                  : "hover:text-indigo-600"
              }`}
            >
              Features
            </Link>
            {pathname === "/features" && (
              <div className="absolute right-0 bottom-0 left-0 h-[2.5px] rounded-full bg-indigo-600"></div>
            )}
          </div>
          <div className="relative py-1">
            <Link
              href="/templates"
              className={`transition-colors ${
                pathname === "/templates"
                  ? "font-semibold text-indigo-600"
                  : "hover:text-indigo-600"
              }`}
            >
              Templates
            </Link>
            {pathname === "/templates" && (
              <div className="absolute right-0 bottom-0 left-0 h-[2.5px] rounded-full bg-indigo-600"></div>
            )}
          </div>
          <div className="relative py-1">
            <Link
              href="/pricing"
              className={`transition-colors ${
                pathname === "/pricing"
                  ? "font-semibold text-indigo-600"
                  : "hover:text-indigo-600"
              }`}
            >
              Pricing
            </Link>
            {pathname === "/pricing" && (
              <div className="absolute right-0 bottom-0 left-0 h-[2.5px] rounded-full bg-indigo-600"></div>
            )}
          </div>
          <div className="group flex cursor-pointer items-center gap-1.5 transition-colors hover:text-indigo-600">
            <span>Resources</span>
            <ChevronDown className="h-3 w-3 text-slate-500 transition-transform group-hover:rotate-180 group-hover:text-indigo-600" />
          </div>
        </nav>

        <div className="flex items-center space-x-6">
          <a
            href="#login"
            className="text-[15px] font-semibold text-slate-800 transition-colors hover:text-indigo-600"
          >
            Log in
          </a>
          <a
            href="#get-started"
            className="rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/35 active:scale-[0.98]"
          >
            Get Started Free
          </a>
        </div>
      </div>
    </header>
  );
}
