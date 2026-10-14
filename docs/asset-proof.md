# OLVR ONE — prova e proveniência de assets

## Estudo de inspeção 2,5D — 14/10/2026

A inspeção usa três renders discretos de **Obsidian / Clear**: o hero original como três quartos, mais frontal e perfil direito gerados com a ferramenta integrada imagegen. Os dois novos renders usam o hero como referência visual; o perfil foi também usado como segunda referência do frontal. A ferramenta não deriva uma malha 3D, portanto não há geometria comum verificada, rotação livre ou vistas dos outros oito acabamentos. A UI identifica isso como estudo conceitual. Uma avaliação visual conferiu armação grafite, câmera única à direita, dobradiça e linguagem de luz; pequenas diferenças de forma entre ângulos ainda são possíveis.

| Master | Origem preservada | SHA-256 |
|---|---|---|
| `inspection-front.png` | `C:/Users/zambo/.codex/generated_images/01a13a8c-82ce-7263-889a-a825d60b47a3/exec-eaba2356-937b-4787-8734-2afcf933fb30.png` | `f6461ad788d63f09d353c4b434be44bf02395328c329d62a908ac7f61119149c` |
| `inspection-side.png` | `C:/Users/zambo/.codex/generated_images/01a13a8c-82ce-7263-889a-a825d60b47a3/exec-da74aa20-3df9-4675-9cd7-1cf4594dd536.png` | `e5da9b5abdbc4fd2971e395dc1723a24244a67bbe96ac4c4924b52750c48325d` |

Prompt do perfil: “Create a precise additional product photograph of the EXACT OLVR ONE smart glasses from the reference image, viewed strictly from the RIGHT SIDE PROFILE (90 degrees from the front). The reference is the design authority: matte charcoal obsidian frame, rectangular thick acetate temple with gentle taper and curved black earpiece, one discrete round black camera at the front outer corner, vertical hinge seam directly behind it, clear lenses, softly squared front frame silhouette. Preserve proportions, materials, and studio lighting. Product centered full-length in a 16:9 landscape composition on the same warm dark graphite studio tabletop/background. Keep the entire glasses visible, no cropping, no text, no logos, no extra parts, no AR overlay, no transparent background. This is a concept rendering of a previously unseen side, so do not add invented sensors or buttons.”

Prompt frontal: “Create a precise additional product photograph of the EXACT OLVR ONE smart glasses from the two reference images, viewed STRAIGHT-ON FROM THE FRONT, symmetrical camera axis at eye height. Reference images define one product: softly squared matte charcoal obsidian front frame with gently sculpted top brow and bridge, two clear lenses, one discreet black circular camera on the viewer-right outer corner and tiny microphone hole above-left, vertical hinge seam directly behind camera, thick rectangular temples receding symmetrically behind front. Preserve proportions and relationships, no second camera. Product centered full-width in same 16:9 warm dark graphite studio tabletop/background and soft stripbox lighting. Entire glasses visible, no cropping, no text, logos, extra hardware, AR overlays. Premium realistic concept render.”

## Expansão aprovada — 12/10/2026

Após o aceite humano da primeira fatia (“Ficou legal. Pode continuar”), foram adicionadas as cinco combinações restantes: `obsidian-adaptive`, `titanium-clear`, `titanium-adaptive`, `sand-clear` e `sand-sun`. Cada PNG em `assets/masters/` tem 1672×941 px e foi gerado por uma chamada integrada imagegen separada, referenciando diretamente `hero.png`. Prompts completos, outputs originais, dimensões e SHA-256 estão em [generation-record.json](../assets/masters/generation-record.json). Os nove produtos compartilham a origem aprovada; Adaptive continua sendo aparência fixa simulada.

Todos os novos outputs foram inspecionados visualmente. Enquadramento, ponte, câmera e dobradiça permanecem coerentes; Clear, Sun e Adaptive são distinguíveis. O root também revisou os seis masters novos e não encontrou bloqueador visual; observou leve diferença de calor em Sand/Sun, aceitável para integração. A edição generativa não garante correspondência exata de pixels ou regeneração determinística.

