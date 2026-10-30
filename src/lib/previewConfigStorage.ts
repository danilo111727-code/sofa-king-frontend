import type { ProductConfiguration } from "./productConfigurator";

const PREFIX = "sofaking-preview-config-v1:";

/** Never writes to the shared production API. Browser-local test data only. */
export function readPreviewConfig(productId: string): ProductConfiguration | null {
  if (!productId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + productId);
    return raw ? JSON.parse(raw) as ProductConfiguration : null;
  } catch {
    return null;
  }
}

export function writePreviewConfig(productId: string, config: ProductConfiguration): boolean {
  if (!productId || typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PREFIX + productId, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export function clearPreviewConfig(productId: string): void {
  if (!productId || typeof window === "undefined") return;
  try { window.localStorage.removeItem(PREFIX + productId); } catch {}
}
