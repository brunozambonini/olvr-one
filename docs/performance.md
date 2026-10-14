# Perfil da expansão — concluído

**13/10/2026: seis runs completos, `npm run profile`, exit 0**, executado pelo agente principal na sessão 36177, em janela exclusiva sem testes ou browsers da equipe concorrentes. Coleta iniciada às 10:48:10 UTC. Export `0c772ceba1713f36ecb573b4ae9c869412edf09a496babca70694691eb2c3e79`, 103 arquivos, revisão `uncommitted-local`. O script confirmou HTML servido idêntico a `out/index.html`. Nenhum erro de página nos seis runs. Sem rebuild ou publicação.

[Dados brutos completos](performance/expansion-profile-2026-10-13.json) · [Cálculos derivados](performance/expansion-analysis-2026-10-13.json)

| Métrica | Mobile emulado | Desktop |
|---|---:|---:|
| LCP frio, três runs | 988 / 948 / 948 ms | 100 / 108 / 132 ms |
| LCP mediano | **948 ms** | **108 ms** |
| CLS máximo | **0** | **0** |
| Transferência inicial máxima | **217,08 KiB** (222.293 B) | **406,15 KiB** (415.900 B) |
| Primeira armação → preview, mediana | 398,8 ms | 76,5 ms |
| Primeira lente → preview, mediana | 382,7 ms | 62,1 ms |
| Armações aquecidas, mediana | 74,15 ms | 71,8 ms |
| Lentes aquecidas, mediana | 63,7 ms | 77,3 ms |
| rAF durante interações, mediana / p95 agrupados | 16,7 / 16,7 ms | 16,7 / 16,8 ms |
| Maior p95 individual de interação | 16,8 ms | 16,8 ms |

JavaScript inicial: tags HTML **180.234 B gzip**; união com scripts dinâmicos observados, incluindo GSAP, **207.353 B / 202,49 KiB gzip**, abaixo de 250 KiB. Transferência inicial mobile abaixo de 1,25 MiB. Scripts efetivamente transferidos somam 170.795 B incluindo overhead HTTP por run; essa grandeza difere do gzip de todos os candidatos do HTML. A tolerância rAF de mediana ≤20 ms/p95 ≤33,3 ms foi atendida; isso não prova FPS renderizado.

| AR simulada — resposta mediana primeira / aquecida | Mobile | Desktop |
|---|---:|---:|
| Navigation | 267,4 / 258,1 ms | 230,6 / 228,7 ms |
| Vision | 257,2 / 245,0 ms | 229,9 / 229,5 ms |
| Translation | 263,0 / 262,2 ms | 230,9 / 228,6 ms |

## Memória e limites

Faixas observadas em MiB, frio → após interações:

| Medida | Mobile | Desktop |
|---|---:|---:|
| Heap JS usado | 3,40–3,43 → 6,44–6,55 | 3,34–3,35 → 6,23–6,23 |
| Pixels DOM estimados | 1,76 → 3,52 | 15,33 → 17,30 |
| Working set somado | 290,78–312,15 → 332,32–346,12 | 331,95–332,37 → 401,89–402,12 |

Quatro processos Chromium identificados por CDP e medidos com Windows Get-Process; detalhes e private memory estão nos JSON. São snapshots, não picos. Working sets podem contar páginas compartilhadas duas vezes. Estimativa de pixels = dimensões codificadas ×4 e exclui buffers destacados, compositor e GPU; não equivale à memória total. Não há canvas; abertura e memória de canvas não se aplicam. A coleta não demonstra ausência de vazamentos em uso prolongado.

Windows 10.0.19045 x64, Node 22.14.0, Chromium 156.0.8078.4, Ryzen 7 5700X, 16 CPUs lógicas. Três contextos frios por cenário, service workers bloqueados, cache limpo/desabilitado até primeira interação, janela inicial networkidle +1,5 s. Mobile 390×844, DPR1, CPU 4×, rede 1,6 Mbps down/750 Kbps up/150 ms. Desktop 1440×900, DPR1, sem throttling. Seleções aquecidas permitem cache. Medianas pares usam média central; p95 usa nearest rank.

A latência inclui automação, rede/decode e resposta simulada; não é INP. Nenhum aparelho físico, CDN remoto ou CWV de visitantes foi medido. rAF registra agendamento e não comprova 60 FPS/GPU. A memória usa o mesmo processo browser entre contextos e não subtrai baseline vazio.

## Evidências e histórico

Capturas desta coleta: [mobile](../reports/performance/mobile-viewport.png), [mobile completo](../reports/performance/mobile-full.png), [desktop](../reports/performance/desktop-viewport.png), [desktop completo](../reports/performance/desktop-full.png). São capturas auxiliares do perfil, não substituem a revisão visual.

A tentativa anterior com 2 runs foi preservada em [parcial de 12/10](performance/expansion-interrupted-2026-10-12.json). Em 13/10, o agente especialista encontrou `spawn EPERM`; a execução foi transferida ao runtime autorizado do principal. Outra tentativa terminou após três runs mobile por interceptação de clique no radio Sun; [parcial preservado](performance/expansion-partial-2026-10-13.json). O script de medição passou a clicar o label real do radio, sem force e sem alterar app/export. `node --check scripts/profile.mjs` passou. A coleta completa atual substitui esses parciais e não mistura amostras. O browser é fechado pelo finally do script.

[Relatório histórico da primeira fatia](performance/first-slice-2026-10-12.md), [raw original](performance/profile-2026-10-12.json) e [cálculos originais](performance/analysis-2026-10-12.json) referem-se exclusivamente ao hash 5ce619…a2822e, 66 arquivos. Seus links de capturas são históricos e podem apontar a arquivos substituídos; JSON preservados são estáveis.

Hero observado no waterfall: AVIF 640 mobile, 6.198 B transferidos; AVIF 1440 desktop, 16.409 B transferidos. Ambos abaixo dos budgets de 250 KiB mobile e 450 KiB desktop, mesmo incluindo overhead HTTP.
