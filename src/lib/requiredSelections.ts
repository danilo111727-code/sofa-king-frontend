export type RequiredChoice = "fabric" | "foam";
export interface SelectionRequirements { fabric: boolean; foam: boolean }
export function missingSelection(requirements: SelectionRequirements, selection: { fabric?: unknown; foam?: unknown }): RequiredChoice | null {
  if (requirements.fabric && !selection.fabric) return "fabric";
  if (requirements.foam && !selection.foam) return "foam";
  return null;
}
export function selectionRequirements(
  configuration: { allowedAlbumIds?: string[]; allowedFabricIds?: string[]; allowedFoamIds?: string[] } | undefined,
  albums: { id: string; active: boolean; fabrics: { id: string }[] }[],
  foams: { id: string; active: boolean }[],
): SelectionRequirements {
  const allowed = (id: string, ids?: string[]) => ids === undefined || ids.includes(id);
  return {
    fabric: albums.some(a => a.active && allowed(a.id, configuration?.allowedAlbumIds) && a.fabrics.some(f => allowed(f.id, configuration?.allowedFabricIds))),
    foam: foams.some(f => f.active && allowed(f.id, configuration?.allowedFoamIds)),
  };
}
export const choiceMessage = (choice: RequiredChoice) => choice === "fabric"
  ? "Escolha o tecido do seu sofá para continuar com o pedido."
  : "Escolha a espuma do seu sofá para continuar com o pedido.";
