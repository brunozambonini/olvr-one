"use client";

/* Build-generated responsive images are served as static files. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import styles from "./ProductInspection.module.css";

const views = [
  { name: "Front", id: "inspection-front", alt: "Concept render of OLVR ONE Obsidian / Clear glasses viewed from the front." },
  { name: "Three-quarter", id: "obsidian-clear", alt: "Concept render of OLVR ONE Obsidian / Clear glasses at a three-quarter angle." },
  { name: "Side", id: "inspection-side", alt: "Concept render of OLVR ONE Obsidian / Clear glasses from the right side." },
] as const;

type LoadState = "ready" | "loading" | "error";

export function ProductInspection() {
  const [index, setIndex] = useState(1);
  const [loadState, setLoadState] = useState<LoadState>("ready");
  const [requested, setRequested] = useState(1);
  const [highlight, setHighlight] = useState(0);
  const request = useRef(0);
  const startX = useRef<number | null>(null);

  async function show(nextIndex: number) {
    const target = Math.max(0, Math.min(views.length - 1, nextIndex));
    const token = ++request.current;
    setRequested(target);
    if (target === index && loadState !== "error") {
      setLoadState("ready");
      return;
    }
    setLoadState("loading");
    const next = new Image();
    next.decoding = "async";
    next.src = `/images/${views[target].id}-960.webp`;
    try {
      await next.decode();
      if (token !== request.current) return;
      setIndex(target);
      setLoadState("ready");
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setHighlight(token);
    } catch {
      if (token === request.current) setLoadState("error");
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const from = startX.current;
    startX.current = null;
    if (from === null) return;
    const distance = event.clientX - from;
    if (Math.abs(distance) >= 48) void show(index + (distance < 0 ? 1 : -1));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      void show(index + (event.key === "ArrowRight" ? 1 : -1));
    }
  }

  return <div className={styles.inspection} aria-labelledby="inspection-title">
    <div className={styles.copy}>
      <span className={styles.kicker}>A closer look / 2.5D study</span>
      <h3 id="inspection-title">Every angle has a point of view.</h3>
      <p>Drag to explore three concept renders of Obsidian / Clear. Other finishes remain available in the configurator above.</p>
    </div>
    <div className={styles.viewer}>
      <div className={styles.stage} role="group" aria-label="Obsidian / Clear product views" aria-describedby="inspection-help" tabIndex={0} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { startX.current = null; }} onKeyDown={onKeyDown}>
        <img src={`/images/${views[index].id}-960.webp`} srcSet={`/images/${views[index].id}-640.webp 640w, /images/${views[index].id}-960.webp 960w, /images/${views[index].id}-1440.webp 1440w`} sizes="(max-width: 760px) calc(100vw - 48px), 60vw" width={1672} height={941} loading="lazy" decoding="async" alt={views[index].alt} draggable={false} onError={() => setLoadState("error")} />
        {highlight > 0 && <span key={highlight} className={styles.light} aria-hidden="true" />}
        <span className={styles.angle} aria-hidden="true">0{index + 1} / 03</span>
      </div>
      <div className={styles.below}>
        <p id="inspection-help">Swipe or drag the image; use left/right arrow keys when focused.</p>
        <div className={styles.buttons} aria-label="Choose a view">
          {views.map((view, viewIndex) => <button key={view.id} type="button" className={viewIndex === index ? styles.active : ""} aria-pressed={viewIndex === index} onClick={() => void show(viewIndex)}>{view.name}</button>)}
        </div>
      </div>
      <p className={styles.status} aria-live="polite">{loadState === "loading" ? `Loading ${views[requested].name} view.` : loadState === "error" ? `Could not load ${views[requested].name} view. Still showing ${views[index].name}. Select a view to retry.` : `${views[index].name} view, Obsidian / Clear.`}</p>
    </div>
  </div>;
}
