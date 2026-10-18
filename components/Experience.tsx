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
          <svg className={styles.lensFrameWide} viewBox="0 0 1200 675" preserveAspectRatio="none" focusable="false">
            <defs>
              <linearGradient id="frame-acetate-wide" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#343a36" /><stop offset=".16" stopColor="#161b19" /><stop offset=".48" stopColor="#090d0c" /><stop offset=".82" stopColor="#1c211e" /><stop offset="1" stopColor="#3b403a" /></linearGradient>
              <linearGradient id="frame-light-wide" x1="0" y1="0" x2="1" y2=".4"><stop stopColor="#b8beb3" stopOpacity=".26" /><stop offset=".3" stopColor="#899489" stopOpacity=".19" /><stop offset=".7" stopColor="#899489" stopOpacity=".04" /><stop offset="1" stopColor="#b7bdb3" stopOpacity=".23" /></linearGradient>
              <linearGradient id="lens-glint-wide" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity="0" /><stop offset=".48" stopColor="#fff" stopOpacity=".07" /><stop offset=".55" stopColor="#fff" stopOpacity=".015" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
              <clipPath id="lens-cut-wide"><path d="M15 70 Q205 32 515 69 L501 440 Q497 514 466 524 Q283 558 108 526 Q35 510 29 438 Z M1185 70 Q995 32 685 69 L699 440 Q703 514 734 524 Q917 558 1092 526 Q1165 510 1171 438 Z" /></clipPath>
            </defs>
            <path className={styles.lensFrameDepth} d="M-38 45 C100 8 360 8 535 45 Q560 52 560 80 L547 443 Q543 531 475 548 Q290 586 100 548 Q16 530 8 443 L-38 45 M1238 45 C1100 8 840 8 665 45 Q640 52 640 80 L653 443 Q657 531 725 548 Q910 586 1100 548 Q1184 530 1192 443 L1238 45 M558 68 Q600 32 642 68" />
            <path className={styles.lensFrameBody} stroke="url(#frame-acetate-wide)" d="M-38 45 C100 8 360 8 535 45 Q560 52 560 80 L547 443 Q543 531 475 548 Q290 586 100 548 Q16 530 8 443 L-38 45 M1238 45 C1100 8 840 8 665 45 Q640 52 640 80 L653 443 Q657 531 725 548 Q910 586 1100 548 Q1184 530 1192 443 L1238 45 M558 68 Q600 32 642 68" />
            <path className={styles.lensFrameInner} d="M-17 66 Q145 31 520 65 L529 83 L518 440 Q514 514 470 533 Q289 567 104 536 Q26 518 20 439 M1217 66 Q1055 31 680 65 L671 83 L682 440 Q686 514 730 533 Q911 567 1096 536 Q1174 518 1180 439 M570 80 Q600 59 630 80" />
            <path className={styles.lensFrameHighlight} stroke="url(#frame-light-wide)" d="M-20 49 C120 12 363 12 526 49 M18 417 L23 451 Q28 520 106 537 Q291 572 469 537 M1220 49 C1080 12 837 12 674 49 M1182 417 L1177 451 Q1172 520 1094 537 Q909 572 731 537 M561 66 Q600 32 639 66" />
            <path className={styles.lensFrameHinge} d="M8 77 L48 73 M1192 77 L1152 73" />
            <g clipPath="url(#lens-cut-wide)" className={styles.lensFrameReflection}><path fill="url(#lens-glint-wide)" d="M52 50 L230 50 L372 567 L260 567 Z M810 50 L941 50 L1123 567 L997 567 Z" /><path d="M85 83 Q225 61 410 72 M794 72 Q974 61 1115 83" /></g>
          </svg>
          <svg className={styles.lensFrameTall} viewBox="0 0 400 500" preserveAspectRatio="none" focusable="false">
            <defs>
              <linearGradient id="frame-acetate-tall" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#343a36" /><stop offset=".16" stopColor="#161b19" /><stop offset=".48" stopColor="#090d0c" /><stop offset=".82" stopColor="#1c211e" /><stop offset="1" stopColor="#3b403a" /></linearGradient>
              <linearGradient id="frame-light-tall" x1="0" y1="0" x2="1" y2=".4"><stop stopColor="#b8beb3" stopOpacity=".26" /><stop offset=".3" stopColor="#899489" stopOpacity=".19" /><stop offset=".7" stopColor="#899489" stopOpacity=".04" /><stop offset="1" stopColor="#b7bdb3" stopOpacity=".23" /></linearGradient>
              <linearGradient id="lens-glint-tall" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity="0" /><stop offset=".48" stopColor="#fff" stopOpacity=".07" /><stop offset=".55" stopColor="#fff" stopOpacity=".015" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
              <clipPath id="lens-cut-tall"><path d="M13 49 Q88 27 162 48 L172 397 Q170 439 140 449 Q93 464 44 449 Q19 437 16 397 Z M387 49 Q312 27 238 48 L228 397 Q230 439 260 449 Q307 464 356 449 Q381 437 384 397 Z" /></clipPath>
            </defs>
            <path className={styles.lensFrameDepth} d="M-10 35 Q62 10 165 30 Q187 36 187 60 L181 400 Q178 450 144 462 Q91 479 42 460 Q9 447 5 400 L-10 35 M410 35 Q338 10 235 30 Q213 36 213 60 L219 400 Q222 450 256 462 Q309 479 358 460 Q391 447 395 400 L410 35 M186 55 Q200 38 214 55" />
            <path className={styles.lensFrameBody} stroke="url(#frame-acetate-tall)" d="M-10 35 Q62 10 165 30 Q187 36 187 60 L181 400 Q178 450 144 462 Q91 479 42 460 Q9 447 5 400 L-10 35 M410 35 Q338 10 235 30 Q213 36 213 60 L219 400 Q222 450 256 462 Q309 479 358 460 Q391 447 395 400 L410 35 M186 55 Q200 38 214 55" />
            <path className={styles.lensFrameInner} d="M1 48 Q75 21 161 39 L174 57 L169 398 Q166 439 141 451 Q90 468 43 452 Q16 439 14 398 M399 48 Q325 21 239 39 L226 57 L231 398 Q234 439 259 451 Q310 468 357 452 Q384 439 386 398 M191 60 Q200 49 209 60" />
            <path className={styles.lensFrameHighlight} stroke="url(#frame-light-tall)" d="M0 37 Q80 13 158 33 M13 402 Q16 440 48 455 Q93 470 140 455 M400 37 Q320 13 242 33 M387 402 Q384 440 352 455 Q307 470 260 455 M187 53 Q200 38 213 53" />
            <path className={styles.lensFrameHinge} d="M8 57 L27 57 M392 57 L373 57" />
            <g clipPath="url(#lens-cut-tall)" className={styles.lensFrameReflection}><path fill="url(#lens-glint-tall)" d="M22 25 L79 25 L165 473 L112 473 Z M245 25 L294 25 L377 473 L328 473 Z" /><path d="M28 65 Q90 45 148 55 M252 55 Q310 45 372 65" /></g>
          </svg>
        </div>
        {scenario === "navigation" && <div className={styles.navigationHud}>
          <div className={styles.locationTag}><span className={styles.hudDot} /> <span>Rue des Tilleuls × Rue du Marché<br /><small>Belleneuve · illustrative location</small></span></div>
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
