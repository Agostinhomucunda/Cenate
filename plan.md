# Vídeo Limpo — plano

## Direção escolhida

**Estilo candidato A (0,06):** ferramenta editorial com fundo carvão, verde-lima elétrico e composição assimétrica inspirada em interfaces de edição de vídeo.

**Estilo candidato B (0,04):** utilitário branco, neutro e quase clínico, com foco total no formulário.

**Estilo candidato C (0,08):** estética neon de creator economy, com gradientes roxos e cartões flutuantes.

Foi escolhido o **Estilo candidato A** porque comunica limpeza técnica e confiança sem parecer uma página genérica de upload.

- **Movimento de design:** editorial tech / software de pós-produção, com hero assimétrico e grande área de upload.
- **Princípios:** clareza antes de decoração; feedback de estado visível; sensação de controlo local; acessibilidade mobile-first.
- **Filosofia de cor:** carvão profundo reduz ruído e faz o vídeo parecer protagonista; verde-lima assinala a ação de limpeza; branco quente melhora leitura.
- **Paradigma de layout:** página em faixa vertical com hero dividido em narrativa e ferramenta; abaixo, três provas curtas e um aviso honesto sobre o TikTok.
- **Elementos assinatura:** selo circular “sem reencodar”; barra de progresso em verde-lima; cartões que lembram frames de vídeo.
- **Interação:** arrastar e largar ou escolher ficheiro, com transições curtas e mensagens explícitas em português.
- **Animação:** entrada suave do hero; brilho discreto no dropzone em hover; progressão de estado sem efeitos que dificultem a leitura.
- **Tipografia:** Manrope para títulos e Inter/system-ui para leitura, com números e etiquetas compactos.
- **Essência:** “Remove a assinatura técnica do teu vídeo antes de publicar.” Personalidade: direta, cuidadosa, transparente.
- **Voz:** simples e tranquilizadora. Exemplos: “Arrasta o vídeo. Nós limpamos o ficheiro.” / “A imagem e o som ficam iguais; só saem os metadados.”
- **Wordmark/marca:** um “V” construído por dois cortes diagonais dentro de um quadrado arredondado, sugerindo uma timeline limpa.
- **Cor proprietária:** verde-lima `#D6FF55` sobre carvão `#111817`.

## Implementação

O projeto será publicado como frontend estático para GitHub Pages. A limpeza acontece no próprio navegador, sem upload para um servidor. Um parser de contentores MP4/MOV remove caixas de metadados como `udta`, `meta` e `uuid`, mantém o tamanho do contentor para não deslocar offsets de media quando necessário e não reencoda os streams de vídeo ou áudio. Assim, a imagem, o som, a resolução e a qualidade permanecem intactos.

A página React terá um componente de upload com drag-and-drop, validação de vídeo e limite de 500 MB, estados de leitura/limpeza/conclusão/erro, link de download, resumo do que foi removido e aviso de que o TikTok ainda pode reconhecer um template visualmente. Não haverá login, base de dados, histórico, marca de água ou envio para servidor.

O build usa Vite com `base: './'` para funcionar numa subpasta do GitHub Pages. Um workflow do GitHub Actions construirá `dist/public` e publicará na infraestrutura de Pages.

## Estrutura

- `client/src/pages/Home.tsx`: interface e fluxo de seleção, limpeza e download.
- `client/src/lib/mp4Metadata.ts`: parser determinístico de caixas MP4/MOV sem reencodificação.
- `client/src/index.css`: sistema visual, responsividade e estados da ferramenta.
- `client/public/manus-routes.json`: declaração da rota única.
- `.github/workflows/deploy-pages.yml`: build e publicação no GitHub Pages.
- `vite.config.ts`: build relativo para subpasta e preview Manus.
