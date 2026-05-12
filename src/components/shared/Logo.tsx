import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  contained?: boolean;
}

export function Logo({ className, showText = true, contained = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'shrink-0',
          contained && 'bg-white rounded-xl p-1.5 shadow-sm',
        )}
      >
        <Image
          src="/logo_no_bg.png"
          alt="Rentora Logo"
          width={contained ? 44 : 72}
          height={contained ? 44 : 72}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col justify-center leading-none tracking-tight">
          <div className="flex items-center text-[1.65rem]">
            <span className="font-extrabold text-primary">RENTORA</span>
          </div>
          <span className="text-[0.75rem] font-bold tracking-[0.2em] text-zinc-400">
            HOUSELINK UGANDA
          </span>
        </div>
      )}
    </div>
  );
}