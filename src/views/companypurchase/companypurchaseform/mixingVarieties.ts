export type MixingVariety = {
  key: string;
  label: string;
  bagsField: string;
  weightField: string;
  /* total weight the backend stores for the variety, kept only to strip it */
  weightTotalField: string;
};

/**
 * Backend field names are case sensitive — `CalpetBags`/`RecycleLLDBags`/`PlainBags`
 * start with a capital letter, `lottereneBags`/`masterbatchBags` with a small one.
 * A wrong case makes the backend ignore the field.
 */
export const MIXING_VARIETIES: MixingVariety[] = [
  {
    key: "masterbatch",
    label: "Masterbatch",
    bagsField: "masterbatchBags",
    weightField: "masterbatchBagsWeight",
    weightTotalField: "weightMasterbatch",
  },
  {
    key: "lotterene",
    label: "Lotterene",
    bagsField: "lottereneBags",
    weightField: "lottereneBagsWeight",
    weightTotalField: "weightLotterene",
  },
  {
    key: "recycleLLD",
    label: "Recycle LLD",
    bagsField: "RecycleLLDBags",
    weightField: "RecycleLLDBagsWeight",
    weightTotalField: "weightRecycleLLD",
  },
  {
    key: "plain",
    label: "Plain",
    bagsField: "PlainBags",
    weightField: "PlainBagsWeight",
    weightTotalField: "weightPlain",
  },
  {
    key: "calpet",
    label: "Calpet",
    bagsField: "CalpetBags",
    weightField: "CalpetBagsWeight",
    weightTotalField: "weightCalpet",
  },
];

export const PURE_BAG_WEIGHT = 25;

export const toNumber = (value: unknown) => Number(value) || 0;

/* Every variety field, defaulted to 0 — used to seed the form values. */
export const emptyMixingVarietyValues = () =>
  MIXING_VARIETIES.reduce<Record<string, number>>((values, variety) => {
    values[variety.bagsField] = 0;
    values[variety.weightField] = 0;
    return values;
  }, {});

/* On edit, tick the varieties the saved record actually used. */
export const selectedVarietiesFromData = (data: Record<string, any> = {}) =>
  MIXING_VARIETIES.filter(
    (variety) =>
      toNumber(data[variety.bagsField]) > 0 ||
      toNumber(data[variety.weightField]) > 0 ||
      toNumber(data[variety.weightTotalField]) > 0
  ).map((variety) => variety.key);
