import { DAY_OPTIONS, STORE_ITEM_TYPE, TournamentOptions } from "@/constants/app.constant";

export const storeItemTypesOptions = [
  { value: STORE_ITEM_TYPE.GOLD, label: "Gold" },
  { value: STORE_ITEM_TYPE.BUNDLE, label: "Bundle" },
  { value: STORE_ITEM_TYPE.CHIPS, label: "Chips" },
];

export const tournamentOption = [
  { value: TournamentOptions.ACTIVE, label: "Active" },
  { value: TournamentOptions.PAST, label: "Past" }
];

export const dayTypeOptions = [
  { value: DAY_OPTIONS.DAILY, label: "Daily" },
  { value: DAY_OPTIONS.WEEKLY, label: "Weekly" },

  { value: DAY_OPTIONS.MONTHLY, label: "Monthly" },
  { value: DAY_OPTIONS.YEARLY, label: "Yearly" },
];
