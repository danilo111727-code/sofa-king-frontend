/** Configurador Sofa King — estrutura inicial isolada para homologação.
 * Nenhum dado é gravado na API de produção por este módulo.
 */
export type DeliveryMode = "days" | "consult" | "hidden";
export interface DeliveryRule {
  mode: DeliveryMode;
  days?: number;
  customText?: string;
}
export interface ProductVariationOption {
  active?: boolean;
  id: string;
  name: string;
  imageUrl?: string;
  priceAdjustment: number;
  /** Permite escolher quantidades (ex.: módulos). */
  quantityEnabled?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
}
export interface ProductVariationGroup {
  id: string;
  name: string;
  mode: "single" | "quantity";
  required?: boolean;
  options: ProductVariationOption[];
}
export interface ProductMeasurements {
  totalDepth?: number;
  extendedDepth?: number;
  seatHeight?: number;
  backHeight?: number;
  seatDepth?: number;
  armWidth?: number;
}
export interface ProductConfiguration {
  /** Medidas informativas em centímetros, opcionais por modelo. */
  measurements?: ProductMeasurements;
  /** Lados disponíveis, definidos olhando o sofá de frente. */
  availableSides?: ("left" | "right")[];
  catalogVariations?: Record<string, { enabled: boolean; optionIds: string[]; required?: boolean }>;
  /** undefined = manter todas as opções existentes; [] = nenhuma opção. */
  allowedFoamIds?: string[];
  allowedAlbumIds?: string[];
  allowedFabricIds?: string[];
  delivery?: DeliveryRule;
  variationGroups?: ProductVariationGroup[];
}
export interface VariationSelection {
  groupId: string;
  optionId: string;
  quantity: number;
}
export function isAllowed(id: string, allowed?: string[]): boolean {
  return allowed === undefined || allowed.includes(id);
}
export function deliveryLabel(rule: DeliveryRule | undefined, fallbackDays?: number): string | null {
  if (!rule) return fallbackDays && fallbackDays > 0 ? `Prazo: ${fallbackDays} dias úteis` : null;
  if (rule.mode === "hidden") return null;
  if (rule.mode === "consult") return rule.customText?.trim() || "Prazo sob consulta";
  return rule.days && rule.days > 0 ? `Prazo: ${rule.days} dias úteis` : null;
}
export function calculateVariationTotal(groups: ProductVariationGroup[], selections: VariationSelection[]): number {
  const seen = new Set<string>();
  return Math.round(selections.reduce((sum, selection) => {
    const group = groups.find(g => g.id === selection.groupId);
    const option = group?.options.find(o => o.id === selection.optionId);
    const key=group?.mode === "single" ? selection.groupId : selection.groupId+":"+selection.optionId;
    if (!group || !option || seen.has(key) || !Number.isFinite(selection.quantity)) return sum;
    seen.add(key);
    const quantity = group.mode === "single" ? 1 : Math.max(option.minQuantity ?? 0, Math.min(option.maxQuantity ?? 99, Math.max(0, Math.floor(selection.quantity))));
    return sum + option.priceAdjustment * quantity;
  }, 0)*100)/100;
}

/** The extended depth card applies only to reclining and chaise categories. */
export function supportsExtendedDepth(category: string | undefined, categoryLabel?: string): boolean {
  const normalized = `${category ?? ""} ${categoryLabel ?? ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return /(?:^|[\s-])(?:retratil|chaise)(?:$|[\s-])/.test(normalized);
}
