import type { ResourceManagementLabels } from "@/components/organisms/ResourceManagementView";

export type Language = "en" | "no";

// UI copy — one place for every display string, per language.
// Interpolated strings are functions so they stay easy to adjust.
const en = {
  appTitle: "Drift",

  home: {
    goToEuInspections: "EU Inspections",
    goToVehicles: "Vehicles",
  },

  header: {
    back: "Back",
    menu: "Menu",
    logOut: "Log Out",
  },

  theme: {
    toLight: "Light mode",
    toDark: "Dark mode",
  },

  toolbar: {
    apply: "Apply",
    filter: "Filter",
  },

  list: {
    selected: (n: number) => `${n} selected`,
    clearSelection: "Clear selection",
    showing: (from: number, to: number, total: number) =>
      `Showing ${from}–${to} of ${total}`,
  },

  toggle: {
    enable: "Enable",
    disable: "Disable",
  },

  batchSelect: {
    label: "batch select",
  },
};

const no: typeof en = {
  appTitle: "Drift",

  home: {
    goToEuInspections: "EU-kontroller",
    goToVehicles: "Kjøretøy",
  },

  header: {
    back: "Tilbake",
    menu: "Meny",
    logOut: "Logg ut",
  },

  theme: {
    toLight: "Lys modus",
    toDark: "Mørk modus",
  },

  toolbar: {
    apply: "Bruk",
    filter: "Filter",
  },

  list: {
    selected: (n: number) => `${n} valgt`,
    clearSelection: "Fjern valg",
    showing: (from: number, to: number, total: number) =>
      `Viser ${from}–${to} av ${total}`,
  },

  toggle: {
    enable: "Slå på",
    disable: "Slå av",
  },

  batchSelect: {
    label: "flervalg",
  },
};

export const CORE_UI_LABELS_BY_LANGUAGE = { en, no } satisfies Record<
  Language,
  typeof en
>;

// Reusable ResourceManagementView labels — shared across any list view.
// Each page passes its own search placeholder text.
export function getListViewLabels(
  language: Language,
  searchPlaceholder: string,
): ResourceManagementLabels {
  const l = CORE_UI_LABELS_BY_LANGUAGE[language];

  return {
    searchBar: {
      placeholder: searchPlaceholder,
      apply: l.toolbar.apply,
      filter: l.toolbar.filter,
    },
    batching: {
      selected: l.list.selected,
      clearSelection: l.list.clearSelection,
      enableMobile: `${l.toggle.enable} ${l.batchSelect.label}`,
      disableMobile: `${l.toggle.disable} ${l.batchSelect.label}`,
    },
    pagination: {
      showing: l.list.showing,
    },
  };
}
