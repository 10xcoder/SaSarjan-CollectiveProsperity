// Simple toast hook for admin panel
// In a production app, you'd want to implement a proper toast system

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = ({ title, description, variant }: ToastProps) => {
    // For now, we'll use browser alerts
    // In production, integrate with a proper toast library
    const message = `${title}${description ? '\n' + description : ''}`
    
    if (variant === "destructive") {
      console.error(message)
      alert(`Error: ${message}`)
    } else {
      console.log(message)
      alert(message)
    }
  }

  return { toast }
}