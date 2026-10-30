import { useState } from "react";
import type { Album, Material } from "@/lib/api";
import type { ProductConfiguration, ProductVariationGroup } from "@/lib/productConfigurator";

/** Homologação: editor local, sem POST/PUT e sem persistência no backend compartilhado. */
export function ConfiguradorPreview({ albums, foams }: { albums: Album[]; foams: Material[] }) {
  const [config, setConfig] = useState<ProductConfiguration>({ allowedAlbumIds: albums.map(a => a.id), allowedFoamIds: foams.map(f => f.id), variationGroups: [], delivery: { mode: "consult" } });
  const [expanded, setExpanded] = useState(false);
  const groups = config.variationGroups ?? [];
  function toggle(key: "allowedAlbumIds" | "allowedFoamIds", id: string, all: string[]) {
    const current = config[key] ?? all;
    setConfig(c => ({ ...c, [key]: current.includes(id) ? current.filter(v => v !== id) : [...current, id] }));
  }
  function addGroup() {
    const group: ProductVariationGroup = { id: crypto.randomUUID(), name: "", mode: "single", options: [] };
    setConfig(c => ({ ...c, variationGroups: [...(c.variationGroups ?? []), group] }));
  }
  function changeGroup(id: string, patch: Partial<ProductVariationGroup>) {
    setConfig(c => ({ ...c, variationGroups: (c.variationGroups ?? []).map(g => g.id === id ? { ...g, ...patch } : g) }));
  }
  const input = "w-full rounded-lg border border-[#3d2e1e] bg-[#1a1208] p-2 text-sm text-white";
  return <section className="rounded-xl border border-[#c9a96e]/50 p-4 space-y-4" data-testid="configurador-preview">
    <button type="button" className="w-full flex items-center justify-between text-left text-[#c9a96e] font-semibold" onClick={() => setExpanded(v => !v)}>
      <span>Personalização do modelo — prévia experimental</span><span>{expanded ? "−" : "+"}</span>
    </button>
    {expanded && <>
      <p className="text-xs text-amber-300">Modo demonstração: alterações abaixo não são salvas nem enviadas à API. O armazenamento separado ainda será preparado.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><h4 className="text-sm text-white mb-2">Álbuns de tecidos permitidos</h4>
          {albums.map(a => <label key={a.id} className="flex gap-2 items-center py-1 text-sm text-[#d9c9a0]"><input type="checkbox" checked={(config.allowedAlbumIds ?? albums.map(x => x.id)).includes(a.id)} onChange={() => toggle("allowedAlbumIds", a.id, albums.map(x => x.id))}/>{a.name}</label>)}
        </div>
        <div><h4 className="text-sm text-white mb-2">Espumas permitidas</h4>
          {foams.map(f => <label key={f.id} className="flex gap-2 items-center py-1 text-sm text-[#d9c9a0]"><input type="checkbox" checked={(config.allowedFoamIds ?? foams.map(x => x.id)).includes(f.id)} onChange={() => toggle("allowedFoamIds", f.id, foams.map(x => x.id))}/>{f.name}</label>)}
        </div>
      </div>
      <div className="space-y-2"><h4 className="text-sm text-white">Prazo do modelo</h4>
        <select className={input} value={config.delivery?.mode ?? "consult"} onChange={e => setConfig(c => ({...c, delivery: {mode: e.target.value as "days" | "consult" | "hidden"}}))}>
          <option value="days">Dias úteis</option><option value="consult">Sob consulta</option><option value="hidden">Não exibir</option>
        </select>
        {config.delivery?.mode === "days" && <input className={input} type="number" min="1" placeholder="Quantidade de dias" value={config.delivery.days ?? ""} onChange={e => setConfig(c => ({...c, delivery: {mode: "days", days: Number(e.target.value)}}))}/>}
        {config.delivery?.mode === "consult" && <input className={input} placeholder="Prazo sob consulta" value={config.delivery.customText ?? ""} onChange={e => setConfig(c => ({...c, delivery: {mode: "consult", customText: e.target.value}}))}/>}
      </div>
      <div className="space-y-3"><div className="flex items-center justify-between"><h4 className="text-sm text-white">Variações: braços, pés, módulos e acabamentos</h4><button type="button" className="text-sm text-[#c9a96e]" onClick={addGroup}>+ Grupo</button></div>
        {groups.map(g => <div key={g.id} className="border border-[#3d2e1e] rounded-lg p-3 space-y-2">
          <div className="flex gap-2"><input className={input} placeholder="Nome do grupo (ex.: Braços)" value={g.name} onChange={e => changeGroup(g.id, {name:e.target.value})}/><button type="button" className="text-red-300" onClick={() => setConfig(c => ({...c, variationGroups: (c.variationGroups ?? []).filter(x => x.id !== g.id)}))}>Excluir</button></div>
          <select className={input} value={g.mode} onChange={e => changeGroup(g.id, {mode:e.target.value as "single" | "quantity"})}><option value="single">Escolha única</option><option value="quantity">Quantidade por módulo</option></select>
          {g.options.map(o => <div key={o.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input className={input} placeholder="Opção" value={o.name} onChange={e => changeGroup(g.id, {options:g.options.map(x => x.id === o.id ? {...x,name:e.target.value} : x)})}/>
            <input className={input} type="number" step="0.01" placeholder="Acréscimo R$" value={o.priceAdjustment} onChange={e => changeGroup(g.id, {options:g.options.map(x => x.id === o.id ? {...x,priceAdjustment:Number(e.target.value)} : x)})}/>
            <button type="button" className="text-red-300 text-sm" onClick={() => changeGroup(g.id,{options:g.options.filter(x=>x.id!==o.id)})}>Remover opção</button>
          </div>)}
          <button type="button" className="text-sm text-[#c9a96e]" onClick={() => changeGroup(g.id,{options:[...g.options,{id:crypto.randomUUID(),name:"",priceAdjustment:0}]})}>+ Adicionar opção</button>
        </div>)}
      </div>
      <p className="text-xs text-[#a08060]">Essas opções são apenas para visualizar a interface nesta etapa. O botão Salvar produto continua usando o cadastro atual e não salva esta demonstração.</p>
    </>}
  </section>;
}
