/* Build-generated responsive sources replace the runtime image optimizer. */
import { Header } from "@/components/Header";
import { HeroMotion } from "@/components/HeroMotion";
import { HeroVision } from "@/components/HeroVision";
import { Configurator } from "@/components/Configurator";
import { Experience } from "@/components/Experience";
import { HardwareDetail } from "@/components/HardwareDetail";
import styles from "./page.module.css";

export default function Home() {
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <div id="top"><Header /></div>
    <main id="main" tabIndex={-1}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <HeroMotion />
        <HeroVision />
        <div className={styles.heroCopy}><p className={styles.eyebrow}>Meet OLVR ONE</p><h1 id="hero-title">Intelligence,<br /><span>in sight.</span></h1></div>
        <div className={styles.heroSide}><span className={styles.lensMark} aria-hidden="true" /><p>Everyday perspective.<br />New possibilities.</p></div>
        <picture className={styles.heroPicture}>
          <source type="image/avif" srcSet="/images/hero-640.avif 640w, /images/hero-960.avif 960w, /images/hero-1440.avif 1440w, /images/hero-1600.avif 1600w" sizes="(max-width: 640px) 115vw, 76vw" />
          <img src="/images/hero-1440.webp" srcSet="/images/hero-640.webp 640w, /images/hero-960.webp 960w, /images/hero-1440.webp 1440w, /images/hero-1600.webp 1600w" sizes="(max-width: 640px) 115vw, 76vw" width={1672} height={941} alt="OLVR ONE concept glasses: sculpted graphite frames, transparent lenses and a discreet circular camera detail in warm studio light." fetchPriority="high" />
        </picture>
        <div className={styles.heroBottom}><p>A familiar shape.<br />An entirely new way to see.</p><a className={styles.cta} href="#design">Explore OLVR <span aria-hidden="true">↘</span></a></div>
        <div className={styles.heroFoot}><span>Designed around the everyday.</span><a href="#design" aria-label="Scroll to Design">01 — 02 <span aria-hidden="true">↓</span></a></div>
      </section>

      <section id="design" className={styles.design} aria-labelledby="design-title">
        <div className={styles.designHeading}><p className={styles.chapter}><span className={styles.smallLens} aria-hidden="true" />01 / The familiar, reimagined</p><div><h2 id="design-title" tabIndex={-1}>Technology that<br />looks like glasses.</h2><p>Nothing to announce. Everything to notice.<br />A considered silhouette, down to the smallest detail.</p></div></div>
        <figure className={styles.macro}>
          <picture>
            <source type="image/avif" srcSet="/images/design-macro-640.avif 640w, /images/design-macro-960.avif 960w, /images/design-macro-1440.avif 1440w" sizes="(max-width: 640px) calc(100vw - 48px), 91vw" />
            <img src="/images/design-macro-960.webp" srcSet="/images/design-macro-640.webp 640w, /images/design-macro-960.webp 960w, /images/design-macro-1440.webp 1440w" sizes="(max-width: 640px) calc(100vw - 48px), 91vw" width={1672} height={941} alt="Macro view of the OLVR ONE graphite frame: a round camera aperture, small opening and clean hinge seam meet the softly beveled lens rim. Conceptual hardware detail." loading="lazy" decoding="async" />
          </picture>
          <div className={styles.macroLabel} aria-hidden="true"><span>01.01</span><span>A closer look.</span><span>↗</span></div>
          <figcaption className={styles.macroCaption}>Quiet by design. <span>Concept detail / Obsidian</span></figcaption>
        </figure>
        <div className={styles.details}>
          <article><span>01</span><h3>A softer edge.</h3><p>Gentle curves and a sculpted bridge bring a familiar feel to a new perspective.</p></article>
          <article><span>02</span><h3>Details that belong.</h3><p>A discreet aperture. A precise seam. Technology considered as part of the whole.</p></article>
          <article><span>03</span><h3>Less, considered.</h3><p>Matte surfaces and restrained reflections. A concept built around everyday simplicity.</p></article>
        </div>
        <p className={styles.designNote}>An exploration of form and materials. Hardware shown is conceptual.</p>
      </section>
      <Experience />
      <section id="hardware" className={styles.hardware} aria-labelledby="hardware-title">
        <div className={styles.hardwareCopy}><p className={styles.chapter}>03 / The thinking inside</p><h2 id="hardware-title" tabIndex={-1}>A quiet kind<br />of intelligence.</h2><p>A design exploration of what everyday technology could feel like. Familiar on the outside. Considered within.</p></div>
        <HardwareDetail />
        <div className={styles.hardwareDetails}>
          <article><span>01 / Vision</span><h3>A point of view.</h3><p>The camera aperture suggests a way to understand what is in front of you. The scene above explores that idea through scripted responses.</p></article>
          <article><span>02 / Sound</span><h3>Room for the world.</h3><p>Directional audio and voice input are part of the concept: subtle ways to interact while staying present. No audio is recorded or played here.</p></article>
          <article><span>03 / Display</span><h3>Just enough information.</h3><p>A restrained display language puts brief guidance near the moment it belongs to. The interface is an illustration, not an optical simulation.</p></article>
        </div>
        <p className={styles.hardwareNote}>Conceptual hardware. Components, optical behavior and physical performance have not been engineered or tested.</p>
      </section>
      <Configurator />
      <section className={styles.closing} aria-labelledby="closing-title"><p className={styles.eyebrow}>An everyday possibility.</p><h2 id="closing-title">See what’s next.</h2><picture><source type="image/avif" srcSet="/images/hero-640.avif 640w, /images/hero-960.avif 960w, /images/hero-1440.avif 1440w" sizes="(max-width: 760px) 100vw, 70vw" /><img src="/images/hero-960.webp" width={1672} height={941} alt="OLVR ONE in Obsidian with Clear lenses, the complete concept silhouette in warm studio light." loading="lazy" decoding="async" /></picture><p>A familiar shape. A new perspective.</p><a className={styles.cta} href="#experience">Try OLVR again <span aria-hidden="true">↗</span></a></section>
    </main>
    <footer className={styles.footer}><a href="#top" className={styles.footerLogo} aria-label="OLVR ONE, back to top">OLVR <span>ONE</span></a><p>Independent product concept.<br />Not available for purchase.</p><a className={styles.topLink} href="#top">Back to the beginning <span aria-hidden="true">↑</span></a></footer>
  </>;
}
