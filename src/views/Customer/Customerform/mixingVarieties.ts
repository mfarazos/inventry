export type MixingVariety = {
  key: string;
  label: string;
  weightField: string;
};

/**
 * Sale side me bags nahi hote — seedha weight jata hai.
 * Field names case sensitive hain: `weightRecycleLLD`/`weightPlain`/`weightCalpet`
 * bare letter se, `weightlotterene`/`weightmasterbatch` pooray chote letter se.
 * Case galat hua to backend field ignore kar deta hai.
 */
export const MIXING_VARIETIES: MixingVariety[] = [
  { key: "masterbatch", label: "Masterbatch", weightField: "weightmasterbatch" },
  { key: "lotterene", label: "Lotterene", weightField: "weightlotterene" },
  { key: "recycleLLD", label: "Recycle LLD", weightField: "weightRecycleLLD" },
  { key: "plain", label: "Plain", weightField: "weightPlain" },
  { key: "calpet", label: "Calpet", weightField: "weightCalpet" },
];

export const toNumber = (value: unknown) => Number(value) || 0;

/* Every variety weight, defaulted to 0 — used to seed the form values. */
export const emptyMixingVarietyValues = () =>
  MIXING_VARIETIES.reduce<Record<string, number>>((values, variety) => {
    values[variety.weightField] = 0;
    return values;
  }, {});

/* On edit, tick the varieties the saved record actually used. */
export const selectedVarietiesFromData = (data: Record<string, any> = {}) =>
  MIXING_VARIETIES.filter(
    (variety) => toNumber(data[variety.weightField]) > 0
  ).map((variety) => variety.key);
