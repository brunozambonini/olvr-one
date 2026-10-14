# OLVR ONE — proposta para aprovação

Direção aprovada em 09/10/2026 com ajustes. **Fundação e primeira fatia visual implementadas e verificadas localmente em 12/10. Aceite visual recebido em 12/10: “Ficou legal. Pode continuar”. Expansão em execução.** Consulte o [material de aceite com screenshots, testes e perfil](visual-acceptance.md).

Abra a [prancha visual desktop/mobile](visual-direction.html) para julgar a direção. Ela é um estudo de composição, não a aplicação nem uma demonstração de performance.

Os dois conceitos iniciais foram inspecionados visualmente; links, imagens e estrutura da prancha passaram por checagem estática. Essa prancha inicial não foi renderizada pelo browser da sessão, que recusou `file://`. Na fase autorizada, a aplicação foi servida legitimamente por HTTP local e validada em browser com screenshots próprias. [Proveniência e limites do estudo inicial](visual-study/provenance.md), [registro da verificação estática](visual-study/validation.json).

Atualização de execução: a aplicação exportada já está disponível em `http://127.0.0.1:4173`, com hero, Design/macro e quatro configurações reais. Build e smoke locais passaram; capturas desktop/mobile e revisão visual do export foram realizadas. O [registro de coordenação](../work/squad-state.md) distingue as evidências atuais do discovery histórico. Nenhuma publicação ocorreu.

## Recomendação

Criar uma experiência editorial de hardware premium: **objeto real, informação discreta**. Óculos com fotografia de produto convincente, grafite #101210, tipografia ampla em ivory #F2F0E8, luz lateral controlada e acento vegetal contido #D9EC8B. A interface espacial aparece apenas quando entramos no ponto de vista de quem usa o produto. O contraste entre esses dois mundos conduz a narrativa.

Manter **OLVR ONE** e **“Intelligence, in sight.”**. Site em inglês para o público internacional de freelas; planejamento em português. A identidade deve sobreviver sem animações e sem WebGL.

Tipografia final: Manrope Variable hospedada localmente, com licença registrada junto ao arquivo. A assinatura visual deriva do recorte da lente/HUD, repetida com contenção em enquadramento, marcadores e controles; não depende de brilho ou neon.

O núcleo da entrega é: produto visualmente forte, narrativa responsiva, uma cena AR interativa e um configurador de nove combinações. Não haverá backend, IA real, câmera, microfone, localização, autenticação, banco, checkout ou captação de dados.

## Experiência proposta

| Ato | Conteúdo e interação | Desktop | Mobile |
|---|---|---|---|
| 1. Presença | Produto protagonista e tagline; CTA “Explore OLVR” | Composição ampla; revelação breve da luz, sem esconder o conteúdo inicial | Recorte próprio e texto legível; produto visível de imediato |
| 2. Objeto | “Technology that looks like glasses.”; materiais, encaixe e detalhes plausíveis | Macros editoriais, aproximação controlada e poucos pontos de detalhe | Sequência vertical de detalhes; nenhuma dependência de hover |
| 3. Perspectiva | “Information where you need it.”; mundo real ↔ OLVR; modos Navigation, Vision e Translation | Uma cena cotidiana coerente, HUD contido e controles persistentes | Cena reenquadrada; controles touch explícitos e texto acessível junto à imagem |
| 4. Engenharia | Câmera, áudio, microfones e display apresentados sem especificações inventadas | Macros do mesmo produto com hotspots opcionais | Detalhes e legendas por toque; leitura linear disponível |
| 5. Escolha | “Make it yours.”; Obsidian / Titanium / Sand × Clear / Sun / Adaptive | Produto e controles lado a lado | Produto antes de grupos de opções amplos e operáveis por teclado/touch |
| 6. Retorno | “See what’s next.”; produto completo e convite a rever a experiência | Composição de encerramento forte, sem bloco SaaS genérico | Fecho compacto, sem formulário ou compra fictícia |

