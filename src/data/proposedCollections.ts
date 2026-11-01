/** Coleções propostas para revisão no painel administrativo.
 * Não renomeia produtos nem altera dados de produção.
 * Vínculos são candidatos e precisam de confirmação visual.
 */
export const proposedCollections = [
  ["Brooklyn", ["retratil-brooklyn", "cama-brooklyn", "living-brooklyn", "brooklyn-linear", "brooklyn"]],
  ["Elegance", []],
  ["Urban", []],
  ["Fluid", []],
  ["Bloom", []],
  ["Frame", []],
  ["Concept", []],
  ["Lounge", []],
  ["Orla", ["ilha-orla", "orla-02"]],
  ["Cannes", ["living-cannes", "cannes-02", "chaise-cannes"]],
  ["Loft", ["fixo-loft", "loft-02"]],
  ["Oásis", ["toronto", "oasis"]],
  ["Texas", ["living-texas", "luxemburgo"]],
  ["Aura", ["organicos-aura", "chaise-aura"]],
  ["Gomos", ["living-gomos", "ilha-gomos"]],
  ["Detroit", ["retratil-detroit", "cama-detroit"]],
  ["Londres", ["retratil-londres", "cama-londres"]],
  ["França", ["retratil-franca", "fixo-franca"]],
  ["Istambul", ["retratil-istambul", "istambul"]],
  ["Jakarta", ["fixo-jakarta", "jakarta"]],
  ["Nexo", ["lounge-05"]],
].map(([name, candidateProductIds]) => ({name, candidateProductIds, status:"draft" as const}));
