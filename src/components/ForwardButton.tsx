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
      className="fixed right-3 top-32 sm:top-40 z-50 inline-flex items-center justify-center w-10 h-10 rounded-full bg-background border border-[#c9a96e]/60 text-[#c9a96e] hover:bg-[#c9a96e]/10 hover:border-[#c9a96e] shadow-md transition-all"
    >
      <ChevronRight className="w-5 h-5" />
    </button>
  );
}
