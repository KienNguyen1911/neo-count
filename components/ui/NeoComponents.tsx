import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

// --- BUTTON ---
interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant = 'primary', fullWidth, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-bold text-neo-black border-2 border-neo-black transition-all outline-none disabled:opacity-50 disabled:pointer-events-none active:shadow-neo-pressed active:translate-x-[2px] active:translate-y-[2px]";
    
    const variants = {
      primary: "bg-neo-white shadow-neo hover:bg-neo-yellow",
      secondary: "bg-neo-black text-neo-white shadow-neo hover:bg-gray-800",
      ghost: "bg-transparent border-transparent shadow-none hover:bg-black/5 active:translate-x-0 active:translate-y-0"
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          fullWidth ? "w-full" : "",
          "h-12 px-6 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);
NeoButton.displayName = "NeoButton";

// --- INPUT ---
interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const NeoInput = React.forwardRef<HTMLInputElement, NeoInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full border-2 border-neo-black bg-neo-white px-3 py-2 text-lg font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-neo-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-neo-sm focus:shadow-neo transition-all",
          className
        )}
        {...props}
      />
    );
  }
);
NeoInput.displayName = "NeoInput";

// --- LABEL ---
export const NeoLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => (
  <label className={cn("text-sm font-bold uppercase tracking-wider mb-1.5 block text-neo-black", className)} {...props} />
);
