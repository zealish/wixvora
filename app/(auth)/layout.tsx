export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#FAFAFC] hero-bg">
      {children}
    </div>
  );
}
