import React, { forwardRef } from "react"
import { Button as NextUIButton, ButtonProps } from "@nextui-org/react"

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children, className = "", ...rest } = props
  
  return (
    <NextUIButton
      ref={ref}
      {...rest}
      className={`font-mono ${className}`}
    >
      {children}
    </NextUIButton>
  )
})

Button.displayName = "Button" 