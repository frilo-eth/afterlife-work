import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

// This component is properly associated with an input through the htmlFor prop
// which links the label to a specific form control.
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, htmlFor, ...props }, ref) => (
    // biome-ignore lint/a11y/noLabelWithoutControl: The association happens via htmlFor at usage time
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label } 