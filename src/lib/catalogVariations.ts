import type { ProductConfiguration, ProductVariationGroup, ProductVariationOption } from './productConfigurator';
export interface VariationAlbum {
  id: string;
  name: string;
  active: boolean;
  mode: 'single' | 'quantity';
  options: ProductVariationOption[];
}
export function resolveCatalogVariations(configuration: ProductConfiguration = {}, albums: VariationAlbum[] = []): ProductVariationGroup[] {
  const associations=configuration.catalogVariations;
  const legacy=configuration.variationGroups??[];
  if(associations===undefined)return legacy;
  const groups: ProductVariationGroup[]=[];
  for(const album of albums){
    const association=associations[album.id];
    if(!album.active||!association?.enabled)continue;
    const options=album.options.filter(o=>o.active!==false&&association.optionIds.includes(o.id));
    if(options.length)groups.push({id:'catalog:'+album.id,name:album.name,mode:album.mode,required:association.required!==false,options});
  }
  return groups;
}
