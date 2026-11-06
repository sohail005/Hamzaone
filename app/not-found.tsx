import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NotFoundView } from "@/components/NotFoundView";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <NotFoundView />
      </main>
      <Footer />
    </>
  );
}
