/**
 * Client ke mutabiq kaunsi mixing variety kis product me use hoti hai:
 *  - Lotterene, Recycle LLD  -> sirf poleythene
 *  - Plain, Calpet           -> sirf hydensity
 *  - Masterbatch             -> dono
 *
 * Keys backend ke sale-side field names hain (case sensitive).
 */
export const VARIETY_LABELS: Record<string, string> = {
  weightmasterbatch: "Masterbatch",
  weightlotterene: "Lotterene",
  weightRecycleLLD: "Recycle LLD",
  weightPlain: "Plain",
  weightCalpet: "Calpet",
};

export const PRODUCT_VARIETY_KEYS: Record<string, string[]> = {
  poleythene: ["weightlotterene", "weightRecycleLLD", "weightmasterbatch"],
  hydensity: ["weightCalpet", "weightPlain", "weightmasterbatch"],
};

/* Jahan product ki selection hi nahi hoti (jaise bill screen), wahan saari
   varieties dikhti hain. */
export const ALL_VARIETY_KEYS = [
  "weightmasterbatch",
  "weightlotterene",
  "weightRecycleLLD",
  "weightPlain",
  "weightCalpet",
];

export const summaryVarietyKeys = (product?: string | null) =>
  PRODUCT_VARIETY_KEYS[product || ""] || ALL_VARIETY_KEYS;

export const varietyKeysForProduct = (product?: string | null) =>
  PRODUCT_VARIETY_KEYS[product || ""] || PRODUCT_VARIETY_KEYS.poleythene;

export const varietyColumnsForProduct = (product?: string | null) =>
  varietyKeysForProduct(product).map((key) => ({
    field: key,
    header: VARIETY_LABELS[key] || key,
  }));
