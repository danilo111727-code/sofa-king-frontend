export type ProductCategory =
    | "retratil"
    | "sofa-cama"
    | "canto"
    | "organicos"
    | "living"
    | "fixo"
    | "chaise"
    | "ilha"
    | "modulos"
    | "cama"
    | "cabeceira"
    | "box"
    | "poltronas"
    | "puffs"
    | "almofadas"
    | "";

  export interface CategoryDef {
    id: Exclude<ProductCategory, "">;
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

  export function getCategory(id: string | null | undefined): CategoryDef | null {
    if (!id) return null;
    return CATEGORIES.find((c) => c.id === id) ?? null;
  }

  export function displayName(name: string, category: string | null | undefined): string {
    const c = getCategory(category ?? "");
    if (!c) return name;
    const trimmed = name.trim();
    if (trimmed.toLowerCase().endsWith(c.suffix.toLowerCase())) return trimmed;
    return `${trimmed} ${c.suffix}`;
  }

  export const PIX_DISCOUNT_PCT = 10;
  export const MAX_INSTALLMENTS = 10;

  export function applyPixDiscount(value: number): number {
    return value * (1 - PIX_DISCOUNT_PCT / 100);
  }
  