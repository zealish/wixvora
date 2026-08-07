import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function GuestLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col scrollbar-accent">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
