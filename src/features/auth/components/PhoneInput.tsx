import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

export function PhoneInput({ value, onChange, error, label, className, ...props }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange(cleaned);
  };

  const formatDisplay = (val: string) => {
    if (val.length <= 5) return val;
    return `${val.slice(0, 5)} ${val.slice(5)}`;
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
          <span className="text-error ml-1">*</span>
        </label>
      )}
      <div className="relative">
        <div className="absolute left-0 top-0 h-full flex items-center px-4 border-r border-border bg-champagne rounded-l-lg">
          <span className="text-sm text-text font-medium">+91</span>
        </div>
        <input
          type="tel"
          value={formatDisplay(value)}
          onChange={handleChange}
          placeholder="98765 43210"
          className={cn(
            'flex h-12 w-full rounded-lg border bg-surface pl-20 pr-4 py-2 text-base text-text transition-all duration-200',
            'placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary',
            error
              ? 'border-error focus:ring-error-light focus:border-error'
              : 'border-border hover:border-primary-300',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
}

