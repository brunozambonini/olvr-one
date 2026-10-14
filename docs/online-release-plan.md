# Plano de publicação online — OLVR ONE

**Estado em 13/10/2026:** preparado em arquivos locais; GitHub Actions ainda não executado; nenhum repositório Git, projeto Cloudflare Pages, deployment ou URL pública foi criado/verificado. Este documento é um plano de execução, não um registro de publicação. O destino aprovado para o projeto é **GitHub público + Cloudflare Pages Free (`pages.dev`)**, com **Direct Upload pelo GitHub Actions** do export estático Next.js.

## 1. Decisões e pré-requisitos antes do primeiro push

1. Escolher conta/organização GitHub, nome do repositório (sugestão `olvr-one`) e conta Cloudflare Free. O repositório precisa ser **público** se a proteção por reviewer e secrets de environment forem usados no GitHub Free. Confirmar que o código, prompts e masters versionados podem ser públicos. `.gitignore` já exclui `out/`, `node_modules/`, relatórios gerados, `.env*` e imagens derivadas; revisar a lista de arquivos com `git status` antes de publicar.
2. Definir o nome do projeto Pages (sugestão `olvr-one`) e a branch padrão (`main`). Manter o mesmo nome em `CLOUDFLARE_PROJECT_NAME`. Se o nome `pages.dev` estiver indisponível, escolher outro antes de configurar metadados.
3. Definir se o portfólio deve ser encontrado por buscadores. O código atual em `app/layout.tsx` usa `robots: { index: false, follow: false }`. Para um lançamento público indexável, alterar isso de forma consciente e conferir o resultado publicado. Adicionar `metadataBase` para a URL final `https://<projeto>.pages.dev` antes do build de release; sem ele, a imagem social relativa pode não resolver corretamente. Se houver domínio próprio no futuro, mudar `metadataBase` e revisar canônica/preview social. Nenhuma dessas mudanças foi feita neste plano.
4. Confirmar Node 22.14.0 (`.nvmrc`), npm 10.9.2 (`package-lock.json`), export estático `out/`, headers em `public/_headers` e ausência de serviços dinâmicos. Não há banco, migrações, Functions, contas de usuário ou runtime Node no destino.

## 2. Criar o repositório GitHub

O diretório atual **não contém `.git`** e o GitHub CLI não está instalado. Criar no GitHub um repositório **público, vazio**, sem README, `.gitignore` ou licença gerados pelo site, para evitar conflito com os arquivos locais. Confirmar nome e branch padrão. Depois de revisar arquivos e alterações finais:

