# Vídeo Limpo

Uma ferramenta estática para remover metadados de vídeos MP4 e MOV antes de publicar em redes sociais.

## Como funciona

O vídeo é processado no próprio navegador. A aplicação lê o contentor MP4/MOV, remove caixas de metadados como `udta`, `meta` e `uuid`, e mantém os bytes dos fluxos de vídeo e áudio sem reencodificação. Isso preserva resolução, proporção, duração e qualidade original.

O processo não é uma garantia de que o TikTok deixará de reconhecer visualmente um template: a plataforma também pode analisar imagens, efeitos e montagem.

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

Para gerar a versão estática:

```bash
pnpm build:static
```

O resultado fica em `dist/public`. O workflow em `.github/workflows/deploy-pages.yml` publica automaticamente o conteúdo no GitHub Pages a cada push na branch `main`.

## Privacidade

Não existe login, base de dados, histórico ou upload para servidor. O ficheiro permanece no dispositivo da pessoa durante o processamento e é convertido num download local.
