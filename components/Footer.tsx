import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-dark text-bg">
      <div className="mx-auto grid grid-cols-2 gap-8 px-4 py-16 sm:px-6 sm:grid-cols-3 md:grid-cols-5" style={{ maxWidth: 1280 }}>
        <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
          <div className="flex items-center gap-2">
            <Image src="/HamzaOne_Icon_light.png" alt="" width={160} height={160} className="h-9 w-9 object-contain" />
            <span className="font-display text-2xl font-extrabold text-white">
              Hamza<span className="text-accent">One</span>
            </span>
          </div>
          <p className="text-sm text-[#B9BBC1]">
            Your Ideas. Made Real.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <strong className="text-sm text-white">Shop</strong>
          <Link href="/shop" className="text-sm text-[#C9CBD0] hover:text-white">All products</Link>
          <Link href="/shop/home-decor" className="text-sm text-[#C9CBD0] hover:text-white">Home decor</Link>
          <Link href="/shop/desk" className="text-sm text-[#C9CBD0] hover:text-white">Desk</Link>
          <Link href="/shop/personalised" className="text-sm text-[#C9CBD0] hover:text-white">Personalised</Link>
        </div>
        <div className="flex flex-col gap-2.5">
          <strong className="text-sm text-white">Services</strong>
          <Link href="/custom-creations" className="text-sm text-[#C9CBD0] hover:text-white">Custom Creations</Link>
          <Link href="/track-order" className="text-sm text-[#C9CBD0] hover:text-white">Track order</Link>
          <Link href="/account" className="text-sm text-[#C9CBD0] hover:text-white">My account</Link>
        </div>
        <div className="flex flex-col gap-2.5">
          <strong className="text-sm text-white">Company</strong>
          <Link href="/about" className="text-sm text-[#C9CBD0] hover:text-white">About</Link>
          <Link href="/contact" className="text-sm text-[#C9CBD0] hover:text-white">Contact</Link>
          <Link href="/faq" className="text-sm text-[#C9CBD0] hover:text-white">FAQ</Link>
        </div>
        <div className="flex flex-col gap-2.5">
          <strong className="text-sm text-white">Policies</strong>
          <Link href="/shipping-policy" className="text-sm text-[#C9CBD0] hover:text-white">Shipping policy</Link>
          <Link href="/return-policy" className="text-sm text-[#C9CBD0] hover:text-white">Returns and refunds</Link>
          <Link href="/privacy-policy" className="text-sm text-[#C9CBD0] hover:text-white">Privacy policy</Link>
          <Link href="/terms" className="text-sm text-[#C9CBD0] hover:text-white">Terms and conditions</Link>
        </div>
      </div>
      <div className="mx-auto flex flex-wrap items-center justify-between gap-4 border-t border-[#2F3237] px-4 py-5 text-[13px] text-[#9EA1A8] sm:px-6" style={{ maxWidth: 1280 }}>
        <span>© 2026 HamzaOne. All prices in INR, inclusive of GST.</span>
        <span>Payments secured by Razorpay</span>
      </div>
    </footer>
  );
}