Os nove capítulos identificados na prancha/brief se organizam nesses seis atos: Spatial, AI Vision, Translation e Try OLVR são os quatro momentos do ato Perspectiva. Eles compartilham a mesma cena e linguagem. A alternância **World / OLVR será um controle explícito e acessível**; um “Try OLVR” ampliado com passeio 3D fica fora da v1. A distância deve corresponder ao café próximo visível (sem indicação incoerente de 120 m); o menu será conteúdo legível controlado, posicionado para o recorte mobile. Respostas são roteiros locais, sem espera artificial longa; uma indicação discreta identifica a simulação. O rodapé identifica o produto como conceito independente, indisponível para compra. A experiência AR completa permanece depois do aceite desta primeira fatia.

Os quatro momentos principais de motion são: luz de abertura, transição para perspectiva, resposta contextual do HUD e mudança de material no configurador. Scroll nativo, sem travamento de wheel, carrossel horizontal obrigatório ou efeito ornamental contínuo. Reduced motion elimina parallax, scrub e movimento automático; todos os conteúdos e controles permanecem.

## Assets e decisão sobre 3D

O maior risco do projeto é **coerência do produto**, não a biblioteca de animação. Hero, macros e configurações precisam parecer o mesmo objeto, com geometria, câmera, luz e acabamentos consistentes. A imagem da prancha é um estudo conceitual, não um asset de produção aprovado.

Validar **primeiro hero + Design em desktop/mobile, um macro e quatro configurações representativas**: Obsidian/Clear, Titanium/Sun, Sand/Adaptive e Obsidian/Sun. Elas cobrem os três acabamentos e três lentes, sem simular que as outras cinco já existem. Preview e opções devem permanecer próximos também em telas baixas. Esse gate confirma o objeto e sua qualidade visual cedo. Só depois do aceite completar pack/nove configurações/social preview e experiências.

Processo de produção: um master preservado, com origem/hash e parâmetros/prompts registrados, seguido de renders offline de um mesmo modelo ou edições controladas sempre referenciadas ao mesmo original. Validar ponte, dobradiças, espessura, geometria, câmera, iluminação e reflexos; não gerar cada variante de forma independente. A primeira escolha operacional é edição controlada do master aprovado, que permite rastrear/repetir o processo, mas não promete regeneração bit a bit. Hero, Design e futuro Hardware terão enquadramentos e propósitos distintos; Hardware será apresentado como design conceitual, sem afirmar funcionalidades físicas comprovadas.

Investigar modelos coerentes **nesta fase, com teto de 15 minutos de pesquisa**, registrando origem, licença e motivo de adoção/descarte. Master 3D para produzir imagens offline é uma opção separada de canvas interativo no browser. A pesquisa não deve atrasar a prova por imagens. Não usar filtro CSS que tinja simultaneamente armação, lentes e reflexos incorretamente.

O renderer inicial do configurador usa imagens ou camadas de materiais consistentes. **3D é um enhancement condicionado**, restrito a um canvas lazy no configurador. Three.js/R3F só entram se um spike demonstrar modelo de boa qualidade, licença específica compatível com uso e redistribuição no repositório público, nove variantes corretas, ganho visual e custo aceitável. Nenhum modelo externo foi selecionado ou teve licença aprovada nesta fase.

O poster deve aparecer imediatamente; renderer e seleção são separados para preservar controles e descrição se WebGL falhar. Engine/modelo não participam da carga inicial. A cena para fora da viewport/aba, limita DPR e usa render sob demanda. Vista explodida fica fora da primeira entrega; macros bem resolvidas cobrem Hardware.

Cada asset importante terá origem/autor ou geração, licença e versão, atribuição, permissões de redistribuição e alterações registradas. Imagens externas só entram no repositório após verificação do asset específico; “gratuito” sozinho não comprova licença.

## Arquitetura e stack

**Next.js App Router + React + TypeScript, export estático, CSS Modules/custom properties e GSAP/ScrollTrigger.** O HTML de conteúdo é gerado no build; somente demonstração, configurador, menu e wrappers de motion usam código cliente. Sem Redux, CMS, biblioteca de fetch ou camada de serviços.

