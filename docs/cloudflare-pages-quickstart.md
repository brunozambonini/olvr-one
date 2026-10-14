# Cloudflare Pages: guia rápido para o OLVR ONE

O Cloudflare Pages hospeda os arquivos estáticos do site numa CDN. Para este projeto, o Next.js gera a pasta `out/` no GitHub Actions e o Wrangler envia **esse mesmo artefato testado** ao Pages. Não há servidor, banco, Functions ou build na Cloudflare.

## O que criar na Cloudflare

1. Entre em [dash.cloudflare.com](https://dash.cloudflare.com/) e escolha a conta Free que receberá o projeto. Anote o **Account ID** mostrado na conta. Ele identifica a conta; não é uma senha.
2. Em **Workers & Pages**, crie um projeto **Pages** por **Direct Upload** chamado `olvr-one`, se o nome estiver disponível. Confirme a URL `https://olvr-one.pages.dev`. Se o painel pedir upload inicial, use apenas um export revisado de `out/`; registre que foi um bootstrap manual. O projeto será atualizado pelo GitHub Actions após a configuração abaixo.
3. Em **My Profile → API Tokens**, crie um token personalizado limitado à conta escolhida, com **Account → Cloudflare Pages → Edit**. Copie-o uma vez para o secret do GitHub; não coloque o valor no repositório, em arquivo `.env` ou no chat. O token pode ser revogado nessa mesma página.
4. Não configure Git integration nem comando de build no Pages: este projeto usa Direct Upload. Não habilite Functions, R2, Images ou produtos adicionais.

## O que configurar no GitHub

No repositório público, abra **Settings → Environments → New environment**, crie `production` e restrinja-o à branch `main`. Configure um reviewer para aprovar publicações. Se apenas você puder revisar, deixe **Prevent self-review** desativado, senão o deploy ficará bloqueado.

| Tipo no environment `production` | Nome | Valor |
| --- | --- | --- |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Account ID da conta Cloudflare |
| Secret | `CLOUDFLARE_API_TOKEN` | Token personalizado Pages Edit |
| Variable | `CLOUDFLARE_PROJECT_NAME` | `olvr-one` ou o nome real do projeto Pages |

O `GITHUB_TOKEN` é automático. O site não precisa de variáveis `NEXT_PUBLIC_*` nem de valores secretos em runtime: só esses três itens são usados no upload.

## Primeira publicação e próximas atualizações

1. Faça push da branch `main`. Em **Actions → Validate static export**, aguarde a validação do código. O workflow instala dependências, gera imagens, faz lint, typecheck, build, smoke e testes de navegador.
2. Para publicar uma revisão validada, abra **Actions → Validate static export → Run workflow**, selecione `main` e marque `publish`. O job `publish` aguarda a aprovação do environment `production`, então envia o `out/` testado ao Pages. Cada atualização segue o mesmo caminho.
3. Abra a URL `pages.dev` retornada pelo deploy. Verifique imagens, navegação, configurações do produto, cenas World/OLVR, detalhes de hardware, console e mobile. O job verde só comprova upload; esse smoke comprova o funcionamento publicado.
4. Se uma versão posterior falhar, use **Workers & Pages → projeto → Deployments → Rollback** para voltar ao último deployment de produção válido e repita o smoke. No primeiro lançamento ainda não há versão anterior para rollback.

Antes do build público, ajuste `metadataBase` para a URL final e decida se o portfólio deve ser indexável: hoje o site está com `noindex`. Consulte o [plano operacional completo](online-release-plan.md) para branch, segurança, limites, cache e evidências.

Referências oficiais: [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [CI para Direct Upload](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), [GitHub environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).
