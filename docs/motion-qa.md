# OLVR ONE — motion polish

Em 13/10/2026, a troca **World ↔ OLVR** ganhou uma revelação de lente de 420 ms, seguida da entrada do HUD. O configurador ganhou um reflexo discreto após a nova imagem ser decodificada e exibida. Ambos respeitam `prefers-reduced-motion`; não há pacote novo, scroll lock ou canvas.

O export estático atual tem SHA-256 `0d566dfcfa97b384d88a0a220264ed9086a220d0f1fb28670011de80bb790a70` (`reports/export.json`), 103 arquivos e 180.417 bytes de JavaScript gzip nas tags iniciais. `npm run build`, `npm run smoke` e ESLint focal dos componentes passaram. O preview em `http://127.0.0.1:4173` serviu o HTML do export byte a byte.

A regressão dirigida `interaction.spec.ts` passou **36/36** em Chromium, Firefox e WebKit: nove configurações, imagem real coerente com legenda/seleção, teclado, corridas de decode, falha, retry e reset. O novo `motion-qa.spec.ts` passou **12/12** nos mesmos engines, em 1440 e 390 px, normal/reduced motion: alternância rápida, botão “+”, duração CSS, ausência de efeito com movimento reduzido e `currentSrc` decodificado após Titanium, Sand e Reset. `experience.spec.ts` passou **15/15** no export anterior desta rodada; a correção posterior alterou apenas as chaves React no Configurator. Uma colisão de chaves entre imagem e reflexo causou legenda nova com imagem antiga; foi corrigida e revalidada pelos 36+12 casos.

| Estado | Desktop | Mobile |
|---|---|---|
| Experiência OLVR | [Captura](../reports/visual/motion/desktop-experience.png) | [Captura](../reports/visual/motion/mobile-experience.png) |
| Reflexo em curso | [Captura](../reports/visual/motion/desktop-shine.png) | [Captura](../reports/visual/motion/mobile-shine.png) |
| Configuração final Sand / Clear | [Captura](../reports/visual/motion/desktop-config-final.png) | [Captura](../reports/visual/motion/mobile-config-final.png) |

As capturas da experiência são de seção inteira; a imagem mobile pode mostrar o skip link por uma peculiaridade dessa captura, embora o controle esteja oculto fora do viewport até receber foco na interação normal. O perfil de [performance anterior](performance.md) pertence ao export anterior, não mede estas animações. Não foram medidos FPS/GPU, aparelho físico ou CWV de campo nesta mudança. O acréscimo de JavaScript inicial foi de 126 bytes gzip em relação ao export imediatamente anterior (180.291 → 180.417 bytes); isso não substitui um perfil de performance completo.
