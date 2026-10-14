# Validação independente — expansão aprovada

Validador: /root/olvr_continuation/validator. Execução em 12/10/2026, Windows x64, Node 22.14.0, Playwright 1.64.0; Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2. Export estático local http://127.0.0.1:4173, SHA-256 **0c772ceba1713f36ecb573b4ae9c869412edf09a496babca70694691eb2c3e79**. Sem ambiente publicado ou aparelho físico.

## Resultado atual

Nenhum defeito de aplicação encontrado nesta expansão. A rodada integrada executou 81 casos: 78 passaram e 3 falharam por uma asserção inadequada do teste sobre noscript. O DOM continha o texto correto, mas o matcher de texto do Playwright ignora esse elemento. O teste foi corrigido para ler textContent e verificar visibilidade do parágrafo; os três engines passaram na reexecução. Acrescentado também um caso por engine para teclado AR, reduced motion e mudança francês→inglês no mesmo HUD: 6/6 passaram, exit 0. **Cobertura efetiva de 84 casos aprovada, combinando rodadas; não foi uma rodada única 84/84.** A implementação não foi alterada pelo validador.

| Comando executado | Resultado / evidência |
|---|---|
| node node_modules/@playwright/test/cli.js test --workers=2 --reporter=list,json --output=reports/validation-expansion-run | 78/81, exit 1; três falhas do matcher explicadas acima. reports/validation-expansion-results.json e traces preservados |
| Mesmo runner com --grep 'no JavaScript|AR keyboard' e --output=reports/validation-expansion-confirmed | 6/6, exit 0; reports/validation-expansion-confirmed.json |
| node scripts/tests/a11y-audit.mjs | exit 0; axe-core 4.14.0 após tradução em 390/1440 px, zero violações; reports/validation-expansion-a11y.json |
| node scripts/tests/capture-expansion.mjs | exit 0; 20 capturas de viewport em 320/390/768/1440 px e capture.json em reports/visual/expansion/ |
| Script diagnóstico Node/Playwright com hasTouch true, viewport390×844 | exit 0; tap real em labels das nove combinações e ação Translation, todos confirmados; zero requests fora de localhost. reports/validation-expansion-touch.json |

## Cobertura e evidências

- Configurador 3×3: imagem decodificada, alt, caption, seleção de frame/lens e status consistentes em todas as nove combinações. Dois grupos acessíveis por Tab/setas, foco visível nos três engines. O helper dos testes de corrida faz dois clicks DOM no mesmo task para solicitar uma combinação sem aguardar o decode intermediário; o diagnóstico touch separado percorre as nove combinações com taps e o teste de teclado usa interação nativa.
- Preservados os testes de loading, last-request-wins, reset pendente, erro inicial, erro antes da hidratação e retry da mesma URL. Rede bloqueada/atrasada é injeção controlada; o app e assets são do export real.
- AR: Navigation, Vision e Translation; World/OLVR, reset e resposta contextual. Respostas de 180 ms canceladas por troca de cenário, troca de vista e reset, com clock controlado (não medida de performance). Cena bloqueada deixa tradução operável e retry restaura naturalWidth positivo.
- Menu francês Café/Thé/Croissant muda para Coffee/Tea/Croissant na lista acessível e no HUD; antes/depois verificados no mesmo overlay. Legibilidade visual inspecionada no mobile. Divulgação de roteiro/simulação presente. Inspeção estática não encontrou getUserMedia, geolocation, fetch, XMLHttpRequest ou WebSocket em app/components/content; fluxo touch observado não fez requests externos. Isso não é auditoria de segurança completa.
- Narrativa/hero/Hardware/encerramento continuam disponíveis sem JavaScript; mensagens de fallback visíveis. Reduced motion remove animação do HUD e pulsação/crossfade do configurador, mantendo interação.
- Sem overflow em 320/390/768/1440. Preview e seis opções juntos em 320×568 e 360×640. Alvos medidos ≥44 px. Reflow720×450/DPR2 simula 1440×900 em200%; não é zoom nativo.
- Capturas de viewport, sem screenshot de elemento longo: translation, translation-context, hardware, configurator e closing em desktop/mobile/small/tablet. Inspecionados visualmente mobile translation, small configurator, desktop hardware e mobile closing, sem bloqueador. Todas as quatro capturas de contexto reportam zero exceções e ausência de overflow.
- Diagnósticos automáticos dos contextos principais: sem exceções, console errors ou falhas de rede inesperadas. Aborts injetados e404 ficam separados. Contextos auxiliares no-JS/touch não reproduzem toda a instrumentação de console da fixture.

## Limites e próximo passo

