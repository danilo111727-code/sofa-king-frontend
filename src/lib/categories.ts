/**
 * Categorias de produto.
 *
 * A lista é dinâmica: a fonte autoritativa é `siteSettings.categories`
 * (editável pelo admin em Configurações). As constantes abaixo servem
 * como FALLBACK padrão caso a API ainda não tenha retornado.
 *
 * Componentes devem preferir o hook `useCategories()` para obter a
 * lista atual, suas variantes e os helpers `displayName`/`getCategory`
 * já vinculados à lista corrente.
 */

export type ProductCategory = string;

export interface CategoryDef {
  id: string;
  label: string;
  suffix: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "retratil",  label: "Sofá Retrátil",  suffix: "Retrátil" },
  { id: "sofa-cama", label: "Sofá-cama",       suffix: "Cama" },
  { id: "canto",     label: "Sofá de Canto",   suffix: "de Canto" },
  { id: "organicos", label: "Sofá Orgânico",   suffix: "Orgânico" },
  { id: "living",    label: "Sofá Living",      suffix: "Living" },
  { id: "fixo",      label: "Sofá Fixo",        suffix: "Fixo" },
  { id: "chaise",    label: "Sofá Chaise",      suffix: "Chaise" },
  { id: "ilha",      label: "Sofá Ilha",        suffix: "Ilha" },
  { id: "modulos",   label: "Módulos",          suffix: "Módulos" },
  { id: "poltronas", label: "Poltronas",        suffix: "Poltrona" },
  { id: "puffs",     label: "Puffs",            suffix: "Puff" },
  { id: "almofadas", label: "Almofadas",        suffix: "Almofada" },
  { id: "cama",      label: "Cama",             suffix: "Cama" },
  { id: "cabeceira", label: "Cabeceira",        suffix: "Cabeceira" },
  { id: "box",       label: "Box",              suffix: "Box" },
];

export function getCategoryFrom(
  list: CategoryDef[],
  id: string | null | undefined,
): CategoryDef | null {
  if (!id) return null;
  return list.find((c) => c.id === id) ?? null;
}

export function displayNameFrom(
  list: CategoryDef[],
  name: string,
  category: string | null | undefined,
): string {
  const c = getCategoryFrom(list, category ?? "");
  if (!c || !c.suffix) return name;
  const trimmed = name.trim();
  if (trimmed.toLowerCase().endsWith(c.suffix.toLowerCase())) return trimmed;
  return `${trimmed} ${c.suffix}`;
}

/** @deprecated Prefer `useCategories().getCategory` (uses dynamic list). */
export function getCategory(id: string | null | undefined): CategoryDef | null {
  return getCategoryFrom(CATEGORIES, id);
}

/** @deprecated Prefer `useCategories().displayName` (uses dynamic list). */
export function displayName(name: string, category: string | null | undefined): string {
  return displayNameFrom(CATEGORIES, name, category);
}

/** Cria um id único a partir de um label, sem colidir com `existingIds`. */
export function slugifyCategoryId(label: string, existingIds: Iterable<string> = []): string {
  const taken = new Set(existingIds);
  const base = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "categoria";
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export const PIX_DISCOUNT_PCT = 10;
export const MAX_INSTALLMENTS = 10;

export function applyPixDiscount(value: number): number {
  return value * (1 - PIX_DISCOUNT_PCT / 100);
}
