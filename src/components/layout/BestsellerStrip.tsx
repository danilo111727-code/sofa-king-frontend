import { useEffect, useState } from "react";
import { Link } from "wouter";
import { fetchProducts, type Product } from "@/lib/api";
import { displayName } from "@/lib/categories";

export function BestsellerStrip() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then((all) => setItems(all.filter((p) => p.disponibilidade && p.bestseller)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border-t border-border/50 border-b border-border/50 py-2 sm:py-3 overflow-hidden">
        <div className="flex items-end gap-4 sm:gap-8 whitespace-nowrap px-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-[72px] h-[72px] sm:w-[150px] sm:h-[150px] bg-muted/50 animate-pulse rounded-sm" />
              <div className="w-[60px] h-[10px] bg-muted/50 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  const loop = [...items, ...items, ...items];

  return (
    <div className="bg-white border-t border-border/50 border-b border-border/50 py-2 sm:py-3 overflow-hidden" data-testid="bestseller-strip">
      <div className="flex items-end gap-4 sm:gap-8 whitespace-nowrap animate-marquee">
        {loop.map((p, i) => (
          <Link
            key={`${p.id}-${i}`}
            href={`/produto/${p.id}`}
            className="shrink-0 flex flex-col items-center text-center group w-[80px] sm:w-[160px]"
            data-testid={`bestseller-item-${p.id}`}
          >
            <div className="w-[72px] h-[72px] sm:w-[150px] sm:h-[150px] overflow-hidden bg-white">
              {p.image ? (
                <img
                  src={p.image}
                  alt={displayName(p.name, p.category)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-[10px]">
                  Sem foto
                </div>
              )}
            </div>
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-medium text-foreground group-hover:text-primary leading-tight whitespace-normal line-clamp-2">
              {displayName(p.name, p.category)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
