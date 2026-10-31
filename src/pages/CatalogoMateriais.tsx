import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchAlbums, fetchMaterials, type Album, type Material } from "@/lib/api";

export default function CatalogoMateriais({ kind }: { kind: "tecidos" | "espumas" }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [foams, setFoams] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    (kind === "tecidos" ? fetchAlbums().then(a => setAlbums(a.filter(x => x.active))) : fetchMaterials().then(a => setFoams(a.filter(x => x.active))))
      .catch(() => setError(true)).finally(() => setLoading(false));
  }, [kind]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-8 flex-1 max-w-5xl">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">Início</Link>
        <h1 className="text-2xl font-semibold mt-3 mb-6">Catálogo de {kind}</h1>
        {loading ? <p className="text-muted-foreground">Carregando catálogo…</p> :
          error ? <p className="text-muted-foreground">Não foi possível carregar o catálogo agora.</p> :
          kind === "tecidos" ? (
            <div className="space-y-8">
              {albums.length === 0 && <p className="text-muted-foreground">Nenhum tecido disponível no momento.</p>}
              {albums.map(album => (
                <section key={album.id}>
                  <h2 className="text-lg font-semibold mb-1">{album.name}</h2>
                  {album.description && <p className="text-sm text-muted-foreground mb-3">{album.description}</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {album.fabrics.map(f => (
                      <div key={f.id} className="rounded-xl overflow-hidden border border-border bg-card">
                        <div className="aspect-square bg-secondary">{f.imageUrl && <img src={f.imageUrl} alt={f.name} loading="lazy" className="w-full h-full object-cover" />}</div>
                        <p className="p-3 text-sm font-medium">{f.name}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {foams.length === 0 && <p className="text-muted-foreground">Nenhuma espuma disponível no momento.</p>}
              {foams.map(foam => (
                <article key={foam.id} className="rounded-xl border border-border overflow-hidden bg-card">
                  {foam.imageUrl && <img src={foam.imageUrl} alt={foam.name} loading="lazy" className="w-full h-48 object-contain bg-secondary" />}
                  <div className="p-4 space-y-1">
                    <h2 className="font-semibold">{foam.name}</h2>
                    {foam.description && <p className="text-sm text-muted-foreground">{foam.description}</p>}
                    {foam.weightSupport && <p className="text-sm">Peso suportado: {foam.weightSupport}</p>}
                    {foam.comfortLevel && <p className="text-sm">Conforto: {foam.comfortLevel}</p>}
                    {foam.useIndication && <p className="text-sm">Indicação: {foam.useIndication}</p>}
                    {foam.longTermBehavior && <p className="text-sm">Comportamento a longo prazo: {foam.longTermBehavior}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
      </main>
      <Footer />
    </div>
  );
}
