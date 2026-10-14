"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./Experience.module.css";

type Scenario = "navigation" | "vision" | "translation";
type Status = "idle" | "responding" | "ready";
const scenarios = {
  navigation: { label: "Navigation", scene: "street", alt: "A pedestrian street with a café entrance and outdoor tables.", title: "A small detour. A good coffee.", prompt: "Explore nearby", answer: "Illustrative location: Rue des Tilleuls × Rue du Marché, in the fictional town of Belleneuve. The café is ahead; the Old Town Square, Riverside Promenade and Museum of Light are nearby. No live location or directions are used." },
  vision: { label: "Vision", scene: "gallery", alt: "An art gallery with a large abstract painting on the right-hand wall.", title: "Look closer. Notice more.", prompt: "Explore the artwork", answer: "Fictional artwork: Between Light and Stone, painted by Camille Arnaud in 2018. The large abstract canvas on the right pairs charcoal forms with warm ochre. This identification is a scripted concept, not image recognition." },
  translation: { label: "Translation", scene: "market", alt: "A neighborhood market with produce and a chalkboard sign.", title: "Find your words anywhere.", prompt: "Translate the chalkboard", answer: "Fictional chalkboard translation: Marché du jour means Today's market; pommes means apples (€3.20), poires means pears (€3.80), and fleurs means flowers (€8). This is a scripted example, not live translation." },
} as const;
function SceneImage({ scene, alt, onLoad, onError }: { scene: string; alt: string; onLoad?: () => void; onError?: () => void }) {
  return <picture><source type="image/avif" srcSet={`/images/scene-${scene}-640.avif 640w, /images/scene-${scene}-960.avif 960w, /images/scene-${scene}-1440.avif 1440w`} sizes="91vw" /><img src={`/images/scene-${scene}-960.webp`} srcSet={`/images/scene-${scene}-640.webp 640w, /images/scene-${scene}-960.webp 960w, /images/scene-${scene}-1440.webp 1440w`} sizes="91vw" width={1672} height={941} loading="lazy" decoding="async" alt={alt} onLoad={onLoad} onError={onError} /></picture>;
}
export function Experience() {
  const [scenario, setScenario] = useState<Scenario>("navigation");
  const [split, setSplit] = useState(50);
  const [status, setStatus] = useState<Status>("idle");
  const [sceneError, setSceneError] = useState(false);
  const [generation, setGeneration] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const version = useRef(0);
  const current = scenarios[scenario];
  const splitStyle = { "--split": `${split}%` } as CSSProperties;
  function cancel() { version.current++; if (timer.current) clearTimeout(timer.current); timer.current = null; setStatus("idle"); }
  function chooseScenario(value: Scenario) { cancel(); setScenario(value); setSplit(50); setSceneError(false); }
  function reset() { cancel(); setScenario("navigation"); setSplit(50); setSceneError(false); }
  function respond() { if (status === "responding") return; cancel(); setStatus("responding"); setSplit(20); const request = version.current; timer.current = setTimeout(() => { if (version.current === request) setStatus("ready"); }, 250); }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <section id="experience" className={styles.section} aria-labelledby="experience-title">
    <div className={styles.heading}><p className={styles.chapter}>02 / A different perspective</p><h2 id="experience-title" tabIndex={-1}>See the world.<br />Reveal the context.</h2><p>Slide between an everyday moment and a glimpse of what OLVR could add.</p></div>
    <fieldset className={styles.scenarios}><legend>Choose a scene</legend><div className={styles.radioRow}>{(Object.keys(scenarios) as Scenario[]).map(id => <label key={id}><input type="radio" name="scenario" value={id} checked={scenario === id} onChange={() => chooseScenario(id)} /><span>{scenarios[id].label}</span></label>)}</div></fieldset>
    <figure className={styles.scene} style={splitStyle} data-scenario={scenario} data-narrow={split > 50}>
      <div className={styles.worldScene} key={`${current.scene}-${generation}`}><SceneImage scene={current.scene} alt={current.alt} onLoad={() => setSceneError(false)} onError={() => setSceneError(true)} /></div>
      {!sceneError && <><div className={styles.olvrScene} aria-hidden="true"><SceneImage scene={current.scene} alt="" /><div className={styles.tint} />
        {scenario === "navigation" && <div className={styles.hudCard}><small>OLVR / illustrative location</small><strong>Rue des Tilleuls × Rue du Marché</strong><span>Belleneuve · fictional town</span><ul><li>Old Town Square <em>4 min</em></li><li>Riverside Promenade <em>6 min</em></li><li>Museum of Light <em>8 min</em></li></ul></div>}
        {scenario === "vision" && <div className={styles.hudCard}><small>OLVR / fictional artwork</small><strong>Between Light and Stone</strong><span>Camille Arnaud · 2018</span><p>Abstract study in charcoal and ochre</p></div>}
        {scenario === "translation" && <div className={`${styles.hudCard} ${styles.translationCard}`}><small>OLVR / Français → English</small><strong>Marché du jour <span>Today&apos;s market</span></strong><ul><li>Pommes · 3,20 € <em>Apples · €3.20</em></li><li>Poires · 3,80 € <em>Pears · €3.80</em></li><li>Fleurs · 8 € <em>Flowers · €8</em></li></ul></div>}
      </div><div className={styles.sceneTop} aria-hidden="true"><span>WORLD</span><span>DRAG TO COMPARE</span><span>OLVR</span></div><div className={styles.divider} aria-hidden="true"><span className={styles.grip}>‹ &nbsp;›</span></div><input className={styles.slider} type="range" min="0" max="100" step="1" value={split} onChange={event => setSplit(Number(event.target.value))} aria-label={`Compare World and OLVR in the ${current.label.toLowerCase()} scene`} aria-valuetext={`${split}% World, ${100 - split}% OLVR`} aria-describedby="compare-instructions" /></>}
      {sceneError && <div className={styles.sceneError}><p>This scene could not load.</p><button type="button" onClick={() => { setSceneError(false); setGeneration(value => value + 1); }}>Retry image</button><p>The scripted example below remains available.</p></div>}
      <figcaption className="sr-only">{current.alt} Drag the divider to compare a plain view with a scripted OLVR concept overlay.</figcaption>
    </figure>
    <div className={styles.compareFooter} id="compare-instructions"><span>← More world</span><p>Drag the divider or use the arrow keys to explore.</p><span>More OLVR →</span></div>
    <div className={styles.context}><div><p className={styles.eyebrow}>Try OLVR / {current.label}</p><h3>{current.title}</h3><p className={styles.intro}>A closer look at how a little context might feel.</p><button className={styles.ask} type="button" onClick={respond} disabled={status === "responding"}>{status === "responding" ? "Preparing context…" : current.prompt}<span aria-hidden="true">↗</span></button></div><div className={styles.response}><p className={styles.eyebrow}>Scripted response</p><p role="status" aria-live="polite" aria-atomic="true" className={styles.answer}>{status === "ready" ? current.answer : status === "responding" ? "Preparing a scripted response…" : "Choose the action to reveal context for this scene."}</p><button className={styles.reset} type="button" onClick={reset}>Reset experience <span aria-hidden="true">↺</span></button></div></div>
    <p className={styles.note}>Illustrative concept only. No camera, location, live recognition or AI is used.</p><noscript><p className={styles.note}>Enable JavaScript to explore the comparison and scripted scenarios.</p></noscript>
  </section>;
}
