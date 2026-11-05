import { useMemo } from "react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  CATEGORIES as DEFAULT_CATEGORIES,
  displayNameFrom,
  getCategoryFrom,
  type CategoryDef,
} from "@/lib/categories";

export interface UseCategoriesResult {
  /** Lista corrente de categorias (vinda das configurações ou fallback). */
  categories: CategoryDef[];
  getCategory: (id: string | null | undefined) => CategoryDef | null;
  displayName: (name: string, category: string | null | undefined) => string;
}

/**
 * Retorna a lista corrente de categorias do site (admin pode editar/criar
 * em Configurações) e helpers `getCategory`/`displayName` já vinculados.
 */
export function useCategories(): UseCategoriesResult {
  const settings = useSiteSettings();
  return useMemo(() => {
    const configured = Array.isArray(settings.categories) && settings.categories.length > 0
      ? settings.categories : DEFAULT_CATEGORIES;
    // Do not surface the two unintended categories, including when already saved.
    // Product records and stored settings remain untouched.
    const categories = configured.filter(c =>
      c.id !== "retratil-sem-caixa" && c.id !== "area-externa"
    );
    return {
      categories,
      getCategory: (id) => getCategoryFrom(categories, id),
      displayName: (name, category) => displayNameFrom(categories, name, category),
    };
  }, [settings.categories]);
}
