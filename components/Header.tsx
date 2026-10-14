"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Header.module.css";

export function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", dismiss); document.removeEventListener("pointerdown", outside); };
  }, [open]);

  function navigate(id: string) {
    setOpen(false);
    requestAnimationFrame(() => document.getElementById(id)?.focus({ preventScroll: true }));
  }

  return <header className={styles.header} ref={header}>
    <a className={styles.wordmark} href="#top" aria-label="OLVR ONE home">OLVR<span>ONE</span><i aria-hidden="true" /></a>
    <button className={styles.toggle} ref={toggle} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? "Close menu" : "Menu"}<span aria-hidden="true">{open ? "−" : "+"}</span></button>
    <nav id="primary-navigation" aria-label="Main navigation" className={`${styles.nav} ${open ? styles.open : ""}`}>
      <a href="#design" onClick={() => navigate("design-title")}>Design</a>
      <a href="#experience" onClick={() => navigate("experience-title")}>Experience</a>
      <a href="#hardware" onClick={() => navigate("hardware-title")}>Hardware</a>
      <a className={styles.choose} href="#configure" onClick={() => navigate("configure-title")}>Make it yours <span aria-hidden="true">↗</span></a>
    </nav>
  </header>;
}
