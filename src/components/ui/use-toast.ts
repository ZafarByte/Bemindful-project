import { useCallback } from "react";

export function useToast() {
  const toast = useCallback(({ title, description, variant }) => {
    // Simple fallback: use alert for demonstration
    alert(`${title}\n${description}`);
    // You can replace this with a real toast implementation
  }, []);

  return { toast };
}
