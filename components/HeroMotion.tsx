"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroMotion.module.css";

export function HeroMotion() {
  const mark = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    void import("gsap").then(({ gsap }) => {
      if (cancelled || !mark.current) return;
      const match = gsap.matchMedia();
      match.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(mark.current, { scaleX: .15, opacity: .2 }, { scaleX: 1, opacity: .9, duration: 1.1, ease: "power2.out" });
      });
      cleanup = () => match.revert();
    });
    return () => { cancelled = true; cleanup?.(); };
  }, []);
  return <span ref={mark} className={styles.light} aria-hidden="true" />;
}