```sh
git init -b main
git status --short
git add .
git diff --cached --stat
git diff --cached --check
git commit -m "Initial OLVR ONE site"
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

Autenticar o Git pelo mecanismo próprio do GitHub/Git Credential Manager; **não colocar token na URL, no código ou no chat**. Se o repositório já tiver commits, inspecionar o histórico antes de definir o procedimento de integração; não forçar o push. Registrar SHA do commit e URL do repositório. Aplicar proteção da branch padrão compatível com o fluxo escolhido (por exemplo PR + checks obrigatórios `validate`); na primeira publicação, verificar se a regra permite bootstrap e quem pode revisar. Não há necessidade de GH CLI para criar ou operar o fluxo.

## 3. Criar o projeto Pages Direct Upload

Na conta Cloudflare escolhida, abrir **Workers & Pages → Create application → Pages → Direct Upload** e criar o projeto com o nome acordado. Preferir o caminho via Wrangler/Direct Upload quando o painel oferecer a escolha; o primeiro deployment pode ser feito após a configuração do GitHub Actions. Se o painel exigir um upload inicial, usar **o export revisado da mesma revisão** e registrar que esse bootstrap foi manual. Confirmar no projeto a production branch `main`; o workflow passa `--branch main` e `--commit-hash <SHA>`. Um projeto Direct Upload **não oferece os controles automáticos de branch de um projeto conectado ao Git**; a proteção real deste fluxo está no GitHub e no script de deploy. Mudar a production branch depois requer a API Update Project da Cloudflare.

O Direct Upload **não se converte in-place para Git integration**. Para migrar a esse modo seria necessário outro projeto e troca de domínio. No painel Pages, não configurar build command nem output directory para reconstrução: a Actions envia o `out/` já testado. `wrangler.jsonc` indica `./out` e compatibilidade, mas não cria nem publica o projeto sozinho. Não ativar Functions, R2, Images ou outro serviço de consumo para este site estático.

## 4. Configurar credenciais e proteção no GitHub

Criar um **Cloudflare API Token customizado**, escopo da conta escolhida, com permissão **Account → Cloudflare Pages → Edit**. Salvar o valor apenas como secret do environment GitHub `production`, com nome `CLOUDFLARE_API_TOKEN`. Salvar o account ID como secret `CLOUDFLARE_ACCOUNT_ID` e o nome do projeto como variável de environment `CLOUDFLARE_PROJECT_NAME`. O `GITHUB_TOKEN` é fornecido automaticamente ao workflow; não criar PAT GitHub para a Action.

Em **Settings → Environments → New environment → `production`**, limitar a deployment branch à branch padrão e cadastrar um required reviewer antes de disponibilizar os secrets. No GitHub Free, required reviewers e secrets de environment exigem repositório público. Se o owner for a única pessoa capaz de revisar, deixar **Prevent self-review desativado**: ativá-lo nessa condição bloquearia o job. Para revisão independente, adicionar outra pessoa com acesso de leitura e então habilitar Prevent self-review. Conferir no painel que o job `publish` realmente fica aguardando a aprovação e que os secrets só ficam disponíveis depois dela. Não imprimir valores de secrets em logs.

## 5. CI e CD previstos pelo workflow existente

`.github/workflows/validate.yml` executa em push, PR e disparo manual: checkout, Node pela `.nvmrc`, `npm ci`, auditoria delimitada, lint, typecheck, build, smoke e Playwright em Chromium/Firefox/WebKit. O job `validate` guarda `out/` e `reports/export.json` em um artefato com o SHA do commit por **3 dias**. Um PR deve mostrar `validate` verde; não expor credenciais ao PR.

O job `publish` só roda via **Actions → Validate static export → Run workflow**, branch padrão, opção `publish=true`, após `validate` e a aprovação do environment `production`. Ele baixa o **mesmo export validado**, não faz outro build, e `scripts/deploy.mjs` confere SHA do commit, branch padrão, hash dos bytes de `out/` e HEAD atual do GitHub antes de chamar Wrangler `pages deploy`. `concurrency: olvr-production` serializa uploads. Ao expirar o artefato de três dias, disparar nova validação manual para a revisão ainda atual; não recuperar um export antigo informalmente.

O estado local observado não prova que a Action roda no GitHub: a primeira execução remota deve ser tratada como validação da integração. Se falhar, registrar run/step e corrigir a causa; não desabilitar gates ou repetir uploads sem diagnóstico. `npm run deploy` no computador local recusa uso fora do contexto manual previsto.

## 6. Smoke público, observabilidade e recuperação

Depois de um upload bem-sucedido, registrar **run URL, SHA, hash do export, deployment ID, URL `*.pages.dev`, hora e ambiente**. Verificar por HTTP a raiz, `404.html`, imagens e fonte; conferir `_headers` efetivos (nosniff, referrer policy, frame deny e permissões de câmera/microfone/geolocalização desativadas), cache de HTML e assets. No browser, testar desktop e mobile: navegação, nove variantes, World/OLVR e os três cenários, botão HUD de tradução, interação de Hardware, teclado e reduced motion. Conferir console sem erro e metadados da URL final. Um HTTP 200 isolado não comprova essas funções.

Não há backend/DB; health é disponibilidade e integridade do site/fluxos. Usar o histórico de deployments do Pages e logs da Action para diagnosticar falhas. Não há analytics/telemetria de visitantes; não apresentar essas fontes como Core Web Vitals de campo.

Se o smoke público falhar, interromper divulgação. Com produção anterior válida, usar **Pages → Deployments → menu do deployment anterior de produção → Rollback**, confirmar URL e repetir smoke. Preview deployments não são destinos de rollback. No primeiro deployment não existe versão anterior: corrigir a causa e publicar uma revisão validada. Cache de imagens com nome estável pode exigir purge ou novo nome para correção urgente. Registrar incidente e revisão restaurada; não há migração de dados a reverter.

## 7. Limites e custo a confirmar na conta

O projeto estático pode usar Pages Free sem pacote pesado de infraestrutura ou servidor. Limites publicados para Free: **20.000 arquivos por site**, **25 MiB por asset**, **100 projetos por conta** e, para builds da integração Git feita pela própria Cloudflare, **500 builds/mês**. Neste fluxo Direct Upload, o build roda no GitHub Actions, então não tratar o limite de builds Pages como cota de CI aqui; verificar limites de minutos/armazenamento de Actions da conta antes de automações adicionais. O `check-export.mjs` já impõe 20.000 arquivos, 25 MiB e o orçamento de JS no export. Não prometer custo zero absoluto fora do escopo estático; domínio próprio, produtos extras ou excedentes devem ser avaliados antes de habilitar.

Fontes oficiais consultadas em 13/10/2026: [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [CI com Direct Upload e permissão do token](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), [limites Pages](https://developers.cloudflare.com/pages/platform/limits/), [controles de branch](https://developers.cloudflare.com/pages/configuration/branch-build-controls/), [rollback](https://developers.cloudflare.com/pages/configuration/rollbacks/), [GitHub environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) e [review de deployments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments).

## Resultado esperado e evidência ainda pendente

**Preparado:** projeto e workflow locais inspecionados, roteiro acima. **Publicado:** não. **Funcionamento online verificado:** não. Dependências reais: escolha das contas/nome, criação de repo/projeto, metadados de URL final e indexação, secrets/proteção no GitHub, primeira execução remota, smoke e registro de rollback possível. Depois disso, o fluxo regular é PR com checks → merge na branch padrão → disparo manual `publish=true` → approval `production` → upload do artefato validado → smoke público.