| Área | Responsabilidade |
|---|---|
| `app` | Composição, HTML semântico, metadata e export |
| `sections` | Hero, Design, Hardware e encerramento; conteúdo estático com wrappers pequenos |
| `experience` | Cenários AR, visualização world/OLVR, roteiro e transições locais |
| `configurator` | Seleção, radio groups, descrição e `ProductPreview` intercambiável |
| `content` / assets | Catálogo tipado, textos, manifest de imagens e procedência |
| `styles` | Tokens globais e estilos próprios por componente |

Contrato final do configurador: `frame = obsidian | titanium | sand`, `lens = clear | sun | adaptive`; nove chaves `frame:lens`, cada uma com preview correspondente, dimensões e alt. Na fatia, somente as quatro combinações reais ficam selecionáveis. **Seleção solicitada e preview exibido são estados distintos**: feedback do controle é imediato, mas a confirmação do preview só muda após decode da última solicitação; resultado antigo é descartado por identidade/versão de request. Loading preserva e identifica a imagem anterior; erro permite retry e reset, sem confirmar visual antigo como nova seleção. Adaptive é **aparência fixa identificada como simulação**, sem transição de tonalidade. Estado local, sem persistência na v1.

Contrato AR: `scenario = navigation | vision | translation`, `view = world | olvr`. Análise e resposta determinísticas, canceladas corretamente ao trocar de modo; nenhum pedido de permissão do browser. Respostas solicitadas podem usar `aria-live`, sem anunciar frames decorativos.

