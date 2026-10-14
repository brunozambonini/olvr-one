# Publicação online — OLVR ONE

**Estado observado:** o repositório público [`brunozambonini/olvr-one`](https://github.com/brunozambonini/olvr-one) está conectado ao Cloudflare Pages por **Git integration**. A versão inicial foi publicada em [olvr-one.pages.dev](https://olvr-one.pages.dev/) e as imagens que falhavam no primeiro build passaram a carregar após o comando de build ser corrigido para `npm run build`. Esta nota não confirma que mudanças posteriores estejam publicadas ou verificadas.

## Arquitetura de release

- O Next.js usa `output: "export"` e gera `out/`. Não há servidor, banco, migrações ou Functions no destino.
- A Cloudflare constrói e publica automaticamente cada push em `main`, com build command `npm run build`, output directory `out`, root directory vazia e Node definido por `.nvmrc`. O `prebuild` do npm gera os assets de imagem; `npx next build` isolado omite essa etapa.
- O GitHub Actions em `.github/workflows/validate.yml` valida push, PR e disparo manual com auditoria, lint, typecheck, build, smoke e Playwright. O workflow não faz deploy. A Cloudflare não aguarda esses checks antes de publicar um push direto na `main`.
- Não são necessários `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PROJECT_NAME` ou ambiente `production` no GitHub para o deploy por Git integration. `scripts/deploy.mjs` é legado do plano Direct Upload e não faz parte do fluxo ativo.

## Fluxo recomendado

1. Desenvolver em branch e abrir PR. Revisar o diff e aguardar o job `validate` verde. Configurar proteção de `main` para exigir PR e checks se essa política for desejada; **não há confirmação aqui de que a regra esteja ativa**.
2. Fazer merge na `main`. O Pages inicia novo build automaticamente. No painel **Workers & Pages → olvr-one → Deployments**, conferir status, commit SHA e log. Se as imagens não aparecerem, confirmar que o log executou `prebuild`/`assets:build` antes do Next.js.
3. Fazer smoke do deployment publicado: raiz, imagens e fontes por HTTP; navegação, configurador, cenários World/OLVR, controles de Hardware, console e mobile no navegador. Registrar URL de deployment e SHA. Um build ou HTTP 200 isolado não valida a experiência.
4. Se o build falhar, diagnosticar o log e corrigir por novo commit. Se a versão publicada falhar, restaurar uma versão de produção válida no histórico de deployments do Pages e repetir o smoke; o primeiro deployment não tem versão anterior para rollback.

## Antes de divulgar como portfólio indexável

`app/layout.tsx` ainda define `robots: { index: false, follow: false }`. Decidir conscientemente sobre indexação e adicionar `metadataBase` para a URL final; conferir metadados publicados e preview social após a mudança. Se for usado domínio próprio, revisar também URL canônica e metadata.

O site estático não exige variáveis `NEXT_PUBLIC_*` nem segredos de runtime. Mantenha produtos opcionais da Cloudflare desabilitados até existir uma necessidade concreta. Para limites e custos, consulte os limites da conta antes de adicionar uploads, Functions ou serviços externos. Não há telemetria de visitantes configurada; logs de build/deployment não são Core Web Vitals de campo.

Referências: [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/), [Pages limits](https://developers.cloudflare.com/pages/platform/limits/).
