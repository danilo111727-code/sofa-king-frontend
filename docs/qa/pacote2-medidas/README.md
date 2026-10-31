# Pacote 2 — Medidas do sofá — Preview

Referência aprovada: imagem enviada pelo proprietário em 31/10/2026.

## Implementação

- Os cinco desenhos exibem a própria arte aprovada, por viewports SVG sobre a imagem original. Não foram redesenhados.
- Cartões HTML continuam clicáveis; a ampliação mostra o desenho correspondente e o valor dinâmico.
- A seção mantém expandir/recolher e cinco colunas em todas as larguras.
- Proporções, espaços, cor e tipografia da faixa escalam juntos com a largura disponível.
- O aviso preto da foto aparece somente em dispositivos com ponteiro que suporta hover, evitando a retenção do aviso em telas de toque.
- Nenhuma alteração em API, banco, preços ou produção. Destino exclusivo: branch preview.

## Validação

- Build Vite e checagem TypeScript.
- Cinco testes existentes de associações de variações e cache de restrições aprovados.
- Playwright: 320, 375, 390 e 1440 px; cinco cartões na mesma linha, ausência de overflow horizontal, abertura de cada cartão e expansão/recolhimento.
- A rodada final após o ajuste de recorte repete celular de 390 px e desktop de 1440 px.
- Dados de interface: cópia de leitura do catálogo do Supabase de testes via API de Preview. Eventos de navegação foram interceptados, sem gravar dados.

## Dados de medidas

O modelo de teste Istambul possui largura determinada pela metragem selecionada; as outras quatro medidas não estão cadastradas na configuração retornada pela API. Esses valores foram mantidos vazios. Não foram substituídos pelos números ilustrativos da referência.

## Aprovação

- [ ] Proprietário aprova a comparação visual no celular.
- [ ] Proprietário aprova a proporção em computador.
- [ ] Eventual publicação em produção deve ser solicitada separadamente; este pacote é somente Preview.
