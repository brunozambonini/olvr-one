"use client";

import { useState } from "react";
import styles from "./HeroVision.module.css";

export function HeroVision() {
  const [active, setActive] = useState(false);

  return (
    <div className={styles.vision}>
      <div className={`${styles.overlay} ${active ? styles.active : ""}`} aria-hidden={!active}>
        <span className={styles.reticle} aria-hidden="true" />
        <div className={styles.readout}>
          <span className={styles.kicker}>OLVR / Concept view</span>
          <span className={styles.message}>A little more context.<br />Right when you need it.</span>
          <span className={styles.disclaimer}>Illustrative interface · No live sensing</span>
        </div>
      </div>
      <button
        className={styles.toggle}
        type="button"
        aria-pressed={active}
        aria-label={active ? "Turn off simulated OLVR vision" : "Turn on simulated OLVR vision"}
        onClick={() => setActive((current) => !current)}
      >
        <span className={styles.toggleIcon} aria-hidden="true"><span /></span>
        <span>{active ? "Back to the world" : "See through OLVR"}</span>
      </button>
    </div>
  );
}
