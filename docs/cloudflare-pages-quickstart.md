# Cloudflare Pages: guia rápido para o OLVR ONE

O projeto usa **Cloudflare Pages com Git integration** no repositório público [`brunozambonini/olvr-one`](https://github.com/brunozambonini/olvr-one). A Cloudflare cria um deployment de produção após cada push na branch `main`. Pull requests e outras branches podem gerar previews. O GitHub Actions executa validações, mas não publica o site.

## Configuração do projeto Pages

Em **Workers & Pages → olvr-one → Settings → Build & deployments**, mantenha:

| Campo | Valor |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | vazio (raiz do repositório) |

Use `npm run build`, e não `npx next build`: o script `prebuild` do npm gera as imagens em `public/images/` antes do export estático. O projeto fixa Node em `.nvmrc`. Não há variáveis de runtime, API token ou GitHub secrets necessários para essa integração. Não configure um segundo deployment por Wrangler/Direct Upload.

## Atualização e verificação

1. Envie a mudança para o GitHub. Um commit somente local não inicia deployment; o push para `main` inicia o build de produção automaticamente.
2. Acompanhe **Workers & Pages → olvr-one → Deployments**. Confirme que a revisão publicada corresponde ao commit desejado e que o log contém a geração de imagens antes do build do Next.js.
3. Abra [olvr-one.pages.dev](https://olvr-one.pages.dev/) e teste imagens dos óculos, navegação, configurador, cenas World/OLVR e detalhes de Hardware em desktop e mobile. Verifique também se há erros no console. Um deployment verde sozinho não comprova essas interações.
4. Se a versão publicada falhar, use o histórico de deployments do Pages para restaurar uma versão de produção anterior válida e repita o smoke. Para um erro de build, corrija a causa no repositório antes de novo push.

O workflow `.github/workflows/validate.yml` roda auditoria, lint, typecheck, build, smoke e Playwright em push, pull request e disparo manual. A Cloudflare constrói em paralelo; a integração padrão não espera os checks do GitHub para publicar. Para exigir checks antes de produção, proteja `main` e faça merge apenas depois da validação do PR. A configuração de proteção de branch ainda deve ser conferida no GitHub.

O site continua com `robots: noindex,nofollow` em `app/layout.tsx`; decida se deve ser indexado e ajuste `metadataBase` para a URL pública antes de divulgar como portfólio pesquisável.

Referências: [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/).
