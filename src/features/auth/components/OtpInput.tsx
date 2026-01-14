import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function OtpInput({ length = 6, value, onChange, error, disabled }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    
    // Only allow single digit
    if (val.length > 1) {
      const char = val[val.length - 1];
      if (/^\d$/.test(char)) {
        const newValue = value.slice(0, index) + char + value.slice(index + 1);
        onChange(newValue);
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus();
          setActiveIndex(index + 1);
        }
      }
      return;
    }
    
    if (/^\d$/.test(val) || val === '') {
      const newValue = value.slice(0, index) + (val || ' ') + value.slice(index + 1);
      onChange(newValue.replace(/ /g, ''));
      
      if (val && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pastedData);
    
    if (pastedData.length === length) {
      inputRefs.current[length - 1]?.focus();
      setActiveIndex(length - 1);
    } else {
      inputRefs.current[pastedData.length]?.focus();
      setActiveIndex(pastedData.length);
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
    inputRefs.current[index]?.select();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-3">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={value[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={cn(
              'w-12 h-14 text-center text-2xl font-semibold rounded-xl border-2 transition-all duration-200',
              'focus:outline-none',
              disabled && 'opacity-50 cursor-not-allowed',
              error
                ? 'border-error bg-error/5'
                : activeIndex === index
                  ? 'border-primary bg-primary-50 shadow-md'
                  : value[index]
                    ? 'border-primary-200 bg-primary-50/50'
                    : 'border-border bg-champagne hover:border-primary-200'
            )}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-error text-center mt-2">{error}</p>
      )}
    </div>
  );
}

