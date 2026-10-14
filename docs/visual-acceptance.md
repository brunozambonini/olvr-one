# OLVR ONE — experiência expandida

**Atualização de motion em 13/10/2026:** revelação World ↔ OLVR e reflexo do configurador implementados e validados no export `0d566df…790a70`. [Capturas e evidências desta mudança](motion-qa.md). As medidas de performance e o hash da expansão abaixo são históricos e se referem ao export anterior.

Atualizado em 13/10/2026. A primeira fatia recebeu aceite humano em 12/10: “Ficou legal. Pode continuar”. A expansão autorizada está implementada: narrativa completa, World/OLVR, cenários Navigation/Vision/Translation, Hardware, configurador com nove combinações e encerramento. AR é uma demonstração roteirizada; não acessa câmera, localização ou serviços de IA. O baseline por imagens foi mantido, sem canvas.

## Evidências da expansão

Export SHA-256 `0c772ceba1713f36ecb573b4ae9c869412edf09a496babca70694691eb2c3e79`, 103 arquivos, identificado em `reports/export.json`. Build/smoke, lint e TypeScript passaram. A validação independente cobre efetivamente **84 casos em três engines**, combinando 78 aprovações da rodada integrada e seis aprovações após corrigir uma asserção do teste e acrescentar cobertura AR. Não houve uma execução única 84/84. Nove combinações e tradução também foram exercitadas por touch; zero solicitações externas nesse fluxo. [Rodadas e limites](validation.md).

| Composição atual | Desktop | Mobile |
|---|---|---|
| AR / tradução | [1440 px](../reports/visual/expansion/desktop-translation.png) | [390 px](../reports/visual/expansion/mobile-translation.png) |
| Tradução no contexto da cena | [Desktop](../reports/visual/expansion/desktop-translation-context.png) | [Mobile](../reports/visual/expansion/mobile-translation-context.png) |
| Hardware | [Desktop](../reports/visual/expansion/desktop-hardware.png) | [Mobile](../reports/visual/expansion/mobile-hardware.png) |
| Configurador 3×3 | [Desktop](../reports/visual/expansion/desktop-configurator.png) | [Mobile](../reports/visual/expansion/mobile-configurator.png) |
| Encerramento | [Desktop](../reports/visual/expansion/desktop-closing.png) | [Mobile](../reports/visual/expansion/mobile-closing.png) |

Capturas adicionais em 320 e 768 px e metadados em `reports/visual/expansion/capture.json`. Revisão interna desktop/mobile sem bloqueador visual. Teclado, reduced motion, falhas/retry e conteúdo sem JavaScript têm evidência funcional. Axe não encontrou violações automáticas, mas não certifica contraste sobre imagens, leitor de tela ou acessibilidade integral.

O perfil da expansão foi concluído após a liberação de permissões pelo usuário: **seis runs, exit 0**, no mesmo export. A coleta usa três cargas frias mobile emulado (390×844, CPU4×, 1,6 Mbps download/750 Kbps upload/150 ms) e três desktop (1440×900, sem throttle), sem testes concorrentes. O problema de clique no radio da automação foi corrigido para clicar seu label real; nenhuma alteração da aplicação ou rebuild foi necessária.

| Medida de laboratório da expansão | Mobile emulado | Desktop |
|---|---:|---:|
| LCP mediano | 948 ms | 108 ms |
| CLS máximo | 0 | 0 |
| Transferência inicial máxima | 217,08 KiB | 406,15 KiB |
| Primeira troca de frame até preview pronto, mediana | 398,8 ms | 76,5 ms |
| Trocas de frame aquecidas, mediana | 74,15 ms | 71,8 ms |

JS inicial, incluindo união dos scripts dinâmicos observados: **202,49 KiB gzip**, abaixo do budget de 250 KiB. A transferência inicial mobile também ficou abaixo de 1,25 MiB. [Protocolo, memória, AR, frames e limites](performance.md). Estes resultados são de laboratório local, não CWV/INP de campo, aparelho físico ou garantia de 60 FPS renderizados. O histórico da primeira fatia abaixo permanece separado.

Implementação e verificações locais concluídas dentro dos limites documentados. Publicação no destino aprovado Cloudflare Pages Free/GitHub Actions depende de acesso às contas e repositório; **nenhum deploy remoto realizado**. Preview local: http://127.0.0.1:4173.

---

## Histórico — primeira fatia aprovada

Preview local: **http://127.0.0.1:4173**. Export estático de produção; nenhuma publicação remota.

Fatia implementada: hero, Design com macro e quatro configurações. Manrope local, assinatura derivada da lente, layouts desktop/mobile e versão compacta para telas baixas. Adaptive usa aparência fixa identificada como simulação. O processo de assets preserva um master e edições controladas: [origem, hashes e limites](asset-proof.md).

## Revisão visual

