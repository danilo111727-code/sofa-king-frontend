import {resolveCatalogVariations,type VariationAlbum} from '@/lib/catalogVariations';
import {fetchVariationAlbums} from '@/lib/api';
import { calculateVariationTotal, deliveryLabel, isAllowed, supportsExtendedDepth, type VariationSelection } from "@/lib/productConfigurator";
import { fetchQuote } from "@/lib/api";
import { VariationPicker } from "@/components/VariationPicker";
import { useParams, Link, useLocation } from "wouter";
import { ChevronRight, ArrowLeft, ChevronLeft, Ruler, Info, Check, ShieldCheck, ShoppingCart, ChevronDown, ChevronUp, X, Heart, ZoomIn } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef, type TouchEvent as ReactTouchEvent } from "react";
import { ImageLightbox } from "@/components/ImageLightbox";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  fetchProduct, fetchAlbums, fetchMaterials, trackView,
  resolveAlbumSurcharge, resolveFoamAdjustment,
  type Product, type Album, type Material, type FabricSample,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { displayName } from "@/lib/categories";
import { useSiteSettings, applyCardMarkup } from "@/contexts/SiteSettingsContext";
import { DiagramaViewer } from "@/components/DiagramaViewer";


// Vector contours traced from the approved artwork: crisp at every zoom level.
function MeasurementDrawing({kind,label,large=false}:{kind:string;label:string;large?:boolean}) {
  return (
    <img src={`/images/medidas/${kind}.svg`} alt={`Desenho técnico: ${label}`}
      width="178" height="108"
      className={large ? "measurement-artwork measurement-artwork-large" : "measurement-artwork"} />
  );
}

