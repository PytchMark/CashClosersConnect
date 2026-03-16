import Image from "next/image";

const CASH_CLOSERS_LOGO_URL =
  "https://res.cloudinary.com/dd8pjjxsm/image/upload/v1773081022/WhatsApp_Image_2025-09-29_at_09.39.54_adslkb.jpg";

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 64, className }: BrandLogoProps) {
  return (
    <Image
      src={CASH_CLOSERS_LOGO_URL}
      alt="Cash Closers logo"
      width={size}
      height={size}
      unoptimized
      className={`rounded-xl object-cover shadow-gold ${className ?? ""}`.trim()}
    />
  );
}
