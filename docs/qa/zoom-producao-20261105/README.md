# Zoom dos tecidos em produção — 05/11/2026

Status: READY, domínio oficial https://sofakingestofados.com.br/produto/retratil-istambul
Commit: 99f7eff0bc579f4fc5d051f33a50dc2d618b5dbd; branch release/fabric-zoom-20261105. Projeto Vite sofa-king (prj_6mFptyDbClfYv1jVSbb0MD9X9pc3), time team_yUnM3GCF1znzXSnLjA7SpzXf.
Deploy: dpl_6n3CKAK1w7WJnnHVqs5bqHUKHH5E; build remoto cerca de 26 segundos.

Somente 2 arquivos alterados a partir da produção b90a4d9d556c720aef60debe7a2a0ba4c9326032: ImageLightbox.tsx e o componente FabricPreviewModal em Produto.tsx. Diff: 67 inclusões, 16 remoções. Não houve merge na main. API oficial /api e rewrite sofa-king.onrender.com preservados. Nenhuma atualização do banco/backend. Textos do botão de pedido permanecem como na produção anterior; a mudança de texto do Preview não integra este pacote de zoom.

## Testes antes da publicação
- Build Vite e TypeScript: PASS. Avisos preexistentes de sourcemap tooltip e bundle >500kB permanecem.
- Harness de interface aplicado à composição exata dos dois arquivos sobre a produção atual, com fixtures de testes: PASS em 375x844, 390x844 e 1366x900.
- Pinça no detalhe e lightbox, arraste, toque duplo/restauração (celular simulado), botão acima da janela, Escape/Fechar, troca de tecido e reset da escala, seleção explícita, preço intacto durante visualização, rolagem restaurada, galeria e largura: PASS.
- As 7 regressões existentes passaram no Preview; esta base anterior de produção não contém esses testes. Não foi alegada execução desses 7 na base de produção.
- Autenticação Clerk não integra o teste local isolado; script externo bloqueado no harness. Sem teste físico Safari/iPhone.

## Verificação no site oficial
- Abrir Elements > Artigo Ródio > Ampliar: PASS. Foto carregada, z-index140 e touch-action none.
- Fechar ampliação retorna ao detalhe; próximo tecido e fechar todas as janelas: PASS.
- Nenhuma seleção automática; preço observado R$5.677,85 intacto; body overflow restaurado.
- Galeria principal: abre com foto carregada em z-index50 e fecha: PASS.
- Console consultado durante verificação: nenhum erro do aplicativo (mensagens de extensão descartadas). Não foi feita auditoria global de runtime, drains ou monitoramento.
- 106 produtos: campos id/price/sizes/priceAdjustmentPercent iguais antes/depois. SHA256 normalizado 9ec51ef45625c9c14a081e4d20a7776caac814a2b78bee65bca3e38cd38f2f04.
- Sem envio de WhatsApp, pedido ou alterações cadastrais. Título antigo 'Guia de Deploy' preservado, fora deste escopo.

## Retorno rápido
Deploy anterior: dpl_7wV4az5o16fBD8uWZF5wXu9APKkJ; commit b90a4d9d556c720aef60debe7a2a0ba4c9326032. Em caso de regressão, solicitar rollback desse deploy no mesmo projeto/time. Nenhuma migração precisa ser revertida.

![Ampliação no site oficial](producao.jpg)