Axe não prova conformidade WCAG: color-contrast permanece incompleto para textos sobre imagens/overlays e glifos. Não houve leitor de tela, dispositivo físico, zoom UI nativo ou smoke publicado. WebKit/Windows mantém a limitação previamente documentada para Tab em links (foco+Enter nesses casos); radios foram testados com Tab/setas reais. Perfil de performance é responsabilidade do platform e não é inferido desta suíte. Todos os browsers do validador foram fechados antes da liberação para perfil. Build/lint/typecheck e release são evidências de seus respectivos responsáveis.

---

## Histórico preservado — primeira fatia

# Validação independente da primeira fatia

Validador: `/root/olvr_manager_recovery/validator`. Ambiente: Windows x64, Node 22.14.0, npm 10.9.2, Playwright 1.64.0, export estático servido em `http://127.0.0.1:4173`. Sem Git nesta etapa; a revisão é identificada pelo SHA-256 em `reports/export.json`. Nenhum teste usa o servidor de desenvolvimento ou ambiente publicado.

## Resultado final em 12/10/2026

Validação funcional concluída, sem achados de produto em aberto dentro desta fatia. Dois problemas do preview inicial e um de foco no WebKit foram corrigidos pelo coordenador e revalidados. As evidências combinam a rodada integrada de 11/10 com os testes afetados pela alteração final de CSS em 12/10; não houve uma nova execução conjunta dos 69 casos no último hash. Aprovação visual final e certificação de acessibilidade não são inferidas desses testes.

| Export | Resultado executado | Evidência |
|---|---|---|
| `4d79dbf4eed6d543d007427b323580ecbc3b09cd6928c154cac0d398753670f1` | 58/66 passaram; oito falhas investigadas, incluindo defeitos reais, alvo de clique incorreto do teste e particularidades do engine | `reports/validation-results.json`, `reports/validation-first-run/` |
| `0ccb0c512225a645f6e5521ea6dd3c0c9c4146336c6cb5fcfdb2381ec81b7e29` | 68/69 passaram: Chromium 23/23, Firefox 23/23, WebKit 22/23. Erro inicial, retry e pre-hidratação corrigidos; foco WebKit era o único defeito restante | `reports/validation-final-results.json`, `reports/validation-final-run/` |
| `5ce6198e737248b69809cb7fece023b9540eca0c08e09919d33bd6f463a2822e` | Correção de foco: teclado 3/3 passou nos três engines; layouts baixos 6/6 passaram no mesmo export. A rodada intermediária 8/9 falhou apenas por exigir wrap não nativo do WebKit, ver explicação abaixo | `reports/validation-keyboard-results.json`, `reports/validation-keyboard-confirmed/`, `reports/validation-focus-results.json`, `reports/validation-focus-confirmed/` |

## Achados e reprodução

1. **Corrigido — erro inicial não reconciliado após hidratação (P2).** Abortar `**/obsidian-clear-*.webp` antes de abrir a página e rolar até o configurador podia manter `Showing Obsidian / Clear.` sem botão de retry, embora `naturalWidth=0`. Observado no Chromium. Foi adicionado caso determinístico segurando os scripts até a imagem falhar; no segundo export passou nos três engines.
2. **Corrigido — retry confirma imagem que continuava quebrada no DOM (P2).** No Firefox, remover o bloqueio da imagem inicial e clicar `Try again` atualizava status/caption, mas a imagem permanecia sem pixels decodificados após cinco segundos. A correção do app remonta a imagem após decode válido. No segundo export, os três engines retornaram `naturalWidth=768`, `complete=true` e `Showing Obsidian / Clear.`. JSON e screenshots de falha/recuperação: `reports/validation-recovery/`.
3. **Corrigido — foco do radio some após ArrowDown no WebKit (P2).** Tab colocava o primeiro radio em foco com outline; ArrowDown mudava a seleção e o foco, mas `:focus-visible` virava falso e o label perdia o outline. Confirmado em reprodução isolada após 300 ms, não só assert imediato. O fallback `label:has(input:focus)` mantém o outline durante navegação por setas. Correção aprovada pelos três engines no último hash. Evidência anterior: `reports/validation-recovery/webkit-radio-focus.json`; comportamento corrigido e comparação nativa: `reports/validation-webkit-native-keyboard.json`; teste final: `reports/validation-keyboard-results.json`.

As duas falhas de clique fora do menu em Chromium/Firefox eram do teste: o alvo escolhido (`h1`) estava coberto pelo menu aberto. O alvo foi trocado pela imagem visível abaixo dele. Escape, restauração de foco e navegação foram mantidos como requisitos. No teste final de teclado, o WebKit parou na última opção em vez de voltar automaticamente à primeira; uma página HTML mínima com radios nativos reproduziu exatamente isso. O teste passou a verificar também o retorno pelas três opções via ArrowUp, com seleção, preview e foco visível consistentes. O requisito é acesso às quatro combinações por teclado, sem impor wrap diferente do comportamento nativo. Nenhuma implementação foi alterada pelo validador.

