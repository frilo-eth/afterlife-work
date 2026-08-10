// This is a simplified toast implementation for compatibility with the admin page
// In a real implementation, you would want to use a proper toast library

export type ToastProps = {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

// Simple implementation that uses browser alerts for now
export function toast(props: ToastProps) {
  const message = `${props.title}${props.description ? `: ${props.description}` : ''}`

  // In a real implementation, this would show a proper toast
  // For now, we'll just log to console to avoid interrupting the user
  console.log(`[Toast ${props.variant || 'default'}]:`, message)

  // Return a dummy object for chaining
  return {
    success: (msg: string) => console.log('[Toast success]:', msg),
    error: (msg: string) => console.log('[Toast error]:', msg),
  }
}