`scene-street.png` (1672×941) foi gerada pela mesma ferramenta, usando `docs/visual-study/street-concept.png` como direção visual. É uma cena fictícia, sem identidade comercial, HUD ou texto legível incorporado; o menu é intencionalmente branco. O café fica à direita: porta aproximadamente em x80%/y55%, menu em x70%/y49%. Recomendação de integração: `object-position: 75% 50%` no mobile, mantendo porta/menu, e composição completa no desktop. O recorte final e a legibilidade dos overlays HTML precisam de verificação no browser integrado. A fotografia não representa visão de sensores ou localização real.

Manifest atualizado para os 12 IDs (hero, macro, nove combinações e cena). `npm run assets:build` executado no Windows/Node local: **exit 0**, **74 AVIF/WebP**, total **1763 KiB** no pack inteiro, não transferência inicial. O script verificou dimensões dos derivados e ausência de upscale. Relatório técnico: `.cache/image-report.json`; larguras 640/960/1440 e hero adicional1600. Nenhum build de aplicação ou teste de browser foi executado por esta frente de assets.

### Social preview

O coordenador autorizou um derivado determinístico do hero: master `assets/masters/social-preview.png` e arquivo público versionável `public/social-preview.jpg`, **1200×630**, **41.976 bytes**, JPEG progressivo. O produto completo e seus detalhes permanecem visíveis no recorte, verificado pela imagem final. Não adiciona AVIF/WebP redundantes ao pack e não altera o pipeline compartilhado. Reprodução com Sharp fixado pelo lockfile:

```js
await sharp('assets/masters/hero.png')
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .png().toFile('assets/masters/social-preview.png');
await sharp('assets/masters/social-preview.png')
  .jpeg({ quality: 88, mozjpeg: true }).toFile('public/social-preview.jpg');
```

Todos os novos bitmaps mantêm a origem gerada documentada abaixo: nenhum banco de fotografias, modelo 3D ou licença externa foi adicionado. O macro de hardware existente é reutilizado. Os registros seguintes descrevem a primeira fatia histórica, cuja restrição de expansão foi superada pelo aceite humano acima.

Registro de 09/10/2026. Escopo implementado: hero, Design com um macro e quatro combinações. O pack completo, AR e canvas permanecem fora desta fatia. Imagens geradas representam um design conceitual; não comprovam funcionalidade física do hardware.

## Origem única e processo preservado

O master `assets/masters/hero.png` é uma cópia idêntica do estudo `docs/visual-study/product-concept.png`: ambos têm SHA-256 `27318d498b5d8e4ddd2e5a54085cfef76000a69e66a1971d9e87e1ed79521a5f`. A imagem inicial foi mantida e adotada para a fatia após a revisão visual preliminar registrada pelo coordenador. Nenhuma nova geração foi feita nesta retomada.

Origem: ferramenta integrada imagegen, imagem original gerada em 08/10/2026. Output preservado: `local-imagegen-archive/01a11dea-c57b-7b70-be04-283fd30317dc\exec-3bb016bb-0964-43a9-8fbe-f69bc7d7401c.png`. Prompt completo em [proveniência do estudo](visual-study/provenance.md). Não há fotografia, marca ou modelo 3D externo incorporado ao produto.

As três variantes e o macro foram gerados como **edições referenciadas diretamente ao mesmo master**, não como gerações independentes. Os prompts finais, a referência e os paths dos outputs estão preservados em [generation-record.json](../assets/masters/generation-record.json). Os pedidos restringem alterações aos materiais/lentes ou à aproximação macro, preservando ponte, lente, câmera, dobradiça e iluminação. Isso documenta a intenção e o método, mas não garante igualdade geométrica ou registro de pixels exatos nos resultados generativos.

| Arquivo master | Finalidade / edição | SHA-256 |
|---|---|---|
| `hero.png` | Obsidian / Clear; hero completo | `27318d498b5d8e4ddd2e5a54085cfef76000a69e66a1971d9e87e1ed79521a5f` |
| `titanium-sun.png` | Material cinza titânio e lentes smoke | `9a772b39a47bbc0e85cfc0ca9f7942b38be8bf7cbf539ee4f0778001a24612d9` |
| `sand-adaptive.png` | Material bege fosco e lente taupe fixa; simulação | `1b55f704b6c1c1e92fea604ac83b404f338c75f1738c559c93b632281a92bd0b` |
| `obsidian-sun.png` | Armação grafite; lente smoke | `ab686bfe65202aba6f74a7f8ff2830f8939a2014c721a2a15d3a3cffa3727d88` |
| `design-macro.png` | Edição ampliada do canto frontal/dobradiça | `c32862e558c601796ded09ad39bf6abe6cc86aaef0e9e5c35339fa66e80d9f42` |

