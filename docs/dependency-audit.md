# Dependências — verificação de 09/10/2026

Ambiente executado: Node 22.14.0, npm 10.9.2, Windows x64. Versões diretas fixadas em `package.json` e resoluções em `package-lock.json`. Instalação sem `--force` e sem ignorar peer dependencies.

`npm install --ignore-scripts --no-fund` reconciliou o lockfile após a remoção de Lighthouse do manifest. Depois, `npm ci --no-fund` executou a instalação limpa do lockfile: exit 0, 379 pacotes instalados e 380 auditados. A contagem anterior de 32 entradas (19 moderate/13 high) caiu para **5 high**, todas decorrentes de uma única advisory no tooling de lint. `npm run audit:check` executado após `ci`: exit 0, **zero entradas de produção** e zero entradas fora da exceção abaixo. Os JSON completos são gerados em `reports/audit-all.json` e `reports/audit-production.json`.

O install também avisou que ESLint 9.39.5 está fora de suporte. A versão foi mantida pela compatibilidade do conjunto aprovado de plugins; esse débito de tooling deve ser revisto no próximo upgrade, sem confundir o aviso de suporte com outra vulnerabilidade no audit.

| Cadeia | Advisory e efeito | Tratamento |
|---|---|---|
| `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces` | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm): padrões de braces profundamente aninhados podem esgotar a pilha do processo Node. | Exceção temporária restrita aos cinco nomes e à advisory exata. Não é código servido pelo export estático. |

Consulta direta ao npm retornou `braces` 3.0.3 e `fast-glob` 3.3.3 como latest. O advisory oficial informa que não há versão corrigida. O `npm audit` sugeriu downgrade principal de ESLint Next para 14.2.35; essa mudança incompatível com Next 16 não foi aplicada. Não introduzimos override não suportado nem patch próprio do pacote.

O CI falha para qualquer nova entrada fora da exceção, qualquer severidade diferente ou achado em dependências de produção. O lint usa configuração versionada e não recebe padrões fornecidos pelos visitantes. PRs executam em runner descartável sem segredos de deploy. Esses controles reduzem a exposição do tooling; não eliminam a vulnerabilidade do pacote. Rever a exceção no próximo upgrade e antes da publicação, removendo-a quando houver correção compatível. O audit é uma fotografia do registry na data da execução, não uma garantia geral de segurança.
