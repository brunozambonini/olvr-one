"use client";

import { useState } from "react";
import styles from "./HardwareDetail.module.css";

const details = [
  {
    id: "lens",
    number: "01",
    label: "Lens rim",
    title: "A softer edge.",
    description: "The beveled rim gives the concept a familiar eyewear silhouette. The image is a form study, not a tested optical design.",
  },
  {
    id: "aperture",
    number: "02",
    label: "Camera aperture",
    title: "A considered opening.",
    description: "The circular detail suggests a camera in the frame. The scenes on this site use scripted responses; no camera is active here.",
  },
  {
    id: "hinge",
    number: "03",
    label: "Hinge seam",
    title: "Part of the silhouette.",
    description: "The seam marks the transition from frame to temple. Its appearance is conceptual; a working hinge has not been engineered.",
  },
] as const;

export function HardwareDetail() {
  const [selected, setSelected] = useState<(typeof details)[number]["id"] | null>(null);
  const current = details.find((detail) => detail.id === selected);

  return (
    <figure className={styles.figure}>
      <div className={styles.visual}>
        <picture>
          <source type="image/avif" srcSet="/images/design-macro-640.avif 640w, /images/design-macro-960.avif 960w, /images/design-macro-1440.avif 1440w" sizes="(max-width: 760px) calc(100vw - 48px), 45vw" />
          <img src="/images/design-macro-960.webp" srcSet="/images/design-macro-640.webp 640w, /images/design-macro-960.webp 960w, /images/design-macro-1440.webp 1440w" sizes="(max-width: 760px) calc(100vw - 48px), 45vw" width={1672} height={941} alt="Macro view of the conceptual OLVR ONE frame, showing the lens rim, circular camera aperture and hinge seam." loading="lazy" decoding="async" />
        </picture>
        {details.map((detail) => (
          <button
            className={`${styles.hotspot} ${styles[detail.id]} ${selected === detail.id ? styles.active : ""}`}
            key={detail.id}
            type="button"
            aria-label={`Explore ${detail.label.toLowerCase()}`}
            aria-pressed={selected === detail.id}
            aria-controls="hardware-detail-note"
            onClick={() => setSelected(detail.id)}
          >
            <span aria-hidden="true">+</span>
          </button>
        ))}
      </div>
      <figcaption className={styles.caption}>Form study / Select a detail on the frame</figcaption>
      <div className={styles.note} id="hardware-detail-note" aria-live="polite" aria-atomic="true">
        {current ? (
          <div key={current.id}>
            <span className={styles.index}>{current.number} / {current.label}</span>
            <h3>{current.title}</h3>
            <p>{current.description}</p>
          </div>
        ) : (
          <p>Select a point on the image to explore the concept details.</p>
        )}
      </div>
    </figure>
  );
}
