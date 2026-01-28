"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-light tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group",
  {
    variants: {
      variant: {
        primary: "border border-green-600 hover:border-green-700 bg-green-600 text-white hover:bg-green-700",
        secondary: "border border-green-300 hover:border-green-400 bg-white text-green-700 hover:bg-green-50",
        outline: "border border-green-600 hover:border-green-700 bg-transparent text-green-600 hover:bg-green-50",
        ghost: "border border-transparent hover:border-green-300 bg-transparent text-green-600 hover:bg-green-50",
        danger: "border border-red-600 hover:border-red-700 bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "px-4 py-2 text-xs gap-2",
        md: "px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm gap-2 sm:gap-3",
        lg: "px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base gap-3 sm:gap-4",
      },
      rounded: {
        true: "rounded-lg sm:rounded-xl md:rounded-2xl",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: false,
    },
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  showArrow?: boolean;
  asLink?: boolean;
  href?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant,
  size,
  isLoading = false,
  showArrow = false,
  asLink = false,
  href,
  rounded,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const combinedClasses = cn(buttonVariants({ variant, size, rounded }), className);

  const content = (
    <>
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" />
          <span>LOADING...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex items-center justify-center shrink-0">{icon}</span>}
          <span>{children}</span>
          {showArrow && (
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
          )}
        </>
      )}
    </>
  );

  if (asLink && href) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={combinedClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
}

export { buttonVariants };
