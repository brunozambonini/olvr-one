# Operação e preparação de publicação

**Preparado localmente:** export estático Next, pipeline AVIF/WebP, headers, testes HTTP, perfil e workflow. **Publicado:** não. **Verificado no destino:** não. Nenhuma conta, recurso remoto, token ou projeto Pages foi criado. O aceite visual da primeira fatia foi recebido em 12/10/2026; a expansão local foi implementada e validada conforme relatórios. Conta/repositório e configuração segura de publicação ainda faltam. O [plano de publicação online](online-release-plan.md) contém o procedimento desde a criação do repositório até o smoke público e rollback.

## Reproduzir o ambiente

Use Node 22.14.0 (`.nvmrc`) e npm 10.9.2. Não há Docker, banco, migrações, backend, Functions nem variáveis públicas. A aplicação usa assets locais; nenhuma chave entra no bundle.

```sh
npm ci
npm run audit:check
npm run lint
npm run typecheck
npm run build
npm run smoke
npx playwright install chromium firefox webkit
npm test
```

Em Linux de CI, instalar browsers com `npx playwright install --with-deps chromium firefox webkit`. O typecheck executa `next typegen` antes de `tsc`, gerando as declarações Next necessárias mesmo em checkout limpo. O build executa `assets:build`, usando masters preservados, manifest e sharp com versões fixas. `out/` é o único artefato servido; `public/images/` é derivado. O cache de processamento pode ser descartado sem perder os masters. A geração por IA dos masters não é bit a bit reproduzível; o processamento local a partir dos arquivos preservados é rastreável por SHA256 no relatório de imagens.

`npm run preview` serve `out/` exclusivamente em `http://127.0.0.1:4173`, com gzip para texto, MIME correto, 404 e políticas equivalentes às de cache de produção. Não é o servidor dev. `npm test` inicia o preview se necessário. `npm run profile` exige o preview já iniciado e confere que seu HTML é o mesmo export em disco. Não executar build, testes ou outros browsers concorrentes durante a coleta de perfil. Resultados e screenshots ficam em `reports/performance/`; `docs/performance.md` apresenta a medição da fatia.

## Artefato e CI

`.github/workflows/validate.yml` executa install, audit, lint, types, build, smoke e Playwright em Chromium/Firefox/WebKit. O perfil é uma atividade do marco visual, não uma etapa onerosa em todo PR. `check-export.mjs` verifica tamanho/quantidade de arquivos, assets, orçamento de scripts iniciais e ausência de runtime servidor. Registra SHA256 de caminhos e bytes do export, data, runtime e revisão em `reports/export.json`. Sem Git, a revisão local é `uncommitted-local`, identificada pelo hash do artefato.

O job de publicação baixa **o mesmo `out/` validado**, sem rebuild, e compara o hash com o relatório. Retenção de artefatos: três dias. Concurrency `olvr-production`, sem cancelar uploads ativos, serializa publicações. Uma consulta de HEAD imediatamente antes do upload recusa revisões já ultrapassadas na branch padrão. Uma revisão que surgir durante um upload já iniciado será publicada depois na fila; o fluxo não promete cancelar atomicamente alterações do remoto durante o upload.

O workflow só publica por `workflow_dispatch`, com a opção `publish` explicitamente habilitada, na branch padrão e pelo environment `production`. **Criar esse environment com required reviewers e restrição à branch padrão antes de habilitar a fase de release.** A configuração de proteção fica no GitHub, não pode ser garantida apenas pelo YAML. Os workflows estão preparados em arquivo, ainda não executados pelo GitHub.

## Recriar Pages Free após autorização

1. Criar o repositório público e confirmar branch padrão, acesso e elegibilidade atuais. Registrar commit aprovado. Configurar o environment `production` protegido no GitHub.
2. Na conta Cloudflare Free escolhida, criar um projeto **Pages Direct Upload** com nome acordado e branch de produção igual à branch padrão. O fluxo atual não cria esse recurso automaticamente. Direct Upload não migra in-place para Git integration; a troca exige outro projeto.
3. Confirmar uso somente de assets estáticos, sem Functions/R2/Images/serviços por consumo. Limites considerados: 20 mil arquivos e 25 MiB por arquivo. Reconfirmar termos/limites ao publicar. Não solicitar cartão nem mudar plano durante a preparação.
4. Fornecer `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_API_TOKEN` como secrets do environment, com token de edição de Pages restrito à conta pertinente. Fornecer `CLOUDFLARE_PROJECT_NAME` como variável do mesmo environment. Nunca salvar valores no repo ou logs.
5. Após autorização humana da revisão concreta, disparar `Validate static export` na branch padrão com `publish=true` e aprovar o environment. O Wrangler fixado no lockfile faz o Direct Upload. `npm run deploy` local recusa publicação antes de rede; o script requer o contexto explícito do workflow manual.
6. Registrar revisão, hash do export, run do workflow, deployment ID, URL e horário. Só então executar smoke no `*.pages.dev` retornado. Build verde e upload concluído, isoladamente, não comprovam experiência publicada funcional.

