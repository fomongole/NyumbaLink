import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-0', className)}>
      <Image
        src="/logo2.png"
        alt="Rentora Logo"
        width={72}
        height={72}
        className="shrink-0 object-contain"
        priority
      />
      {showText && (
        <div className="flex flex-col justify-center leading-none tracking-tight">
          <div className="flex items-center text-[1.65rem]">
            <span className="font-extrabold text-primary">RENTORA</span>
          </div>
          <span className="text-[0.75rem] font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
            HOUSELINK UGANDA
          </span>
        </div>
      )}
    </div>
  );
}