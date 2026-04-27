import { ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export function ForwardButton() {
  const [location, setLocation] = useLocation();

  if (location === "/" || location.startsWith("/sign-") || location.startsWith("/admin")) {
    return null;
  }

  const handleForward = () => {
    window.history.forward();
  };

  return (
    <button
      type="button"
      onClick={handleForward}
      aria-label="Avançar"
      data-testid="button-global-forward"
      className="fixed right-3 top-20 z-40 inline-flex items-center justify-center w-9 h-9 rounded-full bg-background/70 hover:bg-background text-foreground/70 hover:text-foreground border border-border/60 backdrop-blur-sm shadow-sm transition-all opacity-70 hover:opacity-100"
    >
      <ChevronRight className="w-5 h-5" />
    </button>
  );
}
