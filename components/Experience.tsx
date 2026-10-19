"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./Experience.module.css";

type Scenario = "navigation" | "vision" | "translation";
type Status = "idle" | "responding" | "ready";
type ExchangeRate = { value: string; date: string };
const ECB_RATE_URL = "https://data-api.ecb.europa.eu/service/data/EXR/D.USD.EUR.SP00.A?lastNObservations=1&format=csvdata";
const scenarios = {
  navigation: { label: "Navigation", scene: "street", alt: "A pedestrian street with a café entrance and outdoor tables.", title: "A small detour. A good coffee.", prompt: "Explore nearby", answer: "Illustrative location: Rue des Tilleuls × Rue du Marché, in fictional Belleneuve. Old Town Square is a 4-minute walk and Museum of Light is 8 minutes away. No live location or directions are used." },
  vision: { label: "Vision", scene: "gallery", alt: "An art gallery with a large abstract painting on the right-hand wall and sculptures at both sides.", title: "Look closer. Notice more.", prompt: "Explore the artwork", answer: "Fictional artworks: Between Light and Stone by Camille Arnaud (2018) is the large abstract canvas on the right. Still Water by Élise Moreau (2016) hangs farther back. The dark sculpture on the left is Tidal Form by Noémie Vidal (2019); the pale sculpture on the right is Open Air by Lucien Mercier (2021). These identifications are scripted concepts, not image recognition." },
  translation: { label: "Translation", scene: "market", alt: "A neighborhood market with produce and a chalkboard sign.", title: "Find your words anywhere.", prompt: "Translate the chalkboard", answer: "Fictional chalkboard translation: Marché du jour means Today's market; pommes means apples (€3.20), poires means pears (€3.80), and fleurs means flowers (€8). Translation is scripted, not live." },
} as const;
function parseExchangeRate(csv: string): ExchangeRate {
  const [header, ...rows] = csv.trim().split(/\r?\n/);
  const fields = header.split(",");
  const dateIndex = fields.indexOf("TIME_PERIOD");
  const valueIndex = fields.indexOf("OBS_VALUE");
  const row = rows.find(line => line.startsWith("EXR.D.USD.EUR.SP00.A,"))?.split(",");
  const date = row?.[dateIndex];
  const value = row?.[valueIndex];
  if (dateIndex < 0 || valueIndex < 0 || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !value || !Number.isFinite(Number(value))) throw new Error("Invalid ECB reference data");
  return { date, value };
}
function SceneImage({ scene, alt, onLoad, onError }: { scene: string; alt: string; onLoad?: () => void; onError?: () => void }) {
  return <picture><source type="image/avif" srcSet={`/images/scene-${scene}-640.avif 640w, /images/scene-${scene}-960.avif 960w, /images/scene-${scene}-1440.avif 1440w`} sizes="91vw" /><img src={`/images/scene-${scene}-960.webp`} srcSet={`/images/scene-${scene}-640.webp 640w, /images/scene-${scene}-960.webp 960w, /images/scene-${scene}-1440.webp 1440w`} sizes="91vw" width={1672} height={941} loading="lazy" decoding="async" alt={alt} onLoad={onLoad} onError={onError} /></picture>;
}
export function Experience() {
  const [scenario, setScenario] = useState<Scenario>("navigation");
  const [split, setSplit] = useState(20);
  const [status, setStatus] = useState<Status>("idle");
  const [sceneError, setSceneError] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [rateStatus, setRateStatus] = useState<"idle" | "loading" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const version = useRef(0);
  const current = scenarios[scenario];
  const splitStyle = { "--split": `${split}%` } as CSSProperties;
  function cancel() { version.current++; if (timer.current) clearTimeout(timer.current); timer.current = null; setStatus("idle"); }
  function chooseScenario(value: Scenario) { cancel(); setScenario(value); setSplit(20); setSceneError(false); }
  function reset() { cancel(); setScenario("navigation"); setSplit(20); setSceneError(false); }
  function respond() { if (status === "responding") return; cancel(); setStatus("responding"); setSplit(20); const request = version.current; timer.current = setTimeout(() => { if (version.current === request) setStatus("ready"); }, 250); }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (scenario !== "translation" || exchangeRate) return;
    const controller = new AbortController();
    fetch(ECB_RATE_URL, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error("ECB reference unavailable"); return response.text(); })
      .then(csv => { const rate = parseExchangeRate(csv); setExchangeRate(rate); setRateStatus("idle"); })
      .catch(error => { if (error instanceof Error && error.name !== "AbortError") setRateStatus("error"); });
    return () => controller.abort();
  }, [scenario, exchangeRate]);
  return <section id="experience" className={styles.section} aria-labelledby="experience-title">
    <div className={styles.heading}><p className={styles.chapter}>02 / A different perspective</p><h2 id="experience-title" tabIndex={-1}>See the world.<br />Reveal the context.</h2><p>Slide between an everyday moment and a glimpse of what OLVR could add.</p></div>
    <fieldset className={styles.scenarios}><legend>Choose a scene</legend><div className={styles.radioRow}>{(Object.keys(scenarios) as Scenario[]).map(id => <label key={id}><input type="radio" name="scenario" value={id} checked={scenario === id} onChange={() => chooseScenario(id)} /><span>{scenarios[id].label}</span></label>)}</div></fieldset>
    <figure className={styles.scene} style={splitStyle} data-scenario={scenario} data-narrow={split > 50}>
      <div className={styles.worldScene} key={`${current.scene}-${generation}`}><SceneImage scene={current.scene} alt={current.alt} onLoad={() => setSceneError(false)} onError={() => setSceneError(true)} /></div>
      {!sceneError && <><div className={styles.olvrScene} aria-hidden="true"><SceneImage scene={current.scene} alt="" /><div className={styles.tint} />
        <div className={styles.lensFrame}>
          <picture>
            <source type="image/webp" srcSet="/images/lens-frame-wide.webp" />
            <img src="/images/lens-frame-wide.png" width={1671} height={941} loading="lazy" decoding="async" alt="" />
          </picture>
        </div>
        {scenario === "navigation" && <div className={styles.navigationHud}>
          <div className={styles.locationTag}><span className={styles.hudDot} /> <span>Rue des Tilleuls<br />× Rue du Marché<small>Belleneuve · illustrative location</small></span></div>
          <div className={`${styles.route} ${styles.routeSquare}`}><span className={styles.routeArrow}>↙</span><span>Old Town Square<small>4 min walk</small></span></div>
          <div className={`${styles.route} ${styles.routeMuseum}`}><span className={styles.routeArrow}>↗</span><span>Museum of Light<small>8 min walk</small></span></div>
        </div>}
        {scenario === "vision" && <div className={styles.visionHud}>
          <div className={`${styles.artLabel} ${styles.artForeground}`}><span className={styles.hudDot} /><span><strong>Between Light and Stone</strong><small>Camille Arnaud · 2018</small></span></div>
          <div className={`${styles.artLabel} ${styles.artBackground}`}><span className={styles.hudDot} /><span><strong>Still Water</strong><small>Élise Moreau · 2016</small></span></div>
          <div className={`${styles.artLabel} ${styles.sculptureLeft}`}><span className={styles.hudDot} /><span><strong>Tidal Form</strong><small>Noémie Vidal · 2019</small></span></div>
          <div className={`${styles.artLabel} ${styles.sculptureRight}`}><span className={styles.hudDot} /><span><strong>Open Air</strong><small>Lucien Mercier · 2021</small></span></div>
        </div>}
        {scenario === "translation" && <div className={styles.translationHud}>
          <div className={styles.boardTranslation}><strong>Today&apos;s market</strong><span>Apples&nbsp; €3.20</span><span>Pears&nbsp; €3.80</span><span>Flowers&nbsp; €8</span></div>
          <div className={styles.exchangeTag}><span className={styles.hudDot} /><span><strong>{exchangeRate ? `€1 = $${exchangeRate.value}` : rateStatus === "error" ? "Rate unavailable" : "EUR → USD"}</strong><small>{exchangeRate ? `ECB reference · ${exchangeRate.date}` : rateStatus === "error" ? "ECB reference unavailable" : "Loading ECB reference…"}</small></span></div>
        </div>}
      </div><div className={styles.sceneTop} aria-hidden="true"><span>WORLD</span><span>DRAG TO COMPARE</span><span>OLVR</span></div><div className={styles.divider} aria-hidden="true"><span className={styles.grip}>‹ &nbsp;›</span></div><input className={styles.slider} type="range" min="0" max="100" step="1" value={split} onChange={event => setSplit(Number(event.target.value))} aria-label={`Compare World and OLVR in the ${current.label.toLowerCase()} scene`} aria-valuetext={`${split}% World, ${100 - split}% OLVR`} aria-describedby="compare-instructions" /></>}
      {sceneError && <div className={styles.sceneError}><p>This scene could not load.</p><button type="button" onClick={() => { setSceneError(false); setGeneration(value => value + 1); }}>Retry image</button><p>The scripted example below remains available.</p></div>}
      <figcaption className="sr-only">{current.alt} Drag the divider to compare a plain view with a scripted OLVR concept overlay.</figcaption>
    </figure>
    <div className={styles.compareFooter} id="compare-instructions"><span>← More world</span><p>Drag the divider or use the arrow keys to explore.</p><span>More OLVR →</span></div>
    {scenario === "vision" && <p className={styles.mobileGalleryNote}>Also in the gallery: <strong>Tidal Form</strong>, dark sculpture at left · <strong>Open Air</strong>, pale sculpture at right.</p>}
    <div className={styles.context}><div><p className={styles.eyebrow}>Try OLVR / {current.label}</p><h3>{current.title}</h3><p className={styles.intro}>A closer look at how a little context might feel.</p><button className={styles.ask} type="button" onClick={respond} disabled={status === "responding"}>{status === "responding" ? "Preparing context…" : current.prompt}<span aria-hidden="true">↗</span></button></div><div className={styles.response}><p className={styles.eyebrow}>Scripted response</p><p role="status" aria-live="polite" aria-atomic="true" className={styles.answer}>{status === "ready" ? <>{current.answer}{scenario === "translation" && <>{exchangeRate ? ` ECB EUR/USD reference: €1 = $${exchangeRate.value} on ${exchangeRate.date}; this is the latest fetched daily reference, not a live quote.` : rateStatus === "error" ? " ECB exchange reference is currently unavailable." : " Loading the latest ECB daily exchange reference."}</>}</> : status === "responding" ? "Preparing a scripted response…" : "Choose the action to reveal context for this scene."}</p><button className={styles.reset} type="button" onClick={reset}>Reset experience <span aria-hidden="true">↺</span></button></div></div>
    <p className={styles.note}>Illustrative concept only. No camera, location, live recognition or AI is used.</p><noscript><p className={styles.note}>Enable JavaScript to explore the comparison and scripted scenarios.</p></noscript>
  </section>;
}
