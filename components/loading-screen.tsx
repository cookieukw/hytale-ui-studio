import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function LoadingScreen() {
  const [show, setShow] = useState(true);

  // Smooth fade out
  useEffect(() => {
    return () => setShow(false);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300",
        show ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <img
          src="/hytale-studio_foreground.png"
          alt="Hytale Studio"
          className="h-24 w-24 rounded-lg shadow-lg mb-4 animate-in zoom-in duration-500 bg-primary"
        />
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Hytale UI Studio
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-2">
          <Spinner className="h-4 w-4" />
          <span className="text-sm">Loading components...</span>
        </div>
      </div>
    </div>
  );
}
