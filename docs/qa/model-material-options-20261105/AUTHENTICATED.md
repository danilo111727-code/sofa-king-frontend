# Check-up autenticado em produção — 2026-11-05

Complementa o README anterior: o bloqueio de autenticação foi resolvido pelo usuário e o teste no painel de produção foi concluído.

Produção: commit bcb2dd87342aaa74484dc92c8b9f296f4483eec3, deployment dpl_9wjgj68RYMUK7hdD3oCMjdRvSBTf.

## Resultado

- Login administrativo confirmado.
- Brooklyn Retrátil 01: cinco álbuns e cinco espumas carregados.
- Desmarcados temporariamente um álbum e exatamente duas espumas; somente esses controles mudaram. Cancelamento restaurou os dez controles.
- Salvamento executado com os valores originais, após comparação do payload inteiro sem diferenças.
- Reabertura e recarga completa mantiveram os dez controles marcados.
- GET do produto antes/depois idêntico.
- Página real do cliente abriu os cinco álbuns e cinco espumas; preço base R$ 4.026,38 preservado.
- Catálogo completo antes/depois: 106 produtos, nenhum campo diferente.
- Console observado sem erros da aplicação; mensagens da extensão do navegador excluídas.
- Nenhum pedido ou mensagem enviado. Nenhuma alteração adicional publicada, nenhum merge para main.

Não foram gravadas novas restrições em modelos oficiais. O caso de persistir restrições novas e filtrar o cliente foi validado anteriormente no ambiente de testes; a conferência em produção validou interação, cancelamento, gravação sem alterações, recarga e oferta existente.

Captura: authenticated-production.png.
