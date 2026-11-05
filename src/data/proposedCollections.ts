/** Coleções aprovadas para organização no painel administrativo.
 * Não renomeia produtos nem altera dados de produção.
 * Vínculos são candidatos e precisam de confirmação visual.
 */
export const proposedCollections = ([
  ["Brooklyn", ["retratil-brooklyn", "cama-brooklyn", "living-brooklyn", "brooklyn-linear", "brooklyn"]],
  ["Monaco", []],
  ["Urban", []],
  ["Fluid", []],
  ["Bloom", []],
  ["Frame", []],
  ["Atelier", []],
  ["Living", []],
  ["Orla", ["ilha-orla", "orla-02"]],
  ["Cannes", ["living-cannes", "cannes-02", "chaise-cannes"]],
  ["Loft", ["fixo-loft", "loft-02"]],
  ["Duna", ["toronto", "oasis"]],
  ["Austin", ["living-texas", "luxemburgo"]],
  ["Lume", ["organicos-aura", "chaise-aura"]],
  ["Gomos", ["living-gomos", "ilha-gomos"]],
  ["Detroit", ["retratil-detroit", "cama-detroit"]],
  ["Londres", ["retratil-londres", "cama-londres"]],
  ["Provence", ["retratil-franca", "fixo-franca"]],
  ["Istambul", ["retratil-istambul", "istambul"]],
  ["Bali", ["fixo-jakarta", "jakarta"]],
  ["Atlas", ["lounge-05"]],
] satisfies Array<[string, string[]]>).map(([name, candidateProductIds]) => ({name, candidateProductIds, status:"approved" as const}));
