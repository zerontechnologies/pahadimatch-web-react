import { useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  getYear,
  getMonth,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  setMonth,
  setYear,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
}

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const monthLabels = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const parseDate = (input?: string): Date | undefined => {
  if (!input) return undefined;
  const date = new Date(input);
  return isNaN(date.getTime()) ? undefined : date;
};

const toInputValue = (date: Date) => date.toISOString().split('T')[0];

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  error,
  minDate,
  maxDate,
}: DatePickerProps) {
  const selectedDate = parseDate(value);
  const initialMonth = selectedDate || new Date();
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);
  const [showYearMonthSelect, setShowYearMonthSelect] = useState(false);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const days: Date[] = [];
    let current = start;

    while (current <= end) {
      days.push(current);
      current = addDays(current, 1);
    }
    return days;
  }, [currentMonth]);

  const isDisabled = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    return false;
  };

  const handleSelect = (date: Date) => {
    if (isDisabled(date)) return;
    onChange?.(toInputValue(date));
    setOpen(false);
    setCurrentMonth(date);
  };

  const handleMonthChange = (monthIndex: string) => {
    const newMonth = setMonth(currentMonth, parseInt(monthIndex));
    setCurrentMonth(newMonth);
    setShowYearMonthSelect(false);
  };

  const handleYearChange = (year: string) => {
    const newMonth = setYear(currentMonth, parseInt(year));
    setCurrentMonth(newMonth);
    setShowYearMonthSelect(false);
  };

  const getYearRange = () => {
    const currentYear = getYear(new Date());
    const minYear = minDate ? getYear(minDate) : currentYear - 100;
    const maxYear = maxDate ? getYear(maxDate) : currentYear;
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  };

  return (
    <div className="space-y-1.5 relative z-1">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              'w-full inline-flex items-center justify-between rounded-lg border bg-surface px-3 py-2.5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary',
              error ? 'border-error' : 'border-border'
            )}
          >
            <span className={cn('text-sm', selectedDate ? 'text-text' : 'text-text-muted')}>
              {selectedDate ? format(selectedDate, 'dd MMM yyyy') : placeholder}
            </span>
            <CalendarDays className="w-4 h-4 text-text-muted" />
          </button>
        </Popover.Trigger>
        <Popover.Content
          className="w-[320px] rounded-xl border border-border bg-surface shadow-lg p-4 focus:outline-none"
          sideOffset={6}
        >
          {!showYearMonthSelect ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  className="p-2 rounded-md hover:bg-champagne text-text-muted transition-colors"
                  onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowYearMonthSelect(true)}
                  className="text-sm font-semibold text-text hover:text-primary transition-colors px-2 py-1 rounded"
                >
                  {format(currentMonth, 'MMMM yyyy')}
                </button>
                <button
                  type="button"
                  className="p-2 rounded-md hover:bg-champagne text-text-muted transition-colors"
                  onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs text-text-muted mb-2">
                {dayLabels.map((day) => (
                  <div key={day} className="font-semibold">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 text-sm">
                {calendarDays.map((day) => {
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const muted = !isSameMonth(day, currentMonth);
                  const disabled = isDisabled(day);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelect(day)}
                      className={cn(
                        'h-10 rounded-md transition-all flex items-center justify-center',
                        muted ? 'text-text-muted/70' : 'text-text',
                        disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-primary-50',
                        isSelected && 'bg-primary text-white hover:bg-primary'
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowYearMonthSelect(false)}
                  className="p-2 rounded-md hover:bg-champagne text-text-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-text">Select Month & Year</span>
                <div className="w-10" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Month</label>
                  <Select
                    value={String(getMonth(currentMonth))}
                    onValueChange={handleMonthChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthLabels.map((month, index) => (
                        <SelectItem key={index} value={String(index)}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Year</label>
                  <Select
                    value={String(getYear(currentMonth))}
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {getYearRange().map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Root>

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}


