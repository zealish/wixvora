import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function GuestLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
