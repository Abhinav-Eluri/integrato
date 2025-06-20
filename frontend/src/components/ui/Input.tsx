import React from 'react';
import { cn } from '@/utils/cn';
import { InputProps } from '@/types';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      error,
      label,
      helperText,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = props.id || props.name;

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium',
              error
                ? 'text-destructive'
                : 'text-gray-700 dark:text-gray-300',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        {/* Input */}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Default styles
            'border-input bg-background text-foreground',
            'focus:ring-primary/20 focus:border-primary',
            // Error styles
            error && [
              'border-destructive',
              'focus:ring-destructive/20 focus:border-destructive',
            ],
            className
          )}
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error || helperText ? `${inputId}-description` : undefined
          }
          {...props}
        />

        {/* Helper text or error message */}
        {(error || helperText) && (
          <p
            id={`${inputId}-description`}
            className={cn(
              'text-sm',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;