O processo é rastreável e pode ser repetido com os arquivos e prompts preservados, **sem promessa de regeneração bit a bit**. O original deve continuar preservado; toda edição futura parte dele, registra novo output/hash e passa pela mesma inspeção visual. Trocar o material por filtro CSS que também tinja reflexos e fundo não faz parte do método.

## Derivação e uso na UI

`npm run assets:build` lê [assets/images.json](../assets/images.json) e gera AVIF/WebP com sharp em larguras 640, 960 e 1440; hero inclui 1600. O pipeline e seus parâmetros estão versionados em [build-images.mjs](../scripts/build-images.mjs). Masters PNG ficam fora do export público.

- Hero usa `picture`, AVIF com fallback WebP, dimensões reservadas e prioridade alta. Reenquadramento responsivo por CSS; imagem visível desde o HTML inicial.
- Design usa o macro em recorte editorial amplo no desktop e mais próximo no mobile, com carregamento lazy e legenda de hardware conceitual.
- Preview usa WebP e somente as quatro combinações existentes. Não faz preload do pack. A opção solicitada muda imediatamente; a imagem e a identificação exibidas só mudam após decode da última solicitação. Falha mantém a imagem anterior identificada, com retry/reset. Adaptive é fixo e explicitamente simulado.
- Hero e preview Obsidian/Clear derivam do mesmo master, em URLs diferentes; o preview é lazy. O waterfall do perfil integrado deve confirmar o custo real em cada viewport.

Revisão preliminar do root: os cinco masters foram visualmente inspecionados e liberados para integrar, sem bloqueador aparente de silhueta, ponte, câmera e dobradiça; não equivale ao aceite humano final. Nesta retomada, frontend inspecionou diretamente hero e macro. Continuidade na troca e cortes finais dependem da revisão das screenshots/browser do export integrado.

## Fonte e direitos registrados

**Manrope Variable**, peso 200–800, subset latin, arquivo `manrope-latin-wght-normal.woff2` do pacote fixado `@fontsource-variable/manrope@5.3.0`. Metadata do pacote informa upstream Google Fonts, versão `v20`, e autoria `Copyright 2019 The Manrope Project Authors (https://github.com/sharanda/manrope)`.

Licença: SIL Open Font License 1.1. Texto integral, incluindo autoria, preservado em [Manrope-OFL-1.1.txt](../content/licenses/Manrope-OFL-1.1.txt). A licença permite incorporação e redistribuição junto do software mantendo o aviso e a licença; não permite vender a fonte isoladamente. Não houve alteração do binário. SHA-256 observado: `a30ddcd349703aff7464c34bef3fffdff405ee50c113440d7c8693c02d210972`. `next/font/local` entrega a fonte pelo próprio site, sem requisição ao Google Fonts.

Os bitmaps são outputs gerados para o projeto pela ferramenta integrada, com autoria/origem e edições acima; não são assets baixados sob licença de um terceiro nem são apresentados como CC0. Não há modelo externo ou atribuição de banco de imagens. O registro não constitui garantia de exclusividade, originalidade jurídica absoluta ou funcionamento real do objeto.

## Limites e evidências

- Leitura de licenças/metadata local, hashes SHA-256 e comparação entre cópia/master executados em 09/10/2026.
- `npm run lint` e `npm run typecheck`: exit 0 após materializar a fatia. Build, browser e perfil são registros separados do platform/validação integrada; não se inferem da leitura do código.
- Fonte local e edições controladas estão implementadas; aparelho físico e CWV de campo não foram medidos.
- Investigação 3D: conforme resumo da sessão anterior encaminhado pelo coordenador em 09/10, o teto de 15 minutos foi encerrado; nenhum Blender/modelo local foi encontrado. Um candidato da Poly Haven, identificado naquela investigação como CC0, tinha armação vintage arredondada inadequada à silhueta aprovada e foi descartado. O resumo recebido não contém URL específica; esta retomada não refez a pesquisa nem verificou a licença daquele item. Nenhum asset 3D externo foi incorporado ou redistribuído; nenhum modelo adotado tem licença pendente. Baseline decidido: master e edições controladas. Canvas continua opcional em fase futura.
- O aceite da direção final desta fatia é humano e permanece pendente antes de completar nove combinações e experiências.
