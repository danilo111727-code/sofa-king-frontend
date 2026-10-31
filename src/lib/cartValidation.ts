import type {CartItem} from '../contexts/CartContext';
import type {VariationSelection} from './productConfigurator';

export function cartQuoteInput(items: CartItem[]) {
  return {items:items.map(item => {
    if (item.variations?.length && !item.configurationSelections) throw new Error(`Configure novamente o modelo ${item.productName} para confirmar as opções.`);
    return {id:item.id,productId:item.productId,qty:item.qty,sizeLabel:item.size.label,
      albumId:item.album?.id,fabricId:item.fabric?.id,foamId:item.foam?.id,
      selections:(item.configurationSelections ?? []) as VariationSelection[]};
  })};
}

export function cartNeedsReview(previous: CartItem[], current: CartItem[]): boolean {
  const details = (item: CartItem) => ({id:item.id,unitPrice:item.unitPrice,qty:item.qty,
    size:item.size,album:item.album,foam:item.foam,fabric:item.fabric?.name,
    variations:item.variations ?? [],delivery:item.delivery ?? null});
  return JSON.stringify(previous.map(details)) !== JSON.stringify(current.map(details));
}
