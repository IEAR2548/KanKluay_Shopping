import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export default function Logo({ className = '', width = 120, height = 40, showText = false }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative" style={{ width, height }}>
        {/* We use an img tag instead of next/image temporarily or unoptimized to avoid next.config issues, or just next/image */}
        <Image 
          src="/logo.png" 
          alt="KanKluay Shopping Logo" 
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-green-800 font-bold leading-tight">KanKluay</span>
          <span className="text-orange-500 font-bold leading-tight text-sm">Shopping</span>
        </div>
      )}
    </Link>
  );
}
