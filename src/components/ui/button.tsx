import React, { forwardRef } from "react"
import { Button as NextUIButton, type ButtonProps as NextUIButtonProps } from "@nextui-org/react"

// Define shadcn-style variants we want to support
type ShadcnVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

// Extended props to support shadcn-style variants
export interface ButtonProps extends Omit<NextUIButtonProps, 'variant'> {
  variant?: ShadcnVariant;
}

// Map shadcn variants to NextUI variants
const variantMap: Record<ShadcnVariant, NextUIButtonProps['variant']> = {
  default: 'solid',
  destructive: 'solid', // With custom color
  outline: 'bordered',
  secondary: 'flat',
  ghost: 'ghost',
  link: 'light'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children, className = "", variant = "default", ...rest } = props;
  
  // Map the shadcn variant to NextUI variant
  const nextUIVariant = variantMap[variant] || 'solid';
  
  // Add custom color for destructive variant
  const color = variant === 'destructive' ? 'danger' : undefined;
  
  return (
    <NextUIButton
      ref={ref}
      variant={nextUIVariant}
      color={color}
      {...rest}
      className={`font-mono ${className}`}
    >
      {children}
    </NextUIButton>
  );
});

Button.displayName = "Button"; 