# OLVR ONE

An independent concept for near-future smart glasses. An editorial product story built with Next.js, React, TypeScript, CSS Modules and GSAP.

A six-act product story combines responsive product imagery, three scripted AR scenarios and nine frame/lens combinations. The product is fictional and is not available for purchase.

**Live site:** [olvr-one.pages.dev](https://olvr-one.pages.dev/)

## Run locally

Use Node.js 22.14 or a compatible Node 22 release and npm 10.9.2.

```sh
npm ci
npm run dev
```

To inspect the static production export:

```sh
npm run build
npm run preview
```

Open `http://127.0.0.1:4173`. The build generates responsive AVIF/WebP images from the versioned masters before exporting the site to `out/`.

## Check the experience

```sh
npm run lint
npm run typecheck
npm run smoke
npx playwright install
npm test
```

Build before running export smoke tests or browser tests. Browser checks run against the exported application, not the development server. Generated reports are local evidence, not proof of a public deployment.

## Design and engineering decisions

- Static content is generated at build time; interactive selection stays in a small client component. No backend, AI service, sensors, account or data collection is used.
- One product master anchors the imagery. Controlled edits create the material variants, with a separate macro composition for Design. The process is traceable; AI image regeneration is not bit-for-bit deterministic.
- The requested option and displayed image are separate states. Only the latest successfully decoded request may confirm a new preview; errors preserve the previous image and offer retry/reset.
- Adaptive is a fixed simulated appearance. Three frame finishes and three lens appearances map to nine individual previews.
- Motion respects reduced-motion preferences and native scrolling. The visual story remains available without animation. The approved image baseline avoids adding WebGL without a suitable model or demonstrated visual benefit.
- Fonts are self-hosted. Responsive image dimensions reserve layout space; loading and JavaScript transfer are measured on the production export.

## Project status

The site is published on Cloudflare Pages through Git integration with the `main` branch. GitHub Actions validates changes; Cloudflare builds and deploys them. The experience includes World/OLVR views, Navigation/Vision/Translation scenarios, conceptual Hardware, all nine configurations, a three-view Obsidian/Clear product inspection and a closing composition. The product inspection uses discrete concept renders rather than a freely rotatable 3D model. The latest integrated browser suite passed 117 cases across Chromium, Firefox and WebKit.

Review the [desktop/mobile screenshots and acceptance report](docs/visual-acceptance.md), [browser validation](docs/validation.md) and [lab performance measurements](docs/performance.md). The expanded experience measured a median mobile LCP of 948 ms, zero CLS and at most 217.08 KiB of initial transfer under the documented emulation conditions; the initial JavaScript union was 202.49 KiB gzip. These are local lab results, not field Core Web Vitals or a physical-device certification.

See the [approved proposal](docs/proposal.md) for scope and decisions and the [delivery record](work/squad-state.md) for current evidence and remaining work.
