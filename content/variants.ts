export type Frame = "obsidian" | "titanium" | "sand";
export type Lens = "clear" | "sun" | "adaptive";
export type VariantId = `${Frame}-${Lens}`;
export const frames = [
  { id: "obsidian", label: "Obsidian", swatch: "#373832", description: "Deep graphite", material: "matte graphite" },
  { id: "titanium", label: "Titanium", swatch: "#93948b", description: "Brushed silver tones", material: "brushed titanium gray" },
  { id: "sand", label: "Sand", swatch: "#c9b798", description: "Warm mineral tones", material: "matte sand beige" },
] as const;
export const lenses = [
  { id: "clear", label: "Clear", description: "A clear perspective", material: "transparent lenses" },
  { id: "sun", label: "Sun", description: "A quieter shade", material: "dark smoke lenses" },
  { id: "adaptive", label: "Adaptive", description: "A softer point of view", material: "fixed lightly tinted lenses, simulating an adaptive appearance" },
] as const;
export const variants = frames.flatMap(frame => lenses.map(lens => ({
  id: `${frame.id}-${lens.id}` as VariantId, frame: frame.id, lens: lens.id,
  label: `${frame.label} / ${lens.label}`, description: `${frame.description}. ${lens.description}.`,
  alt: `OLVR ONE concept glasses with a ${frame.material} frame and ${lens.material}, viewed from the front at a slight angle.`, swatch: frame.swatch,
})));
export const defaultVariant = variants[0];