Usar stable atual compatível de Next 16/React 19; **TypeScript 6 é a exceção proposta ao latest 7**, pois o suporte declarado do typescript-eslint ainda é `<6.1.0`. A combinação final será instalada e validada na fundação antes do lockfile, sem forçar peer dependencies. [Suporte do typescript-eslint](https://typescript-eslint.io/users/dependency-versions/). Patches consultados estão na nota técnica ao final; não exigem uma escolha separada do usuário.

CSS Modules oferece controle visual sem precisar acrescentar Tailwind. GSAP coordena a narrativa; CSS trata feedback simples. Não adicionar Motion ou Lenis em paralelo sem necessidade demonstrada. A [licença padrão GSAP](https://gsap.com/community/standard-license/) permite esse uso comercial sem cobrança; preservar os avisos da biblioteca.

O [export estático do Next](https://nextjs.org/docs/app/guides/static-exports) gera `out/`; não usamos Server Actions, ISR, APIs dependentes de request ou otimizador padrão de imagens em runtime. Pipeline de build transforma masters e manifest em AVIF/WebP responsivos, com dimensões reservadas e entrega pelo mesmo CDN. Efeitos GSAP terão cleanup, adaptação de viewport e reduced motion; conteúdo permanece visível antes da animação. Node 22.14.0 e npm 10.9.2 locais atendem aos engines consultados; resultados reais de instalação/build serão registrados na entrega da fatia.

## Hospedagem e publicação

**Cloudflare Pages Free**, com o export `out/` e domínio `*.pages.dev`. A plataforma tem guia oficial para [Next estático](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) e entrega por CDN; [requests de assets estáticos são gratuitos e ilimitados](https://developers.cloudflare.com/pages/functions/pricing/). Limites relevantes: 25 MiB por arquivo e 20 mil arquivos no Free; o build nativo tem 500 builds/mês, um simultâneo e timeout de 20 minutos. Nosso fluxo fará o build no GitHub Actions. [Limites oficiais](https://developers.cloudflare.com/pages/platform/limits/).

| Alternativa avaliada | Decisão |
|---|---|
| Vercel Hobby | Não assumir elegibilidade gratuita: o plano limita uso pessoal/não comercial, e a política comercial inclui divulgação de serviços/ganho financeiro. Inadequado como premissa para captação de freelas. [Hobby](https://vercel.com/docs/plans/hobby), [fair use](https://vercel.com/docs/limits/fair-use-guidelines) |
| GitHub Pages | Alternativa possível para demo fictícia sem transações; limite de site 1 GB, banda flexível 100 GB/mês e cuidados com `basePath`. Menor folga e termos proíbem operação de negócios/ecommerce/SaaS comerciais. [Limites](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) |

O platform não identificou restrição de Pages Free a uso pessoal nos [termos gerais](https://www.cloudflare.com/terms/) e [termos da Developer Platform](https://www.cloudflare.com/service-specific-terms-developer-platform/) consultados. Isso é análise das condições publicadas, não confirmação de uma conta específica ou garantia perpétua do plano. Manter somente Pages estático Free, sem Functions, R2, Images ou serviços por consumo. Domínio próprio futuro tem custo de registro separado; `pages.dev` evita essa despesa inicial.

GitHub Actions em runner Ubuntu padrão de repositório público executará `npm ci` → lint → typecheck → build → testes/smoke do export. O mesmo `out/` validado será enviado por **Direct Upload/Wrangler**, somente após checks na branch confiável e autorização da fase de publicação. Retenção de artefatos limitada a três dias; concorrência e checagem de revisão impedem publicar versão antiga sobre nova. [Actions gratuito em repositórios públicos](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [Direct Upload em CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/). **Projetos Direct Upload não podem depois ser convertidos em Git integration**; migrar essa abordagem exige novo projeto. [Restrição oficial](https://developers.cloudflare.com/pages/get-started/direct-upload/).

Conta Free, repositório remoto, account ID e token Pages Edit restrito à conta precisam estar disponíveis na fase de release. Verificação inicial somente leitura não encontrou remoto, CLIs gh/wrangler ou credenciais convencionais na sessão; isso não impede desenvolvimento local. Segredo só no job confiável de deploy; o site não precisa de variáveis de ambiente. **Terraform fica fora da v1 por proporcionalidade**, mas configuração, headers/cache, scripts de publicação e instruções de recriação serão versionados. Essa automação não é provisionamento declarativo completo. Containers permanecem dispensáveis.

Publicação só será concluída com commit/deployment ID/URL registrados e smoke real de assets, navegação, configurador, mobile, reduced motion e console. Recuperação por [rollback para deployment anterior de produção](https://developers.cloudflare.com/pages/configuration/rollbacks/), seguido de novo smoke. Nenhuma conta, recurso, token ou publicação foi criado nesta fase.

## Qualidade: critérios futuros, não resultados medidos

| Critério | Evidência esperada |
|---|---|
| Configurador completo | Nove combinações com imagem correspondente, seleção por teclado/touch e ausência de estado preso |
| Demonstração honesta | Três modos e world/OLVR funcionam; troca/reset cancelam transições; nenhuma API de IA/sensores |
| Responsividade | QA visual em 390, 768 e 1440 px; verificação em 320 px e zoom 200%; sem overflow ou controles inacessíveis |
| Acessibilidade | Semântica, skip link, contraste, foco, radio groups, leitura e reduced motion; scanner é complemento |
| Compatibilidade | Smoke no build exportado em Chromium, Firefox e WebKit; dispositivo físico quando disponível |
| Performance | Três execuções de carga fria com browser, rede/CPU e ambiente registrados; interações e animações também perfiladas |
| Release | CI verde, URL publicada, assets/links/metadata e fluxos verificados no destino |

Budgets iniciais: JS inicial ≤250 KiB gzip; transferência inicial mobile ≤1,25 MiB; hero aproximadamente ≤250 KiB mobile/450 KiB desktop. 3D opcional: engine + modelo + texturas ≤3 MiB transferidos, texturas decodificadas ≤32 MiB. **Alvo: 60 FPS (~16,7 ms/frame). Tolerância mínima: mediana ≤20 ms e p95 ≤33,3 ms; cumprir essa tolerância não comprova 60 FPS.** Se um efeito não cumprir, simplificar antes de adicioná-lo ao núcleo.

Primeiro perfil: Chromium/Windows local, mobile emulado 390×844/DPR1, CPU4×, rede 1,6 Mbps down/750 Kbps up/150 ms; desktop1440×900 sem throttling. Registrar versão browser/CPU/memória disponíveis, três cargas frias, primeira interação e interações aquecidas. Contabilizar imagens decodificadas e memória total observável, distinguindo estimativas de bytes de pixels de memória de processo. Primeira abertura e memória de canvas só serão medidas se existir canvas. Aparelho físico não disponível deve aparecer como limitação, nunca ser inferido da emulação.

Targets de CWV: LCP ≤2,5 s, CLS ≤0,1, INP ≤200 ms. Esses limiares se referem ao p75 em campo, separado entre mobile/desktop; Lighthouse local não comprova CWV de visitantes nem mede INP de campo. [Definições oficiais](https://web.dev/articles/vitals). Emulação de celular não valida custo real de GPU; se não houver aparelho acessível, essa lacuna será declarada.

Playwright cobre poucos fluxos úteis: navegação/menu, nove configurações, modos/reset AR, reduced motion/falhas relevantes e smoke responsivo. QA visual e revisão manual complementam; não perseguir cobertura artificial. Código deve explicar-se por nomes e estrutura; comentários só para decisões e restrições não óbvias.

## Marcos e donos após aprovação

| Marco | Dono principal | Critério para avançar |
|---|---|---|
| 1. Fundação mínima | Platform cuida dependências/config/CI; frontend estrutura/tokens em área exclusiva | Install, lint, types, pipeline de imagens e export passam |
| 2. Prova visual e método assets | Frontend; validator verifica; manager integra | Hero + Design desktop/mobile, macro, quatro variantes coerentes, screenshots e primeiro perfil; **parar para aceite humano antes de expandir** |
| 3. Experiências | Frontend | Cena AR e configurador 3×3 completos; teclado/touch/fallbacks e testes críticos passam |
| 4. Motion e 3D condicional | Frontend; tech-lead só para dúvida substancial | Quatro momentos de motion validados; spike de 3D aceito por evidência ou baseline por imagens mantida |
| 5. Polish integrado | Frontend corrige; validator verifica independentemente | QA visual/responsiva, acessibilidade, browsers e performance; reviewer focal se risco justificar |
| 6. Produção | Platform; manager integra e verifica aceite | Repositório público/README/lockfile/CI, publicação gratuita e smoke no destino; registrar rollback |

Manifest, lockfile e configurações compartilhadas terão um dono por vez. A equipe atual de discovery: frontend para experiência/visual, tech-lead para arquitetura e platform para hosting/CI; não há trabalho que justifique backend, security ou banco nesta fase.

## Aprovação recebida e próximo aceite

Direção, narrativa, inglês, stack, hosting e marcos foram aprovados com os ajustes incorporados acima. A primeira fatia foi apresentada com aplicação renderizada, screenshots e perfil, e recebeu aceite visual em 12/10/2026. Estão liberados pack completo, experiências, motion e validação integrada; publicação segue o destino gratuito aprovado e requer acessos reais. Decisões rotineiras seguem com o squad; mudança de conceito, custo, licença problemática ou tecnologia central volta ao usuário.

Responsáveis, dependências, estimativas de esforço e teto de investigação estão no [registro de coordenação](../work/squad-state.md). Pendências reais serão atualizadas pelas evidências da fatia; nenhuma proposta ou meta deve ser apresentada como implementação, medida ou publicação concluída.

### Nota técnica: consulta de versões

Fontes oficiais consultadas em 08/10/2026 pelo tech-lead: [Next 16.4.0](https://registry.npmjs.org/next/latest), [React 19.3.0](https://registry.npmjs.org/react/latest), [ReactDOM correspondente](https://raw.githubusercontent.com/facebook/react/v19.3.0/packages/react-dom/package.json), [TypeScript latest 7.0.2](https://registry.npmjs.org/typescript/latest), [TS 6.0.3 recomendado](https://github.com/microsoft/TypeScript/releases/tag/v6.0.3), [GSAP 3.15.0](https://registry.npmjs.org/gsap), [Playwright 1.64.0](https://registry.npmjs.org/@playwright/test/latest). O patch publicado de `@gsap/react` será resolvido na fundação. Disponibilidade e peer dependencies declaradas não equivalem a install/build executados; os endpoints `latest` podem mudar após esta consulta.
