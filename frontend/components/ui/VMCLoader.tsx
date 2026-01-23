import Image from "next/image";

interface VMCLoaderProps {
  size?: number;
  className?: string;
}

export default function VMCLoader({ size = 64, className = "" }: VMCLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/VMC.webp"
        alt="Loading..."
        width={size}
        height={size}
        className="animate-pulse"
        priority
      />
    </div>
  );
}