| Composição | Desktop | Mobile |
|---|---|---|
| Hero | [1440×900](../reports/visual/desktop-hero.png) | [390×844](../reports/visual/mobile-hero.png) |
| Design / macro | [Viewport desktop](../reports/visual/desktop-design-viewport.png) | [Viewport mobile](../reports/visual/mobile-design-viewport.png) |
| Obsidian / Clear | [Desktop](../reports/visual/desktop-obsidian-clear.png) | [Mobile](../reports/visual/mobile-obsidian-clear.png) |
| Titanium / Sun | [Desktop](../reports/visual/desktop-titanium-sun.png) | [Mobile](../reports/visual/mobile-titanium-sun.png) |
| Sand / Adaptive | [Desktop](../reports/visual/desktop-sand-adaptive.png) | [Mobile](../reports/visual/mobile-sand-adaptive.png) |
| Obsidian / Sun | [Desktop](../reports/visual/desktop-obsidian-sun.png) | [Mobile](../reports/visual/mobile-obsidian-sun.png) |

[Tela baixa 360×640: preview e quatro opções juntos](../reports/visual/mobile-short-configurator-viewport.png). A revisão interna não encontrou bloqueador de composição ou continuidade; o aceite desta direção permanece humano.

## Evidência técnica

Validação funcional concluída nos três browsers. A rodada de 69 casos passou em 68 e encontrou perda de foco no WebKit; após o ajuste focal, teclado/radios passaram em 3/3 e layouts afetados em 6/6 no export final. As falhas iniciais de imagem, retry da mesma URL e requests concorrentes também estão corrigidas e revalidadas. [Resultados, rodadas e limites](validation.md).

Export final: `5ce6198e737248b69809cb7fece023b9540eca0c08e09919d33bd6f463a2822e`, 66 arquivos. Lint, TypeScript, build e smoke passaram. Os screenshots do configurador foram atualizados após o ajuste de foco nesse hash; hero e Design mantêm a composição já revisada, sem alteração visual. Registros de captura em `reports/visual/`.

O perfil foi executado em 12/10, exit 0, com **três cargas frias por cenário**: mobile emulado 390×844, DPR1, Chromium 156, CPU4×, 1,6 Mbps download/750 Kbps upload/150 ms; desktop 1440×900 sem throttle. Host Windows, Ryzen 7 5700X e aproximadamente 16 GiB de RAM. Não houve testes concorrentes durante a coleta.

| Medida de laboratório | Mobile | Desktop |
|---|---:|---:|
| LCP, mediana de três cargas frias | 876 ms | 100 ms |
| CLS máximo | 0 | 0 |
| Transferência inicial máxima | 211,62 KiB | 249,60 KiB |
| Primeira troca até preview pronto, mediana | 292,1 ms | 67,4 ms |
| Trocas aquecidas, mediana | 68,9 ms | 63,8 ms |

Budgets atendidos: JS inicial **173,96 KiB gzip**, ou **200,45 KiB** na união conservadora dos scripts iniciais com GSAP dinâmico, abaixo de 250 KiB; carga inicial mobile abaixo de 1,25 MiB; hero transferido aproximadamente 6,05/16,02 KiB mobile/desktop, abaixo de 250/450 KiB. O waterfall inclui carregamento dinâmico e a previsão de imagens lazy feita pelo browser.

Frames rAF tiveram mediana e p95 agrupados de 16,7 ms; o maior p95 por medição foi 16,8 ms. Isso atende à tolerância de 20/33,3 ms, mas **não comprova 60 FPS renderizados nem desempenho de GPU em celular**. A latência de preview inclui automação, request e decode; não é INP.

Memória após interações: soma de working sets observada até **333,4 MiB mobile emulado / 370,4 MiB desktop**, incluindo processos do browser. É snapshot, pode contar páginas compartilhadas mais de uma vez e não representa pico nem consumo em aparelho físico. Estimativa separada de três imagens residentes no DOM: **2,64 MiB / 10,88 MiB** de pixels decodificados; exclui buffers destacados e cópias do compositor. [Método, amostras, memória e limites completos](performance.md), [JSON bruto](performance/profile-2026-10-12.json).

Limites: aparelho físico e CWV/INP de campo não verificados; sem canvas, portanto abertura/GPU de canvas não aplicáveis; GitHub Actions e Cloudflare não executados remotamente. Acessibilidade automática sem violações detectadas não equivale a certificação completa; o relatório funcional declara os limites de contraste sobre imagens, WebKit e zoom simulado. A [auditoria](dependency-audit.md) registra zero entradas de produção e cinco entradas high de uma advisory transitiva no tooling de lint, com exceção restrita e documentada.

Aceite visual recebido em 12/10/2026: “Ficou legal. Pode continuar”. As evidências acima pertencem à primeira fatia aprovada. A continuação cobre nove variantes, experiências AR, motion e validação integrada, seguida de publicação quando os acessos estiverem disponíveis.
