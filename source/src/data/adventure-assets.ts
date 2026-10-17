// Assets visuels de l'aventure (illustrations dans public/adventure).
export const PANORAMA = { file: "panorama.webp", width: 1600, height: 1057 };
export const HEROINE = "heroine.webp";
export const COMPANION = "compagnon.webp";
export const COMPANION_NAME = "Mimi";

/** Construit l'URL d'un asset de l'aventure à partir de BASE_URL */
export function adventureAsset(file: string, base: string = import.meta.env?.BASE_URL ?? "/") {
  return `${base.replace(/\/?$/, "/")}adventure/${file}`;
}
