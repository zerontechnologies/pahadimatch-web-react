import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function VerificationBadge({
  isVerified,
  size = 'md',
  showText = false,
  className,
}: VerificationBadgeProps) {
  if (!isVerified) return null;

  return (
    <div className={cn('flex items-center gap-1 text-success', className)}>
      <CheckCircle className={cn(sizeClasses[size], 'fill-success/20')} />
      {showText && (
        <span className="text-xs font-medium text-success">Verified</span>
      )}
    </div>
  );
}

