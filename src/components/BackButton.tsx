import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

export function BackButton() {
  const [location, setLocation] = useLocation();

  if (location === "/" || location.startsWith("/sign-") || location.startsWith("/admin")) {
    return null;
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Voltar"
      data-testid="button-global-back"
      className="fixed left-3 top-20 z-40 inline-flex items-center justify-center w-9 h-9 rounded-full bg-background/70 hover:bg-background text-foreground/70 hover:text-foreground border border-border/60 backdrop-blur-sm shadow-sm transition-all opacity-70 hover:opacity-100"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
  );
}
