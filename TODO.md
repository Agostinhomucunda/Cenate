# TODO — Vídeo Limpo

## Interface de limpeza local

- [ ] A página deve estar em português, ser simples, profissional, responsiva e mobile-first.
- [ ] Deve existir uma área principal para arrastar e largar um vídeo ou escolher um ficheiro do dispositivo.
- [ ] A interface deve explicar que o processamento acontece no próprio navegador e que o vídeo não é enviado para um servidor.
- [ ] A interface deve apresentar formatos aceites, limite de tamanho e mensagens compreensíveis para ficheiros inválidos ou demasiado grandes.

## Remoção sem perda de qualidade

- [ ] O processamento deve remover metadados de contentores MP4/MOV, incluindo dados de template e edição do CapCut.
- [ ] O processamento não deve adicionar marca de água nem reencodar os fluxos de vídeo e áudio.
- [ ] A saída deve preservar imagem, áudio, resolução, proporção e qualidade original, alterando apenas a estrutura de metadados removidos.
- [ ] O site deve indicar quantas caixas de metadados foram removidas e permitir descarregar o ficheiro limpo.

## Estados e explicação

- [ ] A interface deve mostrar progresso e estado durante a leitura e a limpeza.
- [ ] Falhas devem mostrar uma mensagem útil e permitir tentar novamente.
- [ ] Deve existir um aviso honesto de que remover metadados não garante que o TikTok deixe de reconhecer visualmente um template.
- [ ] Não deve haver login, base de dados, histórico de ficheiros ou persistência do vídeo.

## Entrega para GitHub Pages

- [ ] O build deve funcionar como site estático numa subpasta do GitHub Pages.
- [ ] O repositório deve incluir um workflow de GitHub Actions para construir e publicar o site.
- [ ] O conteúdo antigo do repositório selecionado deve ser substituído pelo novo site, sem force-push.
