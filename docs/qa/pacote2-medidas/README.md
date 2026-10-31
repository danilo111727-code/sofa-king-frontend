# Pacote 2 — Medidas do sofá — Preview

Referência aprovada: imagem enviada pelo proprietário em 31/10/2026.

## Implementação

- Os cinco desenhos usam contornos vetoriais em SVG traçados sobre as formas da referência aprovada. Não há imagem raster na ampliação.
- Cartões HTML continuam clicáveis; a ampliação mostra o desenho correspondente e o valor dinâmico.
- A seção fica sempre aberta, sem botão ou seta de expandir/recolher, conforme solicitação posterior do proprietário. Cinco colunas são mantidas em todas as larguras.
- Proporções, espaços, cor e tipografia da faixa escalam juntos com a largura disponível.
- O aviso preto da foto aparece somente em dispositivos com ponteiro que suporta hover, evitando a retenção do aviso em telas de toque.
- Nenhuma alteração em API, banco, preços ou produção. Destino exclusivo: branch preview.

## Validação

- Build Vite e checagem TypeScript.
- Cinco testes existentes de associações de variações e cache de restrições aprovados.
- Playwright: 320, 375, 390 e 1440 px; cinco cartões na mesma linha, ausência de overflow horizontal, abertura de cada cartão, vetores na ampliação e seção permanentemente aberta.
- A rodada final com os vetores e a seção sempre aberta passou nas quatro larguras, sem erros de JavaScript.
- Dados de interface: cópia de leitura do catálogo do Supabase de testes via API de Preview. Eventos de navegação foram interceptados, sem gravar dados.

## Dados de medidas

O modelo de teste Istambul possui largura determinada pela metragem selecionada; as outras quatro medidas não estão cadastradas na configuração retornada pela API. Esses valores foram mantidos vazios. Não foram substituídos pelos números ilustrativos da referência.

## Aprovação

- [ ] Proprietário aprova a comparação visual no celular.
- [ ] Proprietário aprova a proporção em computador.
- [ ] Eventual publicação em produção deve ser solicitada separadamente; este pacote é somente Preview.

## Atualização — profundidade estendida por categoria

- Retrátil e chaise: sexto cartão “Profundidade estendida”, clicável, com desenho vetorial do assento estendido.
- Outras categorias: preservam cinco cartões, mesmo que exista uma medida estendida salva anteriormente.
- Campo em centímetros no cadastro do modelo, exibido conforme a categoria. A medida informativa não altera o preço.
- Nenhuma medida foi preenchida automaticamente no catálogo. O exemplo de 145 cm nas capturas é um dado sintético de teste local.
- Playwright: 12 cenários (retrátil, chaise e fixo em 320, 375, 390 e 1440 px), sem overflow, seis/cinco cartões na mesma linha, todos clicáveis, valores sem recorte e seção sempre aberta.
- Sete testes automatizados aprovados, incluindo create/edit/read no cliente da API com persistência simulada, preservação de outras medidas e preços. Não foi feita escrita no banco nesse teste.
- A API de Preview preserva a configuração recebida em JSON; não houve alteração de backend ou produção.
