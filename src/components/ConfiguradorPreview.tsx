import { useState, type Dispatch, type SetStateAction } from "react";
import { uploadImage, type Album, type Material } from "@/lib/api";
import type { ProductConfiguration, ProductVariationGroup } from "@/lib/productConfigurator";


/** Editor integrado ao salvamento atômico do produto no ambiente de testes. */
export function ConfiguradorPreview({ albums, foams, config, setConfig, onUploadingChange }: { albums: Album[]; foams: Material[]; config: ProductConfiguration; setConfig: Dispatch<SetStateAction<ProductConfiguration>>; onUploadingChange?: (uploading: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [uploadingOption, setUploadingOption] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");

  const groups = config.variationGroups ?? [];
  function toggle(key: "allowedAlbumIds" | "allowedFoamIds", id: string, all: string[]) {
    setConfig(c => {
      const current = c[key] ?? all;
      return { ...c, [key]: current.includes(id) ? current.filter(v => v !== id) : [...current, id] };
    });
  }
  function addGroup() {
    const group: ProductVariationGroup = { id: crypto.randomUUID(), name: "", mode: "single", options: [] };
    setConfig(c => ({ ...c, variationGroups: [...(c.variationGroups ?? []), group] }));
  }
  function changeGroup(id: string, patch: Partial<ProductVariationGroup>) {
    setConfig(c => ({ ...c, variationGroups: (c.variationGroups ?? []).map(g => g.id === id ? { ...g, ...patch } : g) }));
  }
  async function uploadOptionImage(groupId: string, optionId: string, file: File | undefined) {
    if (!file || uploadingOption) return;
    setUploadError("");
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 8 * 1024 * 1024) { setUploadError("Escolha uma imagem JPG, PNG, WebP ou GIF de até 8 MB."); return; }
    setUploadingOption(optionId); onUploadingChange?.(true);
    try {
      const { url } = await uploadImage(file);
      setConfig(c => ({...c, variationGroups:(c.variationGroups??[]).map(g=>g.id===groupId?{...g,options:g.options.map(o=>o.id===optionId?{...o,imageUrl:url}:o)}:g)}));
    } catch(e) { setUploadError(e instanceof Error ? e.message : "Não foi possível enviar a foto."); }
    finally { setUploadingOption(null); onUploadingChange?.(false); }
  }
  const input = "w-full rounded-lg border border-[#3d2e1e] bg-[#1a1208] p-2 text-sm text-white";
  return <section className="rounded-xl border border-[#c9a96e]/50 p-4 space-y-4" data-testid="configurador-preview">
    <button type="button" className="w-full flex items-center justify-between text-left text-[#c9a96e] font-semibold" onClick={() => setExpanded(v => !v)}>
      <span>Personalização do modelo</span><span>{expanded ? "−" : "+"}</span>
    </button>
    {expanded && <>
      <p className="text-xs text-amber-300">Ambiente de testes. As opções são salvas junto com o produto.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><h4 className="text-sm text-white mb-2">Álbuns de tecidos permitidos</h4>
          {albums.map(a => <label key={a.id} className="flex gap-2 items-center py-1 text-sm text-[#d9c9a0]"><input type="checkbox" checked={(config.allowedAlbumIds ?? albums.map(x => x.id)).includes(a.id)} onChange={() => toggle("allowedAlbumIds", a.id, albums.map(x => x.id))}/>{a.name}</label>)}
        </div>
        <div><h4 className="text-sm text-white mb-2">Espumas permitidas <span className="text-xs text-[#c9a96e]">({foams.filter(f=>(config.allowedFoamIds??foams.map(x=>x.id)).includes(f.id)).length} de {foams.length})</span></h4>
          {foams.map(f => <label key={f.id} className="flex gap-2 items-center py-1 text-sm text-[#d9c9a0]"><input type="checkbox" checked={(config.allowedFoamIds ?? foams.map(x => x.id)).includes(f.id)} onChange={() => toggle("allowedFoamIds", f.id, foams.map(x => x.id))}/>{f.name}</label>)}
        </div>
      </div>
      <div><h4 className="text-sm text-white mb-2">Tecidos permitidos por álbum</h4>
        {albums.filter(a=>(config.allowedAlbumIds??albums.map(x=>x.id)).includes(a.id)).map(a=><details key={a.id} className="py-2 text-sm text-[#d9c9a0]"><summary>{a.name}</summary><div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-2">{a.fabrics.map(f=><label key={f.id} className="flex gap-2 items-center"><input type="checkbox" checked={(config.allowedFabricIds??albums.flatMap(a=>a.fabrics.map(f=>f.id))).includes(f.id)} onChange={()=>setConfig(c=>{const all=c.allowedFabricIds??albums.flatMap(a=>a.fabrics.map(f=>f.id));return {...c,allowedFabricIds:all.includes(f.id)?all.filter(id=>id!==f.id):[...all,f.id]};})}/>{f.name}</label>)}</div></details>)}
      </div>
      <div className="space-y-2"><h4 className="text-sm text-white">Prazo do modelo</h4>
        <select className={input} value={config.delivery?.mode ?? "consult"} onChange={e => setConfig(c => ({...c, delivery: {mode: e.target.value as "days" | "consult" | "hidden"}}))}>
          <option value="days">Dias úteis</option><option value="consult">Sob consulta</option><option value="hidden">Não exibir</option>
        </select>
        {config.delivery?.mode === "days" && <input className={input} type="number" min="1" placeholder="Quantidade de dias" value={config.delivery.days ?? ""} onChange={e => setConfig(c => ({...c, delivery: {mode: "days", days: Number(e.target.value)}}))}/>}
        {config.delivery?.mode === "consult" && <input className={input} placeholder="Prazo sob consulta" value={config.delivery.customText ?? ""} onChange={e => setConfig(c => ({...c, delivery: {mode: "consult", customText: e.target.value}}))}/>}
      </div>
      {uploadError && <p role="alert" className="text-sm text-red-300">{uploadError}</p>}
      <div className="space-y-3"><div className="flex items-center justify-between"><h4 className="text-sm text-white">Variações: braços, pés, módulos e acabamentos</h4><button type="button" className="text-sm text-[#c9a96e]" onClick={addGroup}>+ Grupo</button></div>
        {groups.map(g => <div key={g.id} className="border border-[#3d2e1e] rounded-lg p-3 space-y-2">
          <div className="flex gap-2"><input className={input} placeholder="Nome do grupo (ex.: Braços)" value={g.name} onChange={e => changeGroup(g.id, {name:e.target.value})}/><button type="button" className="text-red-300" onClick={() => setConfig(c => ({...c, variationGroups: (c.variationGroups ?? []).filter(x => x.id !== g.id)}))}>Excluir</button></div>
          <select className={input} value={g.mode} onChange={e => changeGroup(g.id, {mode:e.target.value as "single" | "quantity"})}><option value="single">Escolha única</option><option value="quantity">Quantidade por módulo</option></select>
          <label className="flex gap-2 text-sm text-[#d9c9a0]"><input type="checkbox" checked={!!g.required} onChange={e=>changeGroup(g.id,{required:e.target.checked})}/>Escolha obrigatória</label>
          {g.options.map(o => <div key={o.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-[#3d2e1e] pt-2">
            <input className={input} placeholder="Opção" value={o.name} onChange={e => changeGroup(g.id, {options:g.options.map(x => x.id === o.id ? {...x,name:e.target.value} : x)})}/>
            <input className={input} type="number" step="0.01" placeholder="Acréscimo R$" value={o.priceAdjustment} onChange={e => changeGroup(g.id, {options:g.options.map(x => x.id === o.id ? {...x,priceAdjustment:Number(e.target.value)} : x)})}/>
            <div className="space-y-2 sm:col-span-2">
              {o.imageUrl && <div className="flex items-center gap-3"><img src={o.imageUrl} alt={`Foto de ${o.name || "variação"}`} className="w-20 h-20 rounded-lg object-cover border border-[#3d2e1e]"/><button type="button" className="text-sm text-red-300" onClick={()=>changeGroup(g.id,{options:g.options.map(x=>x.id===o.id?{...x,imageUrl:undefined}:x)})}>Remover foto</button></div>}
              <label className={`inline-flex items-center rounded-lg border border-[#c9a96e]/50 px-3 py-2 text-sm text-[#c9a96e] ${uploadingOption ? "opacity-60" : "cursor-pointer"}`}>
                {uploadingOption===o.id ? "Enviando foto..." : o.imageUrl ? "Trocar foto" : "Adicionar foto"}
                <input aria-label={`Enviar foto de ${o.name || "variação"}`} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={!!uploadingOption} onChange={e=>{const file=e.target.files?.[0];e.target.value="";void uploadOptionImage(g.id,o.id,file);}}/>
              </label>
              <p className="text-xs text-[#a08060]">A foto aparece na opção que o cliente seleciona no site.</p>
            </div>
            <input className={input} aria-label="Imagem da opção" placeholder="URL da imagem (opcional)" value={o.imageUrl??""} onChange={e=>changeGroup(g.id,{options:g.options.map(x=>x.id===o.id?{...x,imageUrl:e.target.value}:x)})}/>
            {g.mode==="quantity" && <div className="flex gap-2"><label className="text-xs text-[#d9c9a0]">Mínimo<input aria-label="Quantidade mínima" className={input} type="number" min="0" max="99" value={o.minQuantity??0} onChange={e=>changeGroup(g.id,{options:g.options.map(x=>x.id===o.id?{...x,minQuantity:Number(e.target.value)}:x)})}/></label><label className="text-xs text-[#d9c9a0]">Máximo<input aria-label="Quantidade máxima" className={input} type="number" min="0" max="99" value={o.maxQuantity??99} onChange={e=>changeGroup(g.id,{options:g.options.map(x=>x.id===o.id?{...x,maxQuantity:Number(e.target.value)}:x)})}/></label></div>}
            <button type="button" className="text-red-300 text-sm" onClick={() => changeGroup(g.id,{options:g.options.filter(x=>x.id!==o.id)})}>Remover opção</button>
          </div>)}
          <button type="button" className="text-sm text-[#c9a96e]" onClick={() => changeGroup(g.id,{options:[...g.options,{id:crypto.randomUUID(),name:"",priceAdjustment:0}]})}>+ Adicionar opção</button>
        </div>)}
      </div>
      <p className="text-xs text-[#a08060]">Use Salvar ou Criar no final do formulário para gravar as opções e os preços.</p>
    </>}
  </section>;
}
