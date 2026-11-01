import { useState } from "react";
import { proposedCollections } from "@/data/proposedCollections";

export const COLLECTION_STORAGE_KEY = "sofa-king-collections-preview-v2";
export const defaultCollectionNames = proposedCollections.map(c => c.name);
export function getCollectionNames(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(COLLECTION_STORAGE_KEY) || "null");
    return Array.isArray(saved) && saved.length ? saved.filter((v): v is string => typeof v === "string") : defaultCollectionNames;
  } catch { return defaultCollectionNames; }
}
export function ColecoesTab() {
  const [collections, setCollections] = useState<string[]>(getCollectionNames);
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const persist = (next: string[]) => {
    setCollections(next);
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("sofa-collections-updated"));
  };
  const submit = () => {
    const name = value.trim();
    if (!name) return;
    if (collections.some((v, i) => i !== editing && v.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))) {
      alert("Já existe uma coleção com esse nome."); return;
    }
    persist(editing === null ? [...collections, name] : collections.map((v, i) => i === editing ? name : v));
    setValue(""); setEditing(null);
  };
  return <div className="space-y-4">
    <div><h2 className="text-xl font-semibold text-white">Coleções</h2><p className="text-sm text-[#a08060]">{collections.length} coleções</p></div>
    <div className="rounded-xl border border-[#3d2e1e] bg-[#1a1208] p-4 space-y-3">
      <label className="text-sm text-white font-medium">{editing === null ? "Criar coleção" : "Editar nome"}</label>
      <div className="flex gap-2"><input aria-label="Nome da coleção" value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => { if(e.key === "Enter") submit(); }} placeholder="Nome da coleção" className="flex-1 min-w-0 rounded-lg bg-[#120d06] border border-[#3d2e1e] text-white p-2.5" />
      <button type="button" onClick={submit} className="rounded-lg px-4 bg-[#c9a96e] text-[#120d06] font-medium">{editing === null ? "Criar" : "Salvar"}</button></div>
      {editing !== null && <button type="button" className="text-sm text-[#a08060]" onClick={() => { setEditing(null); setValue(""); }}>Cancelar edição</button>}
    </div>
    <div className="rounded-xl border border-[#3d2e1e] bg-[#1a1208] overflow-hidden">
      {collections.map((name, i) => <div key={i} className="flex justify-between items-center px-4 py-3 border-b last:border-b-0 border-[#3d2e1e]">
        <span className="text-white text-sm">{name}</span>
        <button type="button" onClick={() => { setEditing(i); setValue(name); }} className="text-sm text-[#c9a96e]">Editar nome</button>
      </div>)}
    </div>
    <p className="text-xs text-amber-200">Ambiente de teste: alterações de coleções ficam salvas neste navegador até a integração com o servidor.</p>
  </div>;
}
