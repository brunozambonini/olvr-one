# Perfil da primeira fatia

**Coleta concluída em 12/10/2026:** `npm run profile`, exit 0, seis execuções sobre o export final. Nenhum teste ou captura da equipe concorreu com a medição. Nenhum erro de página nas seis cargas. O browser do perfil foi fechado; o preview permaneceu ativo.

Artefato: `5ce6198e737248b69809cb7fece023b9540eca0c08e09919d33bd6f463a2822e` (SHA256 de caminhos e bytes de `out/`), revisão `uncommitted-local`, 66 arquivos. Não houve publicação. [Dados das seis execuções](profile-2026-10-12.json) e [cálculos derivados](analysis-2026-10-12.json) preservam valores brutos, recursos, frames e memória. A coleta começou às 12:02:54 UTC; os cálculos posteriores não executaram novas navegações.

Ambiente observado: Windows `10.0.19045` x64, Node 22.14.0, Chromium headless 156.0.8078.4, AMD Ryzen 7 5700X, 16 CPUs lógicas e aproximadamente 15,93 GiB de memória total reportada pelo sistema operacional. É laboratório local em desktop, sem aparelho físico.

## Resultados

| Métrica | Mobile emulado | Desktop |
|---|---:|---:|
| LCP frio, três execuções | 876 / 876 / 868 ms | 92 / 100 / 112 ms |
| Mediana de LCP | **876 ms** | **100 ms** |
| CLS máximo | **0** | **0** |
| Transferência inicial, máximo | **211,62 KiB** (216.699 B) | **249,60 KiB** (255.587 B) |
| Scripts observados na rede, com overhead HTTP | 164,75 KiB (168.700 B) | 164,75 KiB (168.700 B) |
| Hero servido, transferência / arquivo | 6.198 / 5.802 B, AVIF 640×360 | 16.409 / 16.012 B, AVIF 1440×810 |
| Primeira seleção → preview confirmado, mediana | **292,1 ms** | **67,4 ms** |
| Seleções aquecidas → preview confirmado, mediana de seis | **68,9 ms** | **63,8 ms** |
| Frames rAF nas seleções: mediana / p95 agrupados | 16,7 / 16,7 ms; 452 amostras | 16,7 / 16,7 ms; 411 amostras |
| Maior p95 de uma seleção | 16,8 ms | 16,8 ms |

Medianas de quantidades pares usam a média dos dois valores centrais; p95 usa nearest rank. A aritmética da mediana aquecida foi ajustada após a coleta, mantendo as mesmas amostras. LCP foi a imagem do hero em todas as execuções. Os budgets de carga foram atendidos: mobile ficou abaixo de 1,25 MiB e hero abaixo de 250/450 KiB. O configurador não transferiu a cópia `obsidian-clear` na carga inicial mobile; ela apareceu no desktop pelo comportamento de lazy loading próximo à viewport e está contabilizada.

O smoke mediu **178.139 B / 173,96 KiB gzip** para scripts presentes no HTML. O waterfall também registrou o chunk dinâmico de GSAP `0-w4ykwsjgv90.js`, com **27.119 B / 26,48 KiB gzip**. A união conservadora de URLs do HTML e scripts carregados dinamicamente soma **205.258 B / 200,45 KiB gzip**, abaixo de 250 KiB. Isso é diferente dos 168.700 B de transferência observada: o browser moderno não executa todo script candidato do HTML, e CDP contabiliza overhead HTTP. O chunk GSAP está incluído no perfil, sem supor que só as tags do HTML representem a abertura.

A primeira seleção mobile precisou buscar e decodificar `titanium-sun-640.webp` (9.000 B com headers); desktop buscou a versão 960 (15.831 B). Nas doze seleções aquecidas não houve novas solicitações de recursos. Os eventos de input reportados por Event Timing duraram 16–32 ms mobile e 16 ms desktop; a latência maior até o preview inclui carregamento, decode e automação. **Nenhuma dessas medidas é INP em campo.**

As amostras rAF ficaram dentro da tolerância de mediana ≤20 ms/p95 ≤33,3 ms. Isso descreve o agendamento observado durante as seleções e não comprova 60 FPS renderizados, custo de GPU ou estabilidade em um celular real. O resultado não exige otimização adicional nesta fatia pelos budgets definidos.

## Memória observada

Faixas de três snapshots por estado, em MiB. O Chromium dedicado teve quatro processos identificados por CDP e medidos com `Get-Process`; os snapshots incluem browser, renderer, GPU e utilitários. Cada navegação usou contexto novo, no mesmo processo browser. Não foi subtraído um baseline vazio.