Referências do destino já aprovado: [Next export no Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/), [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [limites](https://developers.cloudflare.com/pages/platform/limits/), [rollback](https://developers.cloudflare.com/pages/configuration/rollbacks/). Não há infra declarativa completa; a configuração versionada e esta sequência permitem recriação manual auditável.

## Health, cache e recuperação

Smoke publicado: GET da raiz e 404, assets/fontes sem falha, navegação, nove variantes do configurador, três cenários AR e alternância World/OLVR, retry/reset, viewport mobile, reduced motion e console. Conferir headers por HTTP: nosniff, referrer policy, frame deny e câmera/microfone/geolocalização desabilitados. Assets Next com hash usam cache imutável; imagens com nomes estáveis usam TTL de uma hora com revalidação; HTML revalida. Uma atualização emergencial da mesma URL de imagem pode exigir purge do cache, ou novo nome de asset, antes do smoke.

Sem backend/telemetria nesta fatia. Health consiste em disponibilidade da página, integridade de assets e fluxo representativo; observabilidade remota disponível será a do Pages, complementada pelo console/browser e logs do workflow. Dados pessoais, analytics e coleta de erros não foram introduzidos.

Interromper avanço se faltarem assets, aparecerem erros de console, preview confirmar variante errada ou headers forem incompatíveis. Não repetir deploy às cegas. Se houver produção anterior funcional, usar o rollback de Pages para o deployment anterior e repetir o smoke. Sem deployment anterior, investigar antes de nova publicação; não há rollback de banco. **Rollback não foi executado nesta fase**, pois nenhuma publicação existe.


## Acesso de release verificado em 12/10/2026

Git CLI está instalado, mas este diretório ainda não contém um repositório Git. GitHub CLI não está disponível. Nenhum nome convencional de variável de credencial GitHub/Cloudflare foi encontrado no ambiente inspecionado; valores não foram impressos. `npx wrangler whoami` retornou não autenticado. Nenhum login, conta temporária, recurso remoto ou publicação foi iniciado. O domínio definitivo deverá ser configurado como metadataBase antes do build de release para que os metadados sociais não apontem a localhost.

## Retomada verificada em 13/10/2026

Preparado: os arquivos de workflow, Direct Upload, headers e recuperação foram inspecionados; nenhuma alteração de infraestrutura foi necessária. O export local possui 103 arquivos e hash `0c772ceba1713f36ecb573b4ae9c869412edf09a496babca70694691eb2c3e79`. Preview HTTP 200 e HTML igual ao export foram confirmados. O bloqueio inicial do perfil foi resolvido executando no runtime autorizado do agente principal. A coleta final de seis runs terminou com exit 0 sobre o mesmo export, conforme `docs/performance.md`; os parciais foram preservados separadamente. O acesso às contas de release continua pendente.

Publicado: não. Verificado no destino: não. A inspeção local confirmou ausência de `.git` e ausência dos nomes convencionais `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PROJECT_NAME`, `GH_TOKEN` e `GITHUB_TOKEN` no ambiente do processo; nenhum valor foi impresso. Não foi repetida consulta remota de autenticação nesta sessão. O resultado não autenticado do Wrangler acima é evidência de 12/10, não uma nova consulta. Ainda faltam conta/projeto Pages, repositório GitHub e configuração segura dos secrets/environment para publicar pelo destino aprovado. Nenhum recurso, URL pública ou execução remota de CI foi criado.

### Plano de implantação preparado em 13/10/2026

O [roteiro executável](online-release-plan.md) foi atualizado com GitHub Free público, environment protegido, token Pages com permissão de edição, Direct Upload do mesmo artefato, smoke e recuperação. A inspeção local desta rodada confirmou `.git` ausente, Git CLI presente, GH CLI ausente e Wrangler instalado; os nomes convencionais das variáveis de credencial acima não estavam definidos (valores nunca foram consultados ou impressos). A documentação oficial foi consultada para condições atuais de Pages e GitHub. Esta preparação **não** inclui um push, execução remota de Action, projeto Pages criado ou deploy.

### Hardware interativo integrado em 13/10/2026

O export local mais recente após os três detalhes interativos de Hardware tem SHA256 `3db2e508cd8297ef9bbeb42dc7be31e0d7de43ffb394362fa10ec103258f24ff`; o hash `0c772c...` acima identifica apenas a versão anterior. Build, smoke, typecheck e lint passaram. O preview local respondeu HTTP 200 com o novo markup. Testes focados passaram em Chromium (4/4) e WebKit (4/4); Firefox executou as ações, mas falhou ao encerrar o contexto por erro interno reproduzível do navegador/Playwright, portanto essa execução não é declarada verde. Capturas em 320, 390 e 1440 px ficam em `reports/visual/expansion/`. Nenhuma publicação remota foi feita.