function brl(v: number | null | undefined): string {
  const n = (v == null || !isFinite(v as number)) ? 0 : (v as number);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Produto() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { add } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [foams, setFoams] = useState<Material[]>([]);
  const [variationAlbums,setVariationAlbums] = useState<VariationAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [sizeIdx, setSizeIdx] = useState(0);
  const [selections, setSelections] = useState<VariationSelection[]>([]);
  const [adding, setAdding] = useState(false);
  const [chosenAlbumId, setChosenAlbumId] = useState<string | null>(null);
  const [albumIdx, setAlbumIdx] = useState(-1);
  const [fabric, setFabric] = useState<FabricSample | null>(null);
  const [selectedFabricKey, setSelectedFabricKey] = useState<string | null>(null);
  const [foamIdx, setFoamIdx] = useState(-1);
  const [foamSheetOpen, setFoamSheetOpen] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(null);
  const [selectedArmSide, setSelectedArmSide] = useState<"left" | "right" | null>(null);
  const [fabricOptionsOpen, setFabricOptionsOpen] = useState(false);
  const [foamOptionsOpen, setFoamOptionsOpen] = useState(false);
  const [sizeSheetOpen, setSizeSheetOpen] = useState(false);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeMeasurement, setActiveMeasurement] = useState<{label:string;kind:string;value:string} | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [previewFabric, setPreviewFabric] = useState<{ albumId: string; index: number } | null>(null);
  const { isFavorite: isFabricFavorite, toggle: toggleFabricFavorite } = useFavorites();
  const fabricFavKey = (albumId: string, index: number) => `fab_${albumId}_${index}`;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false); setSizeIdx(0); setAlbumIdx(-1); setFoamIdx(-1); setFabric(null); setSelectedFabricKey(null); setChosenAlbumId(null); setSelectedSide(null); setSelectedArmSide(null);
    Promise.all([fetchProduct(id), fetchAlbums(), fetchMaterials(),fetchVariationAlbums()])
      .then(([p, al, fo, vars]) => {
        setVariationAlbums(vars);
        setProduct(p);
        const c=p.configuration;
        setAlbums(al.filter(a=>a.active&&isAllowed(a.id,c?.allowedAlbumIds)).map(a=>({...a,fabrics:a.fabrics.filter(f=>isAllowed(f.id,c?.allowedFabricIds))})));
        setFoams(fo.filter(f=>f.active&&isAllowed(f.id,c?.allowedFoamIds)));
        setSelections(resolveCatalogVariations(c,vars).flatMap(g=>g.mode==="quantity"?g.options.filter(o=>(o.minQuantity??0)>0).map(o=>({groupId:g.id,optionId:o.id,quantity:o.minQuantity!})):[]));
        trackView({ productId: p.id, productName: p.name, path: `/produto/${p.id}` });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const gallerySwipeStart = useRef<{ x: number; y: number } | null>(null);
  const settings = useSiteSettings();
  const { pixDiscountPct, maxInstallments } = settings;
  const selectedSize = product?.sizes[sizeIdx];
  const selectedAlbum = albums.find(a=>a.id===chosenAlbumId);
  const selectedFoam = foams[foamIdx];
  const chooseChaiseSide = product?.configuration?.sideChoice?.chaiseOrCorner ?? ((product?.configuration?.availableSides?.length ?? 0)>0);
  const chooseArmSide = product?.configuration?.sideChoice?.arm ?? false;

  const albumSurcharge = useMemo(() => {
    if (!selectedSize || !selectedAlbum) return 0;
    const fromProduct = selectedSize.albumSurcharges?.[selectedAlbum.id];
    if (fromProduct !== undefined) return fromProduct;
    return resolveAlbumSurcharge(selectedAlbum, selectedSize.label);
  }, [selectedAlbum, selectedSize]);

  const foamAdjustment = useMemo(() => {
    if (!selectedSize || !selectedFoam) return 0;
    const fromProduct = selectedSize.foamSurcharges?.[selectedFoam.id];
    if (fromProduct !== undefined) return fromProduct;
    return resolveFoamAdjustment(selectedFoam, selectedSize.label);
  }, [selectedFoam, selectedSize]);
  const adjustedBasePrice = useMemo(() => {
    const base = selectedSize?.basePrice ?? 0;
    const pct = product?.priceAdjustmentPercent;
    if (!pct || !Number.isFinite(pct)) return base;
    return Math.round(base * (1 + pct / 100) * 100) / 100;
  }, [selectedSize, product?.priceAdjustmentPercent]);
  const variationGroups=useMemo(()=>resolveCatalogVariations(product?.configuration,variationAlbums),[product?.configuration,variationAlbums]);
  const variationTotal = calculateVariationTotal(variationGroups,selections);
  const prazo = deliveryLabel(product?.configuration?.delivery,settings.prazoEntregaDias);
  const finalPrice = Math.round((adjustedBasePrice + albumSurcharge + foamAdjustment + variationTotal)*100)/100;

  const pixPrice = finalPrice;
  const cardPrice = useMemo(() => applyCardMarkup(finalPrice, pixDiscountPct), [finalPrice, pixDiscountPct]);
  const installmentPrice = useMemo(() => cardPrice / maxInstallments, [cardPrice, maxInstallments]);
  const fullName = product ? displayName(product.name, product.category) : "";
  const DIAGRAMA_SENTINEL = "__diagrama__";
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const base = product.images && product.images.length > 0
      ? product.images
      : product.image ? [product.image] : [];
    if (product.diagramaUrl && product.diagramaAnotacoes && product.diagramaAnotacoes.length > 0) {
      return [...base, DIAGRAMA_SENTINEL];
    }
    return base;
  }, [product]);

  const lightboxImages = useMemo(
    () => galleryImages.filter((u) => u !== DIAGRAMA_SENTINEL),
    [galleryImages]
  );

  const openLightbox = useCallback(
    (galleryIdx: number) => {
      const img = galleryImages[galleryIdx];
      if (!img || img === DIAGRAMA_SENTINEL) return;
      const lbIdx = lightboxImages.indexOf(img);
      if (lbIdx === -1) return;
      setLightboxIdx(lbIdx);
      setLightboxOpen(true);
    },
    [galleryImages, lightboxImages]
  );

  useEffect(() => { setMainImageIdx(0); }, [product?.id]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [id]);

  // Regra do produto: o tecido escolhido SO e desmarcado quando o usuario
  // explicitamente escolhe outro tecido (tratado no onSelect do preview).
  // Abrir/fechar/trocar de album NAO limpa o tecido. Trocar de produto
  // (navegacao na mesma instancia da pagina) tambem NAO limpa.

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-muted-foreground">Carregando...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Produto não encontrado</h1>
            <p className="text-muted-foreground mb-8">O sofá que você procura não está disponível ou não existe.</p>
            <Button asChild><Link href="/">Voltar para o início</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = async (goToCart: boolean) => {
    if (!selectedSize || adding) return;
    if ((chooseChaiseSide && !selectedSide) || (chooseArmSide && !selectedArmSide)) { toast({title:"Selecione o lado do sofá",description:"Escolha o lado esquerdo ou direito.",variant:"destructive"}); return; }
    setAdding(true);
    try {
    const verified=await fetchQuote(product.id,{sizeLabel:selectedSize.label,albumId:selectedAlbum?.id,fabricId:fabric?.id,foamId:selectedFoam?.id,selections});
    if(verified.total!==finalPrice) { toast({title:"As opções foram atualizadas",description:"Recarregue o modelo para conferir os preços atuais.",variant:"destructive"});return; }
    add({
      productId: product.id,
      productName: fullName,
      productImage: galleryImages[0] || product.image,
      size: { label: selectedSize.label, basePrice: adjustedBasePrice },
      album: selectedAlbum
        ? { id: selectedAlbum.id, name: selectedAlbum.name, surcharge: albumSurcharge }
        : null,
      fabric: fabric ? { id: fabric.id, name: fabric.name, imageUrl: fabric.imageUrl } : null,
      foam: selectedFoam
        ? { id: selectedFoam.id, name: selectedFoam.name, priceAdjustment: foamAdjustment }
        : null,
      variations: selections.filter(s=>s.quantity>0).map(s=>{const g=variationGroups.find(g=>g.id===s.groupId)!;const o=g.options.find(o=>o.id===s.optionId)!;return {groupName:g.name,optionName:o.name,quantity:s.quantity,priceAdjustment:o.priceAdjustment};}),
      delivery:prazo,
      side: chooseChaiseSide ? selectedSide : null,
      armSide: chooseArmSide ? selectedArmSide : null,
      unitPrice: verified.total,
    });
    if (goToCart) {
      navigate("/carrinho");
    } else {
      toast({
        title: "Adicionado ao carrinho",
        description: `${fullName} — ${selectedSize.label} por ${brl(finalPrice)}`,
        duration: 2500,
      });
    }
    } catch(e) { toast({title:"Confira a configuração",description:e instanceof Error?e.message:"Não foi possível validar o preço.",variant:"destructive"}); }
    finally { setAdding(false); }
  };

  const noSizes = product.sizes.length === 0;

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Navbar />

      <main className="flex-grow pb-24 sm:pb-12">
        <div className="bg-secondary/20 py-2.5 sm:py-3 border-b border-border/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Início</Link>
              <ChevronRight className="w-4 h-4 mx-2 text-border" />
              <span>Sofás</span>
              <ChevronRight className="w-4 h-4 mx-2 text-border" />
              <span className="text-foreground font-medium">{fullName}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">
          <div className="flex flex-col gap-5 sm:gap-7 max-w-5xl mx-auto">
            {/* Image Gallery — visual editorial com foto principal em destaque */}
            <div aria-label="Galeria de fotos do sofá" className="space-y-3">
              <div
                className={`aspect-[5/4] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-border/70 relative group shadow-sm ${
                  galleryImages[mainImageIdx] !== DIAGRAMA_SENTINEL ? "cursor-zoom-in" : ""
                }`}
                data-testid="img-product-main"
                onTouchStart={(e) => { const t=e.touches[0]; gallerySwipeStart.current={x:t.clientX,y:t.clientY}; }}
                onTouchEnd={(e) => { const start=gallerySwipeStart.current; gallerySwipeStart.current=null; if(!start || galleryImages.length<2)return; const t=e.changedTouches[0]; const dx=t.clientX-start.x,dy=t.clientY-start.y; if(Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.25){setMainImageIdx(i=>(i+(dx<0?1:-1)+galleryImages.length)%galleryImages.length);gallerySwipeStart.current={x:NaN,y:NaN};} }}
                onClick={() => {if(Number.isNaN(gallerySwipeStart.current?.x)){gallerySwipeStart.current=null;return;} openLightbox(mainImageIdx);}}
              >
                {galleryImages[mainImageIdx] === DIAGRAMA_SENTINEL && product.diagramaUrl && product.diagramaAnotacoes ? (
                  <DiagramaViewer imageUrl={product.diagramaUrl} anotacoes={product.diagramaAnotacoes} />
                ) : (
                  <>
                    <img
                      src={galleryImages[mainImageIdx] || product.image}
                      alt={fullName}
                      className="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.015]"
                    />
                    <div className="product-photo-hint absolute inset-0 flex items-center justify-center opacity-0 transition-opacity pointer-events-none">
                      <div className="bg-black/40 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
                        Toque para ampliar
                      </div>
                    </div>
                  </>
                )}
              </div>
              {galleryImages.length > 1 && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1" data-testid="product-thumbnails">
                  {galleryImages.map((url, i) => (
                    <button
                      key={`${url}-${i}`}
                      onClick={() => setMainImageIdx(i)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border transition-all ${
                        mainImageIdx === i ? "border-primary ring-2 ring-primary/20" : "border-border/70 hover:border-primary/50 opacity-85 hover:opacity-100"
                      }`}
                      data-testid={`thumbnail-${i}`}
                      aria-label={`Ver foto ${i + 1}`}
                    >
                      {url === DIAGRAMA_SENTINEL ? (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <Ruler className="w-5 h-5 text-primary" />
                        </div>
                      ) : (
                        <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col w-full max-w-3xl mx-auto">
              {!product.disponibilidade && (
                <span className="self-start mb-3 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">Indisponível</span>
              )}

              {/* Pacote 2: desenhos técnicos informativos, sem interferir na precificação. */}
              {(() => {
                const measurements = product.configuration?.measurements;
                const items = [
                  { label: "Largura total", value: selectedSize?.label, kind: "width" },
                  { label: "Profundidade total", value: measurements?.totalDepth, kind: "depth" },
                  { label: "Altura do assento", value: measurements?.seatHeight, kind: "seatHeight" },
                  { label: "Altura do encosto", value: measurements?.backHeight, kind: "backHeight" },
                  { label: "Profundidade do assento", value: measurements?.seatDepth, kind: "seatDepth" },
                ];
                const extended = supportsExtendedDepth(product.category, settings.categories?.find(c => c.id === product.category)?.label);
                if (extended) items.push({ label: "Profundidade estendida", value: measurements?.extendedDepth, kind: "extendedDepth" });
                return (
                  <section className="sofa-measurements mb-5" aria-label="Medidas do sofá">
                    <h2 className="measurement-toggle">
                      <Ruler className="measurement-ruler" /> Medidas do sofá
                    </h2>
                    <div id="sofa-measurement-cards" className={`measurement-cards${extended ? " measurement-cards-extended" : ""}`}>
                      {items.map(({ label, value, kind }) => {
                        return (
                          <button type="button" key={kind} onClick={() => setActiveMeasurement({label,kind,value:typeof value === "number" ? (value > 0 ? `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100)} m` : "") : (value || "")})} aria-label={`Ampliar ${label}`} className="measurement-card">
                            <MeasurementDrawing kind={kind} label={label} />
                            <span className="measurement-label">{label}</span>
                            <strong className="measurement-value">{typeof value === "number" ? (value > 0 ? `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100)} m` : "") : (value || "")}</strong>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })()}

              {activeMeasurement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-5" role="presentation" onClick={() => setActiveMeasurement(null)}>
                  <div role="dialog" aria-modal="true" aria-label={activeMeasurement.label} className="relative w-full max-w-sm rounded-2xl bg-background p-6 text-center shadow-xl" onClick={e => e.stopPropagation()}>
                    <button type="button" onClick={() => setActiveMeasurement(null)} aria-label="Fechar medida" className="absolute right-3 top-3 rounded-full p-2 hover:bg-secondary"><X className="h-5 w-5" /></button>
                    <h3 className="mb-4 text-lg font-semibold">{activeMeasurement.label}</h3>
                    <MeasurementDrawing kind={activeMeasurement.kind} label={activeMeasurement.label} large />
                    {activeMeasurement.value && <p className="mt-4 text-xl font-semibold text-primary">{activeMeasurement.value}</p>}
                  </div>
                </div>
              )}

              {/* Vagas e prazo — configuração global do site */}
              <div className="flex flex-wrap gap-2 mb-3">
                {settings.vagas > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/15">
                    <Check className="w-3.5 h-3.5" /> Produção disponível
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-800 text-xs font-medium border border-orange-200">
                    <Info className="w-3.5 h-3.5" /> Consultar vaga
                  </span>
                )}
                {prazo && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm border border-border">
                    <strong className="text-foreground">{prazo}</strong>
                  </span>
                )}
              </div>

              {/* Price highlight — mostra o preço total e condições de pagamento antes das seleções */}
              {!noSizes && (
                <div className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-4 sm:p-6 mb-5" data-testid="price-highlight">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PIX / À vista</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary leading-tight" data-testid="text-price-highlight">
                    {brl(pixPrice)}
                  </p>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-sm text-muted-foreground">
                      No cartão: <strong className="text-foreground">{maxInstallments}x de {brl(installmentPrice)}</strong>{" "}
                      <span className="text-muted-foreground ml-1">({brl(cardPrice)} total)</span>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60">
                    Personalize as opções abaixo para atualizar o valor.
                  </p>
                </div>
              )}

              <Separator className="my-3" />

              {/* Step 1: size */}
              {noSizes ? (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm mb-6">
                  Este modelo ainda não tem metragens cadastradas. Entre em contato pelo WhatsApp para saber o preço.
                </div>
              ) : (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold tracking-tight mb-2.5 text-foreground">
                    1. Escolha a metragem
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSizeSheetOpen(true)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-border bg-background hover:border-primary/60 transition-colors text-left"
                    data-testid="button-open-size-selector"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Ruler className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {selectedSize ? selectedSize.label : "Selecione uma medida…"}
                        </div>
                        {selectedSize && (
                          <div className="text-xs text-muted-foreground">
                            {brl(adjustedBasePrice + resolveAlbumSurcharge(selectedAlbum, selectedSize.label) + resolveFoamAdjustment(selectedFoam, selectedSize.label))}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  </button>
                  <a
                    href={`https://wa.me/5575991495793?text=${encodeURIComponent(`Olá! Tenho interesse no "${fullName}" e gostaria de orçamento em uma medida diferente das padrão. Qual metragem você precisa?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800 border border-green-700/40 hover:border-green-700 rounded-lg px-3 py-2 transition-colors"
                    data-testid="button-custom-size-whatsapp"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
                    Precisa de outra medida? Solicitar orçamento no WhatsApp
                  </a>
                </div>
              )}

              {(chooseChaiseSide || chooseArmSide) && (
                <div className="space-y-4 mb-5">
                  {([{enabled:chooseChaiseSide,kind:"chaise",title:"Escolha o lado do chaise ou canto",value:selectedSide,setValue:setSelectedSide},{enabled:chooseArmSide,kind:"arm",title:"Escolha o lado do braço",value:selectedArmSide,setValue:setSelectedArmSide}] as const).filter(g=>g.enabled).map(group=>(
                    <section key={group.kind} className="rounded-xl border border-border p-3" aria-label={group.title}>
                      <h3 className="text-sm font-semibold mb-1">{group.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">Lado definido olhando o sofá de frente.</p>
                      <div className="grid grid-cols-2 gap-3">
                        {(["left","right"] as const).map(side=>(
                          <button type="button" key={side} aria-pressed={group.value===side} onClick={()=>group.setValue(side)}
                            data-testid={`button-${group.kind}-${side}`}
                            className={`rounded-xl border-2 bg-white p-2 text-center ${group.value===side?"border-primary":"border-gray-200"}`}>
                            <svg viewBox="0 0 180 112" className="w-full h-20" role="img" aria-label={group.title+" "+side}>
                              {group.kind==="arm" ? <g fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round">
                                <rect x="29" y="25" width="122" height="67" rx="7"/><rect x="34" y="27" width="56" height="35" rx="6"/><rect x="90" y="27" width="56" height="35" rx="6"/>
                                <path d="M29 63 Q90 57 151 63 L151 88 L29 88 Z"/><rect x={side==="left"?17:151} y="46" width="13" height="48" rx="3"/>
                              </g> : <g fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round">
                                <rect x="20" y="16" width="140" height="22" rx="5"/><rect x="20" y="38" width="140" height="39" rx="4"/>
                                <path d="M67 38 V77 M113 38 V77"/><rect x={side==="left"?20:113} y="38" width="47" height="63" rx="5"/>
                              </g>}
                            </svg>
                            <span className="text-xs sm:text-sm font-semibold text-black">{group.kind==="arm"?"Braço ":"Lado "}{side==="left"?"esquerdo":"direito"}{group.value===side?" ✓":""}</span>
                          </button>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}

              {/* Step 2: album */}
              {albums.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold tracking-tight mb-2.5 text-foreground">
                    2. Escolha o álbum de tecido
                  </h3>
                  {fabric && (
                    <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium border border-green-200">
                      <Check className="w-4 h-4" />
                      Tecido selecionado: <strong>{fabric.name}</strong>
                    </div>
                  )}
                  <button type="button" onClick={() => setFabricOptionsOpen(v => !v)} aria-expanded={fabricOptionsOpen} className="w-full rounded-xl border border-border bg-background px-3 py-3 mb-2 flex items-center gap-3 text-left hover:border-primary/50" data-testid="toggle-fabric-options">
                    <div className="flex -space-x-2 shrink-0">
                      {(selectedAlbum?.fabrics?.length ? selectedAlbum.fabrics : albums.flatMap(a => a.fabrics)).slice(0,3).map((f,i) => <div key={i} className="h-11 w-11 rounded-lg overflow-hidden border-2 border-background bg-secondary">{f.imageUrl && <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" loading="lazy" />}</div>)}
                    </div>
                    <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{fabric ? fabric.name : selectedAlbum ? selectedAlbum.name : "Escolha seu tecido"}</div><div className="text-xs text-muted-foreground">{albums.reduce((n,a) => n+a.fabrics.length,0)} tecidos · {albums.length} álbuns</div></div>
                    <span className="text-xs font-semibold text-primary whitespace-nowrap">{fabricOptionsOpen ? "Fechar" : fabric ? "Alterar escolha" : "Ver tecidos"}</span>
                  </button>
                  {fabricOptionsOpen && <div className="space-y-2">
                    {albums.map((a, i) => {
                      // Mesma prioridade usada no calculo do preco final:
                      // 1) acrescimo por produto+tamanho (selectedSize.albumSurcharges)
                      // 2) acrescimo do album por tamanho/padrao (resolveAlbumSurcharge)
                      const s = selectedSize
                        ? (selectedSize.albumSurcharges?.[a.id] ?? resolveAlbumSurcharge(a, selectedSize.label))
                        : a.surcharge;
                      const isOpen = albumIdx === i;
                      return (
                        <div key={a.id} className="rounded-xl border border-border/80 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setAlbumIdx(isOpen ? -1 : i)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                              isOpen
                                ? "bg-primary text-primary-foreground"
                                : "bg-transparent text-foreground hover:bg-secondary/50"
                            }`}
                            data-testid={`button-album-${a.id}`}
                            aria-expanded={isOpen}
                          >
                            <div className="min-w-0">
                              <div className="font-semibold flex items-center gap-2">
                                {a.name}
                                {selectedFabricKey && selectedFabricKey.startsWith(`fab_${a.id}_`) && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-green-500/90 text-white px-1.5 py-0.5 rounded">
                                    <Check className="w-3 h-3" /> selecionado
                                  </span>
                                )}
                              </div>
                              <div className="text-xs opacity-80">
                                {s > 0 ? `+${brl(s)}` : s < 0 ? brl(s) : "incluso"}
                                {a.fabrics.length > 0 && (
                                  <> · {a.fabrics.length} {a.fabrics.length === 1 ? "tecido" : "tecidos"}</>
                                )}
                              </div>
                            </div>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground" />
                            )}
                          </button>

                          {isOpen && a.fabrics.length > 0 && (
                            <div className="p-3 bg-secondary/30 border-t border-border">
                              <p className="text-xs text-muted-foreground mb-2">
                                Toque em um tecido para ampliar e favoritar.
                              </p>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {a.fabrics.map((f, fIdx) => {
                                  const favKey = fabricFavKey(a.id, fIdx);
                                  const isSelected = selectedFabricKey === favKey;
                                  const isFav = isFabricFavorite(favKey);
                                  return (
                                    <button
                                      key={`${a.id}-${fIdx}`}
                                      type="button"
                                      onClick={() => setPreviewFabric({ albumId: a.id, index: fIdx })}
                                      className={`group relative flex flex-col items-center gap-1 p-2 rounded-md border bg-background transition-all ${
                                        isSelected
                                          ? "border-green-600 ring-2 ring-green-500/30"
                                          : "border-border hover:border-primary/50"
                                      }`}
                                      title={f.name}
                                      data-testid={`button-fabric-${a.id}-${fIdx}`}
                                    >
                                      <div className="relative w-full aspect-square rounded overflow-hidden bg-secondary">
                                        {f.imageUrl ? (
                                          <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                          <div className="w-full h-full bg-secondary" />
                                        )}
                                        {isFav && (
                                          <span className="absolute top-1 left-1 bg-white/90 rounded-full p-0.5 shadow">
                                            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                                          </span>
                                        )}
                                        {isSelected && (
                                          <span className="absolute top-1 right-1 bg-green-600 text-white rounded-full p-0.5 shadow">
                                            <Check className="w-3 h-3" />
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] font-medium text-center line-clamp-1 w-full">
                                        {f.name}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>}
                </div>
              )}

              {/* Step 3: foam */}
              {foams.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold tracking-tight mb-2.5 text-foreground">
                    3. Escolha a espuma
                  </h3>
                  {selectedFoam && (
                    <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium border border-green-200">
                      <Check className="w-4 h-4" />
                      Espuma selecionada: <strong>{selectedFoam.name}</strong>
                    </div>
                  )}
                  <button type="button" onClick={() => setFoamOptionsOpen(v => !v)} aria-expanded={foamOptionsOpen} className="w-full rounded-xl border border-border bg-background px-3 py-3 mb-2 flex items-center gap-3 text-left hover:border-primary/50" data-testid="toggle-foam-options">
                    <div className="flex -space-x-2 shrink-0">{foams.slice(0,3).map(f => <div key={f.id} className="h-11 w-11 rounded-lg overflow-hidden border-2 border-background bg-secondary">{f.imageUrl && <img src={f.imageUrl} alt={f.name} className="w-full h-full object-contain" loading="lazy" />}</div>)}</div>
                    <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{selectedFoam ? selectedFoam.name : "Escolha sua espuma"}</div><div className="text-xs text-muted-foreground">{foams.length} opções de espuma</div></div>
                    <span className="text-xs font-semibold text-primary whitespace-nowrap">{foamOptionsOpen ? "Fechar" : selectedFoam ? "Alterar escolha" : "Ver espumas"}</span>
                  </button>
                  {foamOptionsOpen && <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {foams.map((f, i) => {
                      // Mesma prioridade usada no calculo do preco final:
                      // 1) acrescimo por produto+tamanho (selectedSize.foamSurcharges)
                      // 2) acrescimo da espuma por tamanho/padrao (resolveFoamAdjustment)
                      const adj = selectedSize
                        ? (selectedSize.foamSurcharges?.[f.id] ?? resolveFoamAdjustment(f, selectedSize.label))
                        : f.priceAdjustment;
                      const isSelected = foamIdx === i;
                      return (
                      <button
                        key={f.id}
                        onClick={() => { setFoamIdx(i); setFoamOptionsOpen(false); setFoamSheetOpen(true); }}
                        className={`relative p-2 rounded-md text-sm font-medium border transition-all text-left flex flex-col ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary ring-2 ring-green-500/40"
                            : "bg-transparent text-foreground border-border hover:border-primary/50"
                        }`}
                        data-testid={`button-foam-${f.id}`}
                      >
                        {isSelected && (
                          <span className="absolute top-1 right-1 bg-green-600 text-white rounded-full p-0.5 shadow z-10">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                        {f.imageUrl && (
                          <div className="w-full aspect-[4/3] rounded bg-white/60 overflow-hidden mb-2 border border-border/50">
                            <img src={f.imageUrl} alt={f.name} className="w-full h-full object-contain" loading="lazy" />
                          </div>
                        )}
                        <div className="font-semibold leading-tight">{f.name}</div>
                        <div className="text-xs opacity-80 mt-0.5">
                          {adj > 0 ? `+${brl(adj)}` : adj < 0 ? brl(adj) : "incluso"}
                        </div>
                      </button>
                      );
                    })}
                  </div>}
                  {selectedFoam && (selectedFoam.weightSupport || selectedFoam.comfortLevel || selectedFoam.useIndication || selectedFoam.longTermBehavior) && (
                    <button
                      type="button"
                      onClick={() => setFoamSheetOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      data-testid="button-show-foam-specs"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Ver ficha técnica — {selectedFoam.name}
                    </button>
                  )}
                </div>
              )}

              <Separator className="my-3" />

              {/* Parcelamento info block */}
              <div className="rounded-xl border border-border bg-card p-5 mb-4">
                <h4 className="font-bold text-base text-foreground mb-3 flex items-center gap-2">
                  <span className="block w-1 h-5 rounded-full bg-accent shrink-0" />
                  Como funciona o parcelamento do projeto:
                </h4>
                <ol className="space-y-3">
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="font-bold text-accent shrink-0">1.</span>
                    <span><strong className="text-foreground">50% de entrada</strong> para iniciar a produção da sua peça no ateliê.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="font-bold text-accent shrink-0">2.</span>
                    <span>Quando a peça está pronta, fazemos um <strong className="text-foreground">vídeo ao vivo</strong> com você — ou você pode <strong className="text-foreground">conferir pessoalmente no ateliê</strong>.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-muted-foreground">
                    <span className="font-bold text-accent shrink-0">3.</span>
                    <span>Aprovado, você paga os <strong className="text-foreground">50% restantes antes da entrega</strong>.</span>
                  </li>
                </ol>
              </div>

              {/* Price + CTA */}
              {!noSizes && (
                <div className="rounded-xl bg-secondary/30 border border-border p-5 mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">PIX / À vista</p>
                  <p className="text-4xl font-bold text-green-700 mt-1" data-testid="text-product-detail-price">
                    {brl(pixPrice)}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground" data-testid="text-installment">
                      No cartão: <strong className="text-foreground">{maxInstallments}x de {brl(installmentPrice)}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid="text-pix-price">
                      Total no cartão: {brl(cardPrice)}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3 space-y-0.5 pt-3 border-t border-border">
                    {selectedSize && <div>• Metragem {selectedSize.label}: {brl(adjustedBasePrice)}</div>}
                    {selectedAlbum && <div>• {selectedAlbum.name}{fabric ? " — " + fabric.name : ""}{albumSurcharge !== 0 ? (": " + (albumSurcharge > 0 ? "+" : "") + brl(albumSurcharge)) : ""}</div>}
                    {selectedFoam && <div>• Espuma {selectedFoam.name}{foamAdjustment !== 0 ? (": " + (foamAdjustment > 0 ? "+" : "") + brl(foamAdjustment)) : ""}</div>}
                  </div>
                </div>
              )}

              <VariationPicker groups={variationGroups} selections={selections} onChange={setSelections}/>
              {variationTotal!==0 && <p className="text-sm text-muted-foreground mb-4">Personalização incluída: {brl(variationTotal)}</p>}
              {settings.vagas === 0 ? (
                <a
                  href="https://wa.me/5575991495793"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 h-14 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold transition-colors shadow-lg"
                >
                  🔔 Consultar vaga pelo WhatsApp
                </a>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleAddToCart(false)}
                    disabled={!product.disponibilidade || noSizes || adding}
                    className="h-14 text-base font-semibold"
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Adicionar ao carrinho
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleAddToCart(true)}
                    disabled={!product.disponibilidade || noSizes || adding}
                    className="h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                    data-testid="button-buy-now"
                  >
                    {product.disponibilidade ? "Comprar agora" : "Indisponível"}
                  </Button>
                </div>
              )}
              <p className="text-xs text-center text-muted-foreground mt-2">
                O fechamento do pedido é feito pelo WhatsApp, direto do seu carrinho.
              </p>
            </div>
          </div>

        </div>
      </main>

      {foamSheetOpen && selectedFoam && (selectedFoam.weightSupport || selectedFoam.comfortLevel || selectedFoam.useIndication || selectedFoam.longTermBehavior) && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-200"
          onClick={() => setFoamSheetOpen(false)}
          data-testid="foam-specs-overlay"
        >
          <div
            className="bg-background w-full sm:max-w-md sm:rounded-lg rounded-t-2xl border-t-2 sm:border-2 border-primary p-5 shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
            data-testid="foam-specs-sheet"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Ficha técnica</div>
                <div className="text-lg font-semibold text-primary">{selectedFoam.name}</div>
              </div>
              <button
                onClick={() => setFoamSheetOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 -m-1"
                aria-label="Fechar"
                data-testid="button-close-foam-specs"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              {selectedFoam.weightSupport && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Peso suportado</dt>
                  <dd className="text-foreground font-medium">{selectedFoam.weightSupport}</dd>
                </div>
              )}
              {selectedFoam.comfortLevel && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Nível de conforto</dt>
                  <dd className="text-foreground font-medium">{selectedFoam.comfortLevel}</dd>
                </div>
              )}
              {selectedFoam.useIndication && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Indicação de uso</dt>
                  <dd className="text-foreground font-medium">{selectedFoam.useIndication}</dd>
                </div>
              )}
              {selectedFoam.longTermBehavior && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Comportamento a longo prazo</dt>
                  <dd className="text-foreground leading-relaxed">{selectedFoam.longTermBehavior}</dd>
                </div>
              )}
            </dl>
            <button
              onClick={() => setFoamSheetOpen(false)}
              className="mt-5 w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90"
              data-testid="button-confirm-foam-specs"
            >
              Entendi, continuar
            </button>
          </div>
        </div>
      )}

      {sizeSheetOpen && product && product.sizes.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-200"
          onClick={() => setSizeSheetOpen(false)}
          data-testid="size-selector-overlay"
        >
          <div
            className="bg-background w-full sm:max-w-md sm:rounded-lg rounded-t-2xl border-t-2 sm:border-2 border-primary shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            data-testid="size-selector-sheet"
          >
            <div className="flex items-start justify-between gap-3 p-5 pb-3 border-b border-border">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Metragem</div>
                <div className="text-lg font-semibold text-primary">Selecione uma medida</div>
              </div>
              <button
                onClick={() => setSizeSheetOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 -m-1"
                aria-label="Fechar"
                data-testid="button-close-size-selector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-3 space-y-2">
              {product.sizes.map((s, i) => {
                const sizeAlbumSurcharge = resolveAlbumSurcharge(selectedAlbum, s.label);
                const sizeFoamAdj = resolveFoamAdjustment(selectedFoam, s.label);
                const pct = product.priceAdjustmentPercent;
                const sizeAdjustedBase = (!pct || !Number.isFinite(pct)) ? s.basePrice : Math.round(s.basePrice * (1 + pct / 100) * 100) / 100;
                const sizeTotal = sizeAdjustedBase + sizeAlbumSurcharge + sizeFoamAdj;
                const sizePix = sizeTotal;
                const sizeCard = applyCardMarkup(sizeTotal, pixDiscountPct);
                const sizeInstallment = sizeCard / maxInstallments;
                const active = sizeIdx === i;
                return (
                  <button
                    key={i}
                    onClick={() => { setSizeIdx(i); setSizeSheetOpen(false); }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-md border text-left transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary/60"
                    }`}
                    data-testid={`button-size-${i}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-primary-foreground" : "border-border"}`}>
                        {active && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{s.label}</div>
                        <div className={`text-[11px] ${active ? "opacity-90" : "text-muted-foreground"}`}>
                          PIX {brl(sizePix)} · {maxInstallments}x {brl(sizeInstallment)}
                        </div>
                        <div className={`text-[11px] ${active ? "opacity-80" : "text-muted-foreground/70"}`}>
                          Total cartão: {brl(sizeCard)}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-sm whitespace-nowrap">{brl(sizeTotal)}</div>
                  </button>
                );
              })}
            </div>
            <div className="p-3 border-t border-border">
              <a
                href={`https://wa.me/5575991495793?text=${encodeURIComponent(`Olá! Tenho interesse no "${fullName}" e gostaria de orçamento em uma medida diferente das padrão. Qual metragem você precisa?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center text-sm font-medium text-green-700 hover:text-green-800 border border-green-700/40 hover:border-green-700 rounded-md px-3 py-2.5 transition-colors"
              >
                Precisa de outra medida? Fale no WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {lightboxOpen && lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIdx}
          altBase={fullName}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setLightboxIdx((i) => Math.min(i + 1, lightboxImages.length - 1))}
          onPrev={() => setLightboxIdx((i) => Math.max(i - 1, 0))}
        />
      )}

      {previewFabric && (() => {
        const previewAlbum = albums.find((a) => a.id === previewFabric.albumId) || selectedAlbum;
        const previewList = previewAlbum?.fabrics ?? [];
        const previewIdx = previewFabric.index;
        const currentFabric = previewList[previewIdx];
        if (!previewAlbum || !currentFabric) return null;
        const currentKey = fabricFavKey(previewAlbum.id, previewIdx);
        const goPrev = () => {
          if (previewIdx > 0) setPreviewFabric({ albumId: previewAlbum.id, index: previewIdx - 1 });
        };
        const goNext = () => {
          if (previewIdx < previewList.length - 1) setPreviewFabric({ albumId: previewAlbum.id, index: previewIdx + 1 });
        };
        const hasPrev = previewIdx > 0;
        const hasNext = previewIdx < previewList.length - 1;
        const isFav = isFabricFavorite(currentKey);
        return (
          <FabricPreviewModal
            fabric={currentFabric}
            album={previewAlbum}
            indexLabel={previewList.length > 1 ? `${previewIdx + 1} / ${previewList.length}` : null}
            isFavorite={isFav}
            isSelected={selectedFabricKey === currentKey}
            onClose={() => setPreviewFabric(null)}
            onToggleFavorite={() => toggleFabricFavorite(currentKey)}
            onSelect={() => {
              const idx = albums.findIndex((a) => a.id === previewAlbum.id);
              if (idx >= 0) setAlbumIdx(-1);
              setFabricOptionsOpen(false);
              setChosenAlbumId(previewAlbum.id);
              setFabric(currentFabric);
              setSelectedFabricKey(currentKey);
              setPreviewFabric(null);
            }}
            onPrev={hasPrev ? goPrev : null}
            onNext={hasNext ? goNext : null}
          />
        );
      })()}
    </div>
  );
}

interface FabricPreviewModalProps {
  fabric: FabricSample;
  album: Album | null;
  indexLabel: string | null;
  isFavorite: boolean;
  isSelected: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onSelect: () => void;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
}

function FabricPreviewModal({
  fabric, album, indexLabel, isFavorite, isSelected,
  onClose, onToggleFavorite, onSelect, onPrev, onNext,
}: FabricPreviewModalProps) {
  const [zoomOpen, setZoomOpen] = useState(false);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && onNext) onNext();
      else if (e.key === "ArrowLeft" && onPrev) onPrev();
    };
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onNext, onPrev]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: ReactTouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e: ReactTouchEvent) => {
    const start = touchStart.current;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && onNext) onNext();
      else if (dx > 0 && onPrev) onPrev();
    }
    touchStart.current = null;
  };

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-150"
      onClick={onClose}
      data-testid="fabric-preview-overlay"
    >
      <div
        className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          aria-label="Fechar"
          data-testid="button-close-fabric-preview"
        >
          <X className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute top-3 left-3 z-20 bg-white/90 hover:bg-white text-foreground rounded-full p-2 shadow transition-colors"
          aria-label={isFavorite ? "Remover dos favoritos" : "Favoritar tecido"}
          data-testid="button-favorite-fabric"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite ? "text-red-500 fill-red-500" : "text-foreground"
            }`}
          />
        </button>

        <div className="relative aspect-[4/3] bg-muted flex items-center justify-center select-none">
          {fabric.imageUrl ? (
            <>
              <img
                src={fabric.imageUrl}
                alt={fabric.name}
                className="w-full h-full object-contain cursor-zoom-in"
                draggable={false}
                onClick={() => setZoomOpen(true)}
              />
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                className="absolute bottom-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                aria-label="Ampliar imagem"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-muted-foreground text-sm">Sem imagem</div>
          )}

          {onPrev && (
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              aria-label="Tecido anterior"
              data-testid="button-prev-fabric"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              aria-label="Próximo tecido"
              data-testid="button-next-fabric"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {indexLabel && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              {indexLabel}
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-serif text-xl font-bold text-foreground">{fabric.name}</h4>
            {album && (
              <p className="text-xs text-muted-foreground">Álbum: {album.name}</p>
            )}
            {album?.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-snug whitespace-pre-line">{album.description}</p>
            )}
          </div>
          {isSelected ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-100 text-green-800 text-sm font-medium border border-green-200">
              <Check className="w-4 h-4" /> Tecido selecionado
            </div>
          ) : (
            <Button
              type="button"
              className="w-full"
              onClick={onSelect}
              data-testid="button-select-fabric"
            >
              <Check className="w-4 h-4 mr-2" /> Selecionar este tecido
            </Button>
          )}
        </div>
      </div>
    </div>
    {zoomOpen && fabric.imageUrl && (
      <ImageLightbox
        images={[fabric.imageUrl]}
        currentIndex={0}
        onClose={() => setZoomOpen(false)}
        onNext={() => {}}
        onPrev={() => {}}
        altBase={fabric.name}
      />
    )}
    </>
  );
}
