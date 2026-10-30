import { Link, useSearch, useLocation } from "wouter";
import { ArrowRight, Search, X, Heart, ShoppingCart, SlidersHorizontal, Star } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useEffect, useState, useMemo } from "react";
import { fetchProducts, trackView, type Product } from "@/lib/api";
import { useCategories } from "@/hooks/useCategories";
import { useSiteSettings, applyCardMarkup } from "@/contexts/SiteSettingsContext";
import { useFavorites } from "@/hooks/useFavorites";

function useFilters(validCategoryIds: Set<string>): { category: string; bestseller: boolean; designAutoral: boolean; prontaEntrega: boolean; searchTerm: string } {
  const search = useSearch();
  return useMemo(() => {
    const params = new URLSearchParams(search);
    const raw = params.get("categoria") ?? "";
    return {
      category: validCategoryIds.has(raw) ? raw : "",
      bestseller: params.get("destaque") === "1",
      designAutoral: params.get("design") === "1",
      prontaEntrega: params.get("prontaEntrega") === "1",
      searchTerm: params.get("busca") ?? "",
    };
  }, [search, validCategoryIds]);
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function Modelos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const { categories: CATEGORIES, displayName, getCategory } = useCategories();
  const validCategoryIds = useMemo(() => new Set(CATEGORIES.map((c) => c.id)), [CATEGORIES]);
  const { category: activeCategory, bestseller: onlyBestsellers, designAutoral: onlyDesignAutoral, prontaEntrega: onlyProntaEntrega, searchTerm } = useFilters(validCategoryIds);
  useEffect(() => { setQuery(searchTerm); }, [searchTerm]);
  const activeCatDef = getCategory(activeCategory);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { pixDiscountPct, maxInstallments } = useSiteSettings();
  const [, navigate] = useLocation();

  useEffect(() => {
    const path = onlyBestsellers
      ? "/modelos?destaque=1"
      : onlyDesignAutoral
      ? "/modelos?design=1"
      : activeCategory ? `/modelos?categoria=${activeCategory}` : "/modelos";
    trackView({ path });
  }, [activeCategory, onlyBestsellers]);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    let avail = products.filter((p) => p.disponibilidade);
    if (onlyBestsellers) avail = avail.filter((p) => p.bestseller);
    if (onlyDesignAutoral) avail = avail.filter((p) => p.designAutoral);
    if (onlyProntaEntrega) avail = avail.filter((p) => (p as Product & { prontaEntrega?: boolean }).prontaEntrega === true);
    if (activeCategory) avail = avail.filter((p) => p.category === activeCategory);
    if (priceRange) {
      avail = avail.filter((p) => {
        const pct = p.priceAdjustmentPercent;
        const adjusted = (!pct || !Number.isFinite(pct)) ? p.price : Math.round(p.price * (1 + pct / 100) * 100) / 100;
        const lo = priceRange.min ?? 0;
        const hi = priceRange.max ?? Number.MAX_SAFE_INTEGER;
        return adjusted > 0 && adjusted >= lo && adjusted <= hi;
      });
    }
    const q = normalize(query.trim());
    if (q) {
      avail = avail.filter((p) => {
        const full = normalize(displayName(p.name, p.category));
        return full.includes(q);
      });
    }
    return [...avail].reverse();
  }, [products, activeCategory, onlyBestsellers, onlyDesignAutoral, onlyProntaEntrega, query, priceRange]);

  const [priceMinInput, setPriceMinInput] = useState<string>("");
  const [priceMaxInput, setPriceMaxInput] = useState<string>("");

  function applyPriceFilter() {
    const min = priceMinInput.trim() === "" ? 0 : Number(priceMinInput);
    const max = priceMaxInput.trim() === "" ? Number.MAX_SAFE_INTEGER : Number(priceMaxInput);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < 0) return;
    if (priceMinInput.trim() === "" && priceMaxInput.trim() === "") {
      setPriceRange(null);
      return;
    }
    setPriceRange({ min, max });
  }
  function clearPriceFilter() {
    setPriceMinInput("");
    setPriceMaxInput("");
    setPriceRange(null);
  }

  const heading = onlyBestsellers
    ? "⭐ Bestsellers"
    : onlyDesignAutoral
    ? "Design Autorais"
    : onlyProntaEntrega
    ? "Pronta Entrega"
    : activeCatDef
    ? activeCatDef.label
    : "Todos os modelos";

  return (
    <div className="min-h-screen flex flex-col w-full bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-grow pb-20 sm:pb-8">
        <section className="py-5 md:py-10 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-left mb-4 md:mb-6">
              <p className="text-[10px] tracking-[0.2em] uppercase text-accent mb-1 font-semibold">Catálogo</p>
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-1" data-testid="text-catalog-title">
                {heading}
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm leading-snug">
                Personalize cada peça em <strong className="text-foreground">metragem, tecido e espuma</strong>.
              </p>
            </div>

            {/* Search */}
            <div className="max-w-xl mb-3 relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome do modelo…"
                className="w-full bg-background border border-border rounded-full py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                data-testid="input-search-products"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar busca"
                  data-testid="button-clear-search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 mb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-testid="category-filter">
              <Link href="/modelos" className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border ${!activeCategory && !onlyBestsellers && !onlyDesignAutoral && !onlyProntaEntrega ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>Todos</Link>
              <Link href="/modelos?destaque=1" className={`shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-medium border ${onlyBestsellers ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}><Star className="w-3.5 h-3.5" /> Bestsellers</Link>
              <Link href="/modelos?design=1" className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border ${onlyDesignAutoral ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>Design Autorais</Link>
              <Link href="/modelos?prontaEntrega=1" className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border ${onlyProntaEntrega ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>Pronta Entrega</Link>
            </div>
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-3 mb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-testid="category-scroll">
              {CATEGORIES.map((c) => <Link key={c.id} href={`/modelos?categoria=${c.id}`} className={`shrink-0 px-3 py-1.5 rounded-full text-xs border ${activeCategory === c.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>{c.label}</Link>)}
            </div>
            <div className="mb-5 border-b border-border/60 pb-3" data-testid="price-filter">
              <button type="button" onClick={() => setShowPriceFilter((value) => !value)} aria-expanded={showPriceFilter} className="inline-flex items-center gap-2 text-xs font-medium text-foreground"><SlidersHorizontal className="w-4 h-4" /> Filtrar por preço {priceRange ? "• Ativo" : ""}</button>
              {showPriceFilter && <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs text-muted-foreground">De R$</span><input type="number" min={0} value={priceMinInput} onChange={(e) => setPriceMinInput(e.target.value)} placeholder="0" className="w-24 border border-border rounded-md p-2 text-xs" data-testid="input-price-min" />
                <span className="text-xs text-muted-foreground">Até R$</span><input type="number" min={0} value={priceMaxInput} onChange={(e) => setPriceMaxInput(e.target.value)} placeholder="Sem limite" className="w-28 border border-border rounded-md p-2 text-xs" data-testid="input-price-max" />
                <button type="button" onClick={applyPriceFilter} className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-xs" data-testid="button-apply-price">Aplicar</button>
                {(priceRange || priceMinInput || priceMaxInput) && <button type="button" onClick={clearPriceFilter} className="text-xs underline">Limpar</button>}
              </div>}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-muted/30 rounded-lg h-72 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl max-w-md mx-auto">
                <p className="text-muted-foreground mb-4">
                  {query
                    ? `Nenhum modelo encontrado para "${query}".`
                    : activeCatDef
                    ? `Nenhum modelo de ${activeCatDef.label} disponível no momento.`
                    : "Nenhum modelo disponível no momento."}
                </p>
                {(activeCatDef || onlyBestsellers || query) && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-primary font-medium hover:underline"
                  >
                    <Link href="/modelos">Ver todos os modelos</Link>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group group/card flex flex-col bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl cursor-pointer"
                    onClick={() => navigate(`/produto/${product.id}`)}
                    data-testid={`card-product-${product.id}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
                      <div className="absolute inset-0 bg-muted/30 animate-pulse" aria-hidden="true" />
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={displayName(product.name, product.category)}
                          className="relative w-full h-full object-contain object-center transition-all duration-700 group-hover/card:scale-105 opacity-0"
                          loading="lazy"
                          ref={(img) => {
                            if (img?.complete && img.naturalWidth > 0) {
                              img.classList.remove("opacity-0");
                              const shimmer = img.parentElement?.firstElementChild as HTMLElement | null;
                              if (shimmer && shimmer !== img) shimmer.style.display = "none";
                            }
                          }}
                          onLoad={(e) => {
                            const img = e.currentTarget;
                            img.classList.remove("opacity-0");
                            const shimmer = img.parentElement?.firstElementChild as HTMLElement | null;
                            if (shimmer && shimmer !== img) shimmer.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs">
                          Sem foto
                        </div>
                      )}
                      {product.category && (
                        <span className="absolute top-3 left-3 text-[10px] font-semibold tracking-wider uppercase bg-white/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-full border border-border/50">
                          {getCategory(product.category)?.label}
                        </span>
                      )}
                      {(product as any).designAutoral && (
                        <span className="absolute top-3 left-3 flex items-center gap-1.5 text-[9px] font-bold tracking-[0.15em] uppercase bg-white text-black border border-black px-2.5 py-1 rounded-full">
                          DESIGN AUTORAL
                          <img src="/assets/crown.png" alt="coroa" className="h-3.5 w-auto object-contain" />
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                        className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        aria-label={isFavorite(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        data-testid={`button-favorite-${product.id}`}
                      >
                        <Heart className={`w-4 h-4 transition-colors ${isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-foreground/60"}`} />
                      </button>
                    </div>
                    <div className="p-3 md:p-5 flex flex-col flex-grow">
                      <h3
                        className="text-sm md:text-lg font-serif font-bold text-foreground group-hover/card:text-primary transition-colors leading-tight mb-2"
                        data-testid={`text-product-name-${product.id}`}
                      >
                        {displayName(product.name, product.category)}
                      </h3>
                      {(() => {
                        const pct = product.priceAdjustmentPercent;
                        const adjustedPrice = (!pct || !Number.isFinite(pct)) ? product.price : Math.round(product.price * (1 + pct / 100) * 100) / 100;
                        return adjustedPrice > 0 ? (
                          <div className="space-y-0.5 mb-2" data-testid={`text-product-price-${product.id}`}>
                            {(() => {
                              const lbl = (product as any).displaySizeLabel ||
                                (product.sizes?.filter((s: any) => s.basePrice > 0).sort((a: any, b: any) => a.basePrice - b.basePrice)[0]?.label ?? "");
                              return lbl ? <p className="text-[11px] text-muted-foreground/70">{lbl}</p> : null;
                            })()}
                            <p className="text-sm font-bold text-green-700">
                              PIX R$ {adjustedPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cartão: {maxInstallments}x de R$ {(applyCardMarkup(adjustedPrice, pixDiscountPct) / maxInstallments).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground mb-2">Consultar valor</span>
                        );
                      })()}
                      {product.description && (
                        <p
                          className="text-xs text-muted-foreground leading-relaxed flex-grow line-clamp-2"
                          data-testid={`text-product-desc-${product.id}`}
                        >
                          {product.description}
                        </p>
                      )}
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                        <span className="hidden sm:flex text-xs font-medium text-primary items-center gap-1">
                          Ver detalhes <ArrowRight className="w-3 h-3 transform group-hover/card:translate-x-1 transition-transform" />
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); navigate(`/produto/${product.id}`); }}
                          className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                          aria-label="Adicionar ao carrinho"
                          data-testid={`button-cart-${product.id}`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
