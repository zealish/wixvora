import Link from "next/link";

export function AuthFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white/80 py-6 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs font-medium text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">
            WIX<span className="text-brand-600">VORA</span>
          </span>
          <span>© 2026 Wixvora. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#" className="hover:text-brand-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-brand-600 transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-brand-600 transition-colors">
            Security
          </Link>
          <Link href="#" className="hover:text-brand-600 transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
