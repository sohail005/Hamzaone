import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CartHydration } from "@/components/CartHydration";
import { Toaster } from "@/components/Toaster";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartHydration />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <Toaster />
    </>
  );
}
