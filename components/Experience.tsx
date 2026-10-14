"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./Experience.module.css";

type Scenario = "navigation" | "vision" | "translation";
type View = "world" | "olvr";
const scenarios = {
  navigation: { label: "Navigation", title: "A small detour. A good coffee.", prompt: "Find the café", answer: "The café is just ahead, across the quiet pedestrian lane. Follow the entrance in view.", mark: "Café / just ahead", symbol: "↗" },
  vision: { label: "Vision", title: "Notice a little more.", prompt: "Explore the scene", answer: "A street-side café, outdoor seating and plants by the entrance. A familiar scene, with a little more context.", mark: "Street-side café", symbol: "◎" },
  translation: { label: "Translation", title: "Familiar words. Somewhere new.", prompt: "Translate the menu", answer: "Menu translated from French to English: café — coffee; thé — tea; croissant — croissant. Read the sample menu below.", mark: "French → English", symbol: "A" },
} as const;

export function Experience() {
  const [scenario, setScenario] = useState<Scenario>("navigation");
  const [view, setView] = useState<View>("world");
  const [status, setStatus] = useState<"idle" | "responding" | "ready">("idle");
  const [sceneError, setSceneError] = useState(false);
  const [generation, setGeneration] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const responding = useRef(false);
  const version = useRef(0);
  const scene = useRef<HTMLElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const current = scenarios[scenario];
  function cancel() { version.current++; responding.current = false; if (timer.current) clearTimeout(timer.current); setStatus("idle"); }
  function chooseScenario(value: Scenario) { cancel(); setScenario(value); }
  function chooseView(value: View) { cancel(); setView(value); }
  function reset() { cancel(); setScenario("navigation"); setView("world"); }
  function respond() {
    if (responding.current) return;
    cancel(); responding.current = true; setView("olvr"); setStatus("responding");
    const request = version.current;
    timer.current = setTimeout(() => { if (version.current === request) { responding.current = false; setStatus("ready"); } }, 180);
  }
  useEffect(() => {
    let mounted = true;
    if (photo.current?.complete && photo.current.naturalWidth === 0) void photo.current.decode().catch(() => { if (mounted) setSceneError(true); });
    return () => { mounted = false; if (timer.current) clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    const target = scene.current;
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      void import("gsap").then(({ gsap }) => {
        if (cancelled) return;
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => { gsap.fromTo(target, { y: 18 }, { y: 0, duration: .65, ease: "power2.out" }); });
        cleanup = () => media.revert();
      });
    }, { threshold: .12 });
    observer.observe(target);
    return () => { cancelled = true; observer.disconnect(); cleanup?.(); };
  }, []);

  return <section id="experience" className={styles.section} aria-labelledby="experience-title">
    <div className={styles.heading}><p className={styles.chapter}>02 / A different perspective</p><h2 id="experience-title" tabIndex={-1}>Information where<br />you need it.</h2><p>The world comes first.<br />A little context follows.</p></div>
    <div className={styles.toolbar}>
      <fieldset><legend>Explore a scenario</legend><div className={styles.radioRow}>{(Object.keys(scenarios) as Scenario[]).map(id => <label key={id}><input type="radio" name="scenario" value={id} checked={scenario === id} onChange={() => chooseScenario(id)} /><span>{scenarios[id].label}</span></label>)}</div></fieldset>
      <fieldset><legend>Your view</legend><div className={styles.radioRow}>{(["world", "olvr"] as View[]).map(id => <label key={id}><input type="radio" name="view" value={id} checked={view === id} onChange={() => chooseView(id)} /><span>{id === "world" ? "World" : "OLVR"}</span></label>)}</div></fieldset>
    </div>
    <figure ref={scene} className={styles.scene} data-view={view} data-scenario={scenario}>
      <picture key={generation}>
        <source type="image/avif" srcSet="/images/scene-street-640.avif 640w, /images/scene-street-960.avif 960w, /images/scene-street-1440.avif 1440w" sizes="91vw" />
        <img ref={photo} src="/images/scene-street-960.webp" srcSet="/images/scene-street-640.webp 640w, /images/scene-street-960.webp 960w, /images/scene-street-1440.webp 1440w" sizes="91vw" width={1672} height={941} loading="lazy" decoding="async" alt="A quiet pedestrian street with a café entrance, outdoor tables and greenery just ahead." onError={() => setSceneError(true)} onLoad={() => setSceneError(false)} />
      </picture>
      {sceneError && <div className={styles.sceneError}><p>The street scene could not load.</p><button onClick={() => { setSceneError(false); setGeneration(value => value + 1); }}>Retry scene</button><p>You can still explore every scenario below.</p></div>}
      {!sceneError && <><span className={styles.sceneLabel}>Everyday / a moment in the city</span><div className={styles.hud} aria-hidden="true">{scenario === "translation" && <div className={styles.menuOverlay}><small>Sample menu / {status === "ready" ? "English" : "Français"}</small><p>{status === "ready" ? "Coffee" : "Café"}<span>3.00</span></p><p>{status === "ready" ? "Tea" : "Thé"}<span>3.50</span></p><p>Croissant<span>2.80</span></p></div>}<div className={styles.hudCard}><span>{current.symbol}</span><div><small>OLVR / {current.label}</small><p>{status === "ready" ? current.mark : "Context, when you ask."}</p></div></div></div>{view === "olvr" && <button type="button" className={styles.target} onClick={respond} aria-disabled={status === "responding"} aria-label={`Request ${current.label.toLowerCase()} context`}><span aria-hidden="true">+</span></button>}</>}
      <figcaption className="sr-only">Illustrative street scene. All guidance and recognition are scripted concept demonstrations.</figcaption>
    </figure>
    <div className={styles.context}>
      <div><p className={styles.eyebrow}>Try OLVR / {current.label}</p><h3>{current.title}</h3><p className={styles.intro}>Switch your view. Ask for context. Stay in the moment.</p><button className={styles.ask} onClick={respond} disabled={status === "responding"}>{status === "responding" ? "Preparing context…" : current.prompt}<span aria-hidden="true">↗</span></button></div>
      <div className={styles.response}><p className={styles.eyebrow}>Context</p><p role="status" aria-live="polite" aria-atomic="true" className={styles.answer}>{status === "ready" ? current.answer : status === "responding" ? "Preparing a scripted response…" : "Choose an action to reveal a little more about this scene."}</p>
        {scenario === "translation" && <div className={styles.menu}><p>Sample café menu <span>{status === "ready" ? "English" : "Français"}</span></p><dl><div><dt>{status === "ready" ? "Coffee" : "Café"}</dt><dd>3.00</dd></div><div><dt>{status === "ready" ? "Tea" : "Thé"}</dt><dd>3.50</dd></div><div><dt>Croissant</dt><dd>2.80</dd></div></dl></div>}
        <button className={styles.reset} onClick={reset}>Reset experience <span aria-hidden="true">↺</span></button>
      </div>
    </div>
    <p className={styles.note}>Scripted concept demo. No camera, location or live AI is used. Menu and prices are illustrative.</p>
    <noscript><p className={styles.note}>Enable JavaScript to switch views and explore the scripted scenarios.</p></noscript>
  </section>;
}
