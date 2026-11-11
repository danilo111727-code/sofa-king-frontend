# Restauração das opções de material — 11/11/2026

O domínio apontava para dpl_FsQG9ydm3vBmo8EhRN9W9UCxaPS6, commit e59f50d70aef14405d9188b31dc5de1c3409e78a da main (backup de 08/11). Essa árvore não continha os controles de álbuns/espumas publicados anteriormente em bcb2dd87342aaa74484dc92c8b9f296f4483eec3.

Reaplicado exclusivamente o patch de bcb2dd sobre a produção atual: Admin.tsx e Produto.tsx, 33 inserções/4 remoções. Nenhuma outra restauração de código antigo, nenhum merge main, nenhuma alteração no backend ou dados.

Commit: cac81dd3791a2a50d0f8ec0dc36528d01c12a0b7
Branch: fix/restore-model-material-options-20261111
Preview: dpl_31cgU6ZH4odp4kkH3f9mZjauo23U — READY.
Produção: dpl_DCS5ET4dj9NZTYf8cLnVQRfjg2XZ — READY, aliases oficial/www confirmados.

Validação:
- Build local e Vercel passaram.
- git diff --check passou.
- Typecheck encontrou os mesmos dois TS2322 pré-existentes em ColecoesTab.tsx linhas 9/10, reproduzidos em worktree sem patch. Nenhum novo erro.
- Painel real autenticado recarregado no domínio oficial: seção visível, 5 álbuns/5 espumas.
- Desmarcadas exatamente D33 selada e D45 selada, os demais 8 controles permaneceram marcados.
- Cancelar e reabrir restaurou os 10 controles; nenhuma gravação de configuração oficial neste check.
- GET catálogo antes/depois: mesmos 106 produtos, todos os campos iguais.
- Captura real: production-options.png.

Limite: salvamento e filtragem com restrições novas foram testados na publicação original; nesta restauração o patch é idêntico, e a verificação atual não gravou novas restrições em produção.
A configuração de publicação da main não foi alterada. Uma futura publicação de código que não contenha este patch pode voltar a removê-lo.
