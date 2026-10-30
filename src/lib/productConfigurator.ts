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
export interface ProductConfiguration {
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
  return selections.reduce((sum, selection) => {
    const group = groups.find(g => g.id === selection.groupId);
    const option = group?.options.find(o => o.id === selection.optionId);
    if (!group || !option) return sum;
    const quantity = group.mode === "single" ? 1 : Math.max(option.minQuantity ?? 0, Math.min(option.maxQuantity ?? 99, Math.max(0, Math.floor(selection.quantity))));
    return sum + option.priceAdjustment * quantity;
  }, 0);
}
