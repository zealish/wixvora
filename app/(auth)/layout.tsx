export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="hero-bg flex min-h-screen flex-col justify-between bg-[#FAFAFC]">
      {children}
    </div>
  );
}
