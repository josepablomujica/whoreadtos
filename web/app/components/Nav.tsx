import Link from 'next/link';

interface NavProps {
  maxWidth?: string;
  hideCtaOnMobile?: boolean;
  ctaText?: string;
}

export default function Nav({
  maxWidth = 'max-w-5xl',
  hideCtaOnMobile = false,
  ctaText = 'Add to Chrome',
}: NavProps) {
  return (
    <nav className="border-b border-gray-100">
      <div className={`${maxWidth} mx-auto px-6 h-14 flex items-center justify-between`}>
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-[#1D9E75] text-lg tracking-tight">
            Who Read ToS
          </Link>
          <Link href="/rankings" className="text-sm font-medium text-gray-600 hover:text-[#1D9E75] transition-colors">
            Rankings
          </Link>
          <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-[#1D9E75] transition-colors">
            Blog
          </Link>
        </div>
        <a
          href="#"
          className={`${hideCtaOnMobile ? 'hidden sm:block ' : ''}bg-[#1D9E75] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#179165] transition-colors`}
        >
          {ctaText}
        </a>
      </div>
    </nav>
  );
}
