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
    const categories =
      Array.isArray(settings.categories) && settings.categories.length > 0
        ? settings.categories
        : DEFAULT_CATEGORIES;
    return {
      categories,
      getCategory: (id) => getCategoryFrom(categories, id),
      displayName: (name, category) => displayNameFrom(categories, name, category),
    };
  }, [settings.categories]);
}
