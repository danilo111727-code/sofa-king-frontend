import { useEffect, useState } from "react";
import { fetchProducts, type Product } from "@/lib/api";
import { proposedCollections } from "@/data/proposedCollections";

type Collection = { id: string; name: string; productIds: string[]; active: boolean };
const KEY = "sofa-king-preview-collections-v1";
const defaults: Collection[] = proposedCollections.map((c, i) => ({
  id: "suggested-" + i, name: c.name, productIds: c.candidateProductIds, active: true
}));
const variationTypes = ["Lounge","Retrátil","Fixo","Chaise","Sofá-cama","Modular","Ilha","Orgânico","Poltrona","Puff","Canto","Deck"];
export function ColecoesTab() {
  const [collections, setCollections] = useState<Collection[]>(() => {
    try { const saved = localStorage.getItem(KEY); if (!saved) return defaults;
      const previous: Collection[] = JSON.parse(saved);
      const oldNames = ["Brooklyn","Elegance","Urban","Fluid","Bloom","Frame","Concept","Lounge","Orla","Cannes","Loft","Oásis","Texas","Aura","Gomos","Detroit","Londres","França","Istambul","Jakarta","Nexo"];
      return [...defaults.map((c,i) => { const p = previous.find(x => x.id === c.id || x.name === oldNames[i]); return {...c,productIds: Array.from(new Set([...c.productIds,...(p?.productIds||[])]))}; }),...previous.filter(x=>x.id.startsWith("custom-"))]; } catch { return defaults; }
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [query, setQuery] = useState("");
  const [variation, setVariation] = useState("Lounge");
  const [environment, setEnvironment] = useState("Interna");
  const [customVariation, setCustomVariation] = useState("");
  const [numbered, setNumbered] = useState(true);
  useEffect(() => { fetchProducts({ fresh: true }).then(items => { setProducts(items); setCollections(prev => prev.map(c => { const legacy: Record<string,string> = {Monaco:"Elegance",Atelier:"Concept",Living:"Lounge",Duna:"Oásis",Austin:"Texas",Lume:"Aura",Provence:"França",Bali:"Jakarta",Atlas:"Módulos"}; const stems = [c.name,legacy[c.name]].filter(Boolean).map(x=>x.toLocaleLowerCase("pt-BR")); const matches = items.filter(p=>stems.some(stem=>p.name.toLocaleLowerCase("pt-BR").startsWith(stem))).map(p=>p.id); return {...c,productIds:Array.from(new Set([...c.productIds,...matches]))}; })); }).catch(() => {}); }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(collections)); }, [collections]);
  const current = collections.find(c => c.id === selected);
  const patch = (id: string, update: Partial<Collection>) => setCollections(prev => prev.map(c => c.id === id ? {...c, ...update} : c));
  const type = customVariation.trim() || variation;
  const prefix = current ? current.name + " " + type : type;
  const used = products.map(p => p.name).filter(name => name.toLocaleLowerCase("pt-BR").startsWith(prefix.toLocaleLowerCase("pt-BR")));
  const next = String(Math.max(0, ...used.map(name => Number(name.slice(prefix.length).trim())).filter(Number.isFinite)) + 1).padStart(2, "0");
  return <section className="space-y-5">
    <div className="flex flex-wrap justify-between items-center gap-3">
      <div><h1 className="text-2xl font-semibold">Coleções</h1><p className="text-sm text-[#a08060]">Organize modelos por família, tipo e ambiente.</p></div>
      <button onClick={() => { const n = newName.trim(); if (!n) { document.getElementById("collection-name")?.focus(); return; } const id = "custom-" + Date.now(); setCollections(c => [...c,{id,name:n,productIds:[],active:true}]); setSelected(id); setNewName(""); }} className="bg-[#c9a96e] text-[#1a1208] rounded-lg px-4 py-2 font-semibold">+ Criar coleção</button>
    </div>
    <p className="text-xs rounded-lg border border-amber-700/50 bg-amber-950/30 p-3 text-amber-200">Versão de teste: as coleções são rascunhos salvos somente neste navegador. Ainda não são gravadas no servidor nem alteram o catálogo público.</p>
    <input id="collection-name" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nome da nova coleção" className="w-full bg-[#1a1208] border border-[#3d2e1e] rounded-lg px-3 py-3 text-white" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2 max-h-[65vh] overflow-auto">
        {collections.map(c => <button key={c.id} onClick={()=>setSelected(c.id)} className={`w-full text-left rounded-xl border p-3 flex justify-between items-center ${selected===c.id ? "border-[#c9a96e] bg-[#302315]" : "border-[#3d2e1e] bg-[#1a1208]"}`}><span className="font-medium">{c.name}</span><span className="text-xs text-[#a08060]">{c.productIds.length} modelos</span></button>)}
      </div>
      <div className="md:col-span-2 bg-[#1a1208] border border-[#3d2e1e] rounded-xl p-4 space-y-4">
        {!current ? <p className="text-[#a08060]">Selecione uma coleção para editar e vincular modelos.</p> : <>
          <div className="flex flex-wrap gap-2 items-center">
            <input aria-label="Nome da coleção" value={current.name} onChange={e=>patch(current.id,{name:e.target.value})} className="flex-1 min-w-0 text-xl font-semibold bg-transparent border-b border-[#5a4030] py-2" />
            <button onClick={()=>{ if (window.confirm("Excluir esta coleção do rascunho? Os produtos não serão excluídos.")) {setCollections(cs=>cs.filter(c=>c.id!==current.id));setSelected(null);} }} className="text-sm text-red-400">Excluir coleção</button>
          </div>
          <h2 className="font-semibold">Vincular modelos existentes</h2>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar modelo..." className="w-full bg-[#120d06] border border-[#3d2e1e] rounded-lg px-3 py-2" />
          <div className="max-h-52 overflow-auto space-y-1">
            {products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).map(p=><label key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#302315] cursor-pointer"><input type="checkbox" checked={current.productIds.includes(p.id)} onChange={e=>patch(current.id,{productIds:e.target.checked?[...current.productIds,p.id]:current.productIds.filter(id=>id!==p.id)})}/><span className="text-sm">{p.name}</span><span className="text-xs text-[#a08060]">{p.category}</span></label>)}
          </div>
          <h2 className="font-semibold pt-2 border-t border-[#3d2e1e]">Simular nova variação</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={variation} onChange={e=>setVariation(e.target.value)} className="bg-[#120d06] border border-[#3d2e1e] rounded-lg px-3 py-2">{variationTypes.map(t=><option key={t}>{t}</option>)}</select>
            <select value={environment} onChange={e=>setEnvironment(e.target.value)} className="bg-[#120d06] border border-[#3d2e1e] rounded-lg px-3 py-2"><option value="Interna">Área interna</option><option value="Externa">Área externa</option></select>
          </div>
          <input value={customVariation} onChange={e=>setCustomVariation(e.target.value)} placeholder="Ou digite um novo tipo de variação" className="w-full bg-[#120d06] border border-[#3d2e1e] rounded-lg px-3 py-2" />
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={numbered} onChange={e=>setNumbered(e.target.checked)}/> Sugerir número automático</label>
          <div className="rounded-lg bg-[#302315] p-3"><p className="text-xs text-[#a08060]">Nome sugerido · Área {environment.toLowerCase()}</p><p className="font-semibold text-[#e8c78b]">{prefix}{numbered ? " " + next : ""}</p></div>
          <p className="text-xs text-[#a08060]">A numeração é apenas uma prévia; o cadastro definitivo e a verificação de duplicidade dependerão da integração com o servidor.</p>
        </>}
      </div>
    </div>
  </section>;
}
