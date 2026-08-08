"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// A simple tabs implementation without relying on Radix UI
const TabsContext = React.createContext<{
  value: string
  onChange: (value: string) => void
} | null>(null)

function Tabs({ 
  defaultValue, 
  value, 
  onValueChange,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}) {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '')
  
  const onChange = React.useCallback((newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
  }, [onValueChange])
  
  return (
    <TabsContext.Provider value={{ value: selectedValue, onChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ 
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function TabsTrigger({
  value,
  children,
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string
}) {
  const context = React.useContext(TabsContext)
  const isActive = context?.value === value
  
  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50",
        className
      )}
      onClick={() => context?.onChange(value)}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({
  value,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string
}) {
  const context = React.useContext(TabsContext)
  const isActive = context?.value === value
  
  if (!isActive) return null
  
  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent } 