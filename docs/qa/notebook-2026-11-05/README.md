# Checkup da loja e enquadramento no notebook — 05/11/2026

Base: preview 6b3dc63bd8e17f56b66369f31ec863993a711ddd.

## Alterações

- Cabeçalho de 80 px em telas a partir de 1024 px, com logo proporcional.
- Capa da página inicial com largura máxima de 1120 px e altura limitada à tela. Conferida com a imagem atual: sofá inteiro visível e espaço para a faixa abaixo.
- Produto: foto e configurador lado a lado a partir de 1200 px. Galeria acompanha a rolagem com espaço abaixo do cabeçalho; miniaturas de 64 px e altura da foto limitada à janela.
- Margens do configurador reservam espaço para o botão do WhatsApp; ele não encobre a coluna das opções.
- Medidas com tamanho mínimo legível no notebook, preservando a linha de cartões e sua ampliação.
- Correção exclusivamente de tipagem na lista de coleções (tuplas string/string[]). Sem alteração dos nomes, associações ou comportamento em execução.
- Abaixo dos pontos de quebra, a estrutura anterior permanece. Não há mudanças de preços, cálculo, categorias, álbuns, banco, API ou produção.

## Verificações

- Vite build, TypeScript e sete testes existentes: aprovados. O erro de tipos preexistente nas coleções foi corrigido.
- Início, catálogo, produto e carrinho: 24 verificações visuais em 1024×768, 1280×720, 1366×768, 1440×900, 1920×1080 e 390×844. Nenhuma rolagem horizontal da página ou erro de JavaScript.
- Notebook e celular: troca de metragem, abertura do álbum escolhido, detalhe de tecido sobre o álbum, seleção explícita, abertura/fechamento de espumas, ampliação de todos os cartões de medidas, cotação e adição ao carrinho com produto configurado: aprovados.
- Testes locais usam cópias de leitura da API de testes. Cotação é calculada pelo módulo do backend e eventos são interceptados; não há pedidos, contatos, pagamentos ou alterações no catálogo.
- Comparação móvel: produto, catálogo e carrinho têm capturas idênticas antes/depois. Na página inicial, o cabeçalho/capa mantêm as dimensões; a faixa animada de modelos muda de posição normalmente.
- Revisão React: nenhuma mudança nos hooks, estado, regras de seleção ou callbacks; somente classes de layout e tipagem.

## Aprovação

- [ ] Revisão visual do usuário no notebook.
- [ ] Publicação em produção exige autorização separada.

Limite do checkup: loja pública e fluxos citados. Não inclui auditoria completa de administração, autenticação, infraestrutura ou pagamento externo.