## Cobertura executada

- 23 casos por engine: carga em 320/390/768/1440 px, resposta 404, quatro combinações reais com imagem decodificada/caption/seleção consistentes, reset, menus, skip link, teclado nativo dos radios e disclosure de simulação.
- Loading com imagem anterior identificada; resposta antiga descartada; reset durante request pendente; falha/retry/reset; erro inicial e erro antes da hidratação. Falhas e atrasos são injetados pela rede do Playwright; imagens e app vêm do export real.
- Reduced motion: conteúdo operável, scroll sem smooth, loading sem pulsação e ausência de imagem de crossfade.
- 320×568 e 360×640: screenshots e geometria mostram preview e quatro opções juntos, gap medido de 16 px e ausência de overflow horizontal. No último hash, os controles mediram respectivamente 132×56 e 152×56 px. O fim das opções ficou em aproximadamente y=491 e y=514, dentro de cada viewport, nos três engines.
- Reflow equivalente a 200%: viewport 720×450/DPR2 representa uma área 1440×900 a 200%. Isso é simulação de layout; zoom nativo do browser e dispositivo físico não foram testados.
- Monitor de exceções, console e rede em cada contexto principal: zero exceções de página, erros de console inesperados ou falhas de rede inesperadas nas 69 attachments da rodada integrada e nas rodadas finais de foco/layout. 404 deliberado e aborts das imagens dos cenários de falha aparecem separados nas attachments `browser-diagnostics`. O contexto extra de reflow monitora exceções, mas não aplica esse monitor completo de rede/console.

## Acessibilidade e limites

Chromium `156.0.8078.4`, Firefox `157.0`, WebKit `27.2`. Teclado, nomes acessíveis, grupos nativos, alt, live status e geometria foram exercitados no app. No port WebKit/Windows, Tab pula links também em HTML mínimo independente do projeto: para links, os testes desse engine verificam foco programático + Enter; a ordem de Tab dos links só foi confirmada no Chromium/Firefox. Radios usam Tab e setas reais nos três.

`node scripts/tests/a11y-audit.mjs` executou axe-core 4.14.0, regras WCAG A/AA pertinentes, no Chromium em 390 e 1440 px, no hash `0ccb0c…7e29`, exit 0: zero violações automáticas. `color-contrast` ficou incompleto em textos sobre imagens, elementos sobrepostos e glifos decorativos. O resultado detalhado está em `reports/validation-a11y.json`; não equivale a comprovar contraste de todos os pixels, uso de leitor de tela ou conformidade WCAG completa. O scanner usa a cópia de axe-core já presente no lockfile; não foi adicionada dependência.

O skip link ficou fora da viewport sem foco e apareceu ao focar, com Enter chegando ao `main`. O artefato de screenshot longo de elemento relatado pelo manager não foi reproduzido como defeito de layout no fluxo normal.

## Comandos e próximo passo

Typecheck e lint dos testes executados com exit 0: `node node_modules/typescript/lib/tsc.js --noEmit` e `node node_modules/eslint/bin/eslint.js scripts/tests --max-warnings=0`.

Rodada integrada: `$env:PLAYWRIGHT_JSON_OUTPUT_NAME = 'reports/validation-final-results.json'; node node_modules/@playwright/test/cli.js test --workers=3 '--reporter=list,json' --output=reports/validation-final-run` — exit 1 pelo foco WebKit então pendente, duração 33,5 s.

Rodada afetada no último hash: `$env:PLAYWRIGHT_JSON_OUTPUT_NAME = 'reports/validation-focus-results.json'; node node_modules/@playwright/test/cli.js test --workers=3 '--reporter=list,json' --output=reports/validation-focus-confirmed --grep 'native radio keyboard|preview and all options'` — 8/9, exit 1 pela expectativa de wrap WebKit do teste, duração 19,2 s; todos os seis layouts passaram. A tentativa anterior interrompida não gerou JSON completo e não foi contada como evidência.

Confirmação final após adequar a expectativa ao comportamento nativo observado: `$env:PLAYWRIGHT_JSON_OUTPUT_NAME = 'reports/validation-keyboard-results.json'; node node_modules/@playwright/test/cli.js test --workers=3 '--reporter=list,json' --output=reports/validation-keyboard-confirmed --grep 'native radio keyboard'` — **3/3, exit 0, 4,4 s**, sem skips nem retries. Portanto os nove checks afetados têm evidência de aprovação no último export, em duas execuções.

Browsers do validador fechados e sinal de ambiente livre enviado ao manager e platform para o perfil isolado. Próximo passo da entrega: integrar o perfil e apresentar a fatia ao aceite humano. Permanecem os limites explicitados acima (aparelho físico, zoom nativo, leitor de tela e contraste sobre imagem não comprovados integralmente). Nenhum deploy foi feito nesta validação.