| Medida | Mobile frio → após seleções | Desktop frio → após seleções |
|---|---:|---:|
| Fontes de imagens completas e únicas no DOM | 2 → 3 | 3 → 3 |
| Pixels decodificados estimados (dimensões codificadas ×4) | 1,76 → 2,64 MiB | 10,88 → 10,88 MiB |
| Heap JS usado, CDP | 3,31–3,34 → 5,73–5,75 MiB | 3,25–3,27 → 6,11–6,14 MiB |
| Soma de working sets, processos reais | 301,70–317,57 → 322,81–333,39 MiB | 340,85–341,83 → 369,63–370,44 MiB |
| Soma de private memory, processos reais | 255,84–259,56 → 262,73–266,96 MiB | 260,50–262,54 → 269,30–270,55 MiB |

A estimativa de imagens não representa a memória total da aplicação e exclui buffers destacados, cópias do compositor e alocações GPU. Working sets somados podem contar páginas compartilhadas duas vezes; private memory também não equivale a memória residente. São snapshots, não picos, e não demonstram ausência de vazamento em uso prolongado. Canvas não existe nesta fatia: first-open e memória de canvas não se aplicam. Nenhuma medição de hardware físico mobile ou CWV de visitantes foi realizada.

## Protocolo definido antes da coleta

- Export de produção servido por `npm run preview`, HTTP local `127.0.0.1:4173`; `npm run profile` confere o HTML contra `out/index.html` e associa o SHA256 de `reports/export.json`.
- Três navegações frias por cenário, cada uma com contexto novo, cache limpo/desabilitado e service workers bloqueados. A janela inicial termina após networkidle mais 1,5 segundo. CDP contabiliza bytes codificados da rede, incluindo cabeçalhos e scripts carregados dinamicamente nessa janela.
- Mobile: Chromium, 390×844, DPR1, touch/mobile emulado, CPU 4×, rede 1,6 Mbps down/750 Kbps up/150 ms. Desktop: 1440×900, DPR1, CPU/rede sem throttling.
- LCP observado e CLS por janela de sessão, antes de scroll/input. São medições locais; não comprovam p75 em campo, INP ou desempenho de aparelho físico.
- Primeira interação: Titanium / Sun ainda não selecionada, com cache permitido a partir desse momento. Depois de carregar Sand / Adaptive, repetir Titanium e Sand para amostras aquecidas. Registrar recursos por interação para distinguir reaproveitamento de cache de nova transferência.
- `previewReadyMs` mede da solicitação automatizada ao estado de preview confirmado após decode. Inclui automação/rede; não é INP. Event Timing aparece separado quando o browser reporta eventos acima do limiar de 16 ms.
- rAF durante a seleção e 700 ms seguintes fornece amostras de agendamento. Alvo 16,7 ms; tolerância mediana ≤20 ms e p95 ≤33,3 ms. Essa tolerância e rAF não comprovam 60 FPS renderizados.
- Estimativa de pixels das fontes únicas completas no DOM: largura codificada × altura codificada ×4. Separada de heap JavaScript e snapshots reais de working set/private memory dos processos deste Chromium, identificados por CDP. Soma de working sets pode contar páginas compartilhadas duas vezes; snapshots não são pico de uso. Buffers destacados/compositor/GPU não são inferidos da estimativa.
- Não há canvas: first-open e memória de canvas não se aplicam. Não há validação em dispositivo físico nesta sessão.

Budgets: scripts iniciais ≤250 KiB gzip; transferência inicial mobile ≤1,25 MiB; hero ≤250 KiB mobile/450 KiB desktop. O smoke calcula gzip dos scripts no HTML; o perfil também contabiliza a transferência dos scripts dinâmicos, com overhead HTTP, separadamente.

O script salva incrementalmente `reports/performance/profile.json`. Screenshots desta coleta, feitas após as interações medidas: [mobile viewport](../../reports/performance/mobile-viewport.png), [mobile completo](../../reports/performance/mobile-full.png), [mobile seleção](../../reports/performance/mobile-selection.png), [desktop viewport](../../reports/performance/desktop-viewport.png), [desktop completo](../../reports/performance/desktop-full.png) e [desktop seleção](../../reports/performance/desktop-selection.png). As páginas completas mostram Sand / Adaptive, a última seleção da sequência. Screenshots e relatórios em `reports/` são evidências locais; os JSON vinculados no início foram preservados em `docs/performance/` para acompanhar o resumo.
