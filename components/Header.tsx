"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
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

  function navigate(event: MouseEvent<HTMLAnchorElement>, hash: string, id: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setOpen(false);
    window.location.hash = hash;
    requestAnimationFrame(() => document.getElementById(id)?.focus({ preventScroll: true }));
  }

  return <header className={styles.header} ref={header}>
    <a className={styles.wordmark} href="#top" aria-label="OLVR ONE home">OLVR<span>ONE</span><i aria-hidden="true" /></a>
    <button className={styles.toggle} ref={toggle} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>{open ? "Close menu" : "Menu"}<span aria-hidden="true">{open ? "−" : "+"}</span></button>
    <nav id="primary-navigation" aria-label="Main navigation" className={`${styles.nav} ${open ? styles.open : ""}`}>
      <a href="#design" onClick={event => navigate(event, "design", "design-title")}>Design</a>
      <a href="#experience" onClick={event => navigate(event, "experience", "experience-title")}>Experience</a>
      <a href="#hardware" onClick={event => navigate(event, "hardware", "hardware-title")}>Hardware</a>
      <a className={styles.choose} href="#configure" onClick={event => navigate(event, "configure", "configure-title")}>Make it yours <span aria-hidden="true">↗</span></a>
    </nav>
  </header>;
}
