# Zoom dos tecidos — Preview — 05/11/2026

Base: fb005a644ab81e7d9f1d5088b3fcabf1c9b1f5f3. Escopo: somente Preview.

## Problemas corrigidos
- A ampliação abria com z-index 50 atrás do detalhe do tecido (120).
- O detalhe reconhecia deslizar, mas não pinça. O lightbox também permitia que o navegador assumisse o gesto antes do zoom.
- Escape podia fechar simultaneamente as duas janelas.
- Alterações no estado de zoom podiam deixar o body com overflow hidden após fechar as janelas.

## Verificação
Playwright Chromium, viewports 375x844, 390x844 (toque/DPR 2) e 1366x900. Dados de leitura do Supabase de testes pela API Preview, congelados como fixtures; imagens reais do repositório. Não houve criação de pedido nem envio ao WhatsApp.

- PASS: botão Ampliar acima do detalhe, hit-test do botão Fechar.
- PASS: imagem carregada; pinça no detalhe e em tela cheia nos dois celulares simulados; arraste após ampliar.
- PASS: toque duplo amplia e o segundo restaura em tela cheia.
- PASS: Escape e Fechar retornam ao detalhe; seleção e preço preservados durante o zoom.
- PASS: próximo tecido troca a imagem e restaura escala 1; seleção explícita funciona.
- PASS: fechar todas as janelas restaura rolagem; galeria principal mantém abertura e fechamento.
- PASS: página sem transbordamento horizontal nas três larguras.
- PASS: build Vite, TypeScript e 7 testes existentes de associações, medidas e persistência das espumas.

Limitações: simulação Chromium, não teste físico em Safari/iPhone. O harness isola a rede; o script externo Clerk bloqueado causou failed_to_load_clerk_js em uma execução, registrado em results.json e excluído da contagem de erros da aplicação. Login administrativo não foi testado. Build mantém aviso pré-existente de bundle acima de 500 kB e sourcemap de tooltip.

Nenhuma mudança de preço, dados oficiais, backend, produção ou main.
