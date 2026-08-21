import type { ResourceManagementLabels } from "@/components/organisms/ResourceManagementView";
import type { Language } from "@/features/language/field-config";

export const RESOURCE_FIELD_LABELS = {};

// UI copy — one place for every display string, per language.
// Interpolated strings are functions so they stay easy to adjust.
const en = {
  appTitle: "Drift",

  home: {
    tagline: "Keep track of vehicles and upcoming EU Inspections.",
    goToEuInspections: "EU Inspections",
    goToVehicles: "Vehicles",
  },

  header: {
    heading: "Upcoming EU Inspections",
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
    searchPlaceholder: "Search plate number, set timespan...",
    filter: "Filter",
    newVehicle: "New Vehicle",
  },

  vehicles: {
    heading: "Vehicles",
    searchPlaceholder: "Search by vehicle type...",
  },

  list: {
    euDate: "EU date",
    selected: (n: number) => `${n} selected`,
    clearSelection: "Clear selection",
    notify: (n: number) => `Notify ${n} drivers`,
    showing: (from: number, to: number, total: number) =>
      `Showing ${from}–${to} of ${total}`,
  },

  modal: {
    cancel: "Cancel",
  },

  workspace: {
    eyebrow: "Vehicle",
    seats: (n: number) => `${n} seats`,
    details: {
      identity: "identification",
      specs: "specifications",
    },
    fields: {
      vin: "VIN",
      registration: "Registration",
      firstRegistered: "First registered",
      euDate: "EU date",
      lastEuApproved: "Last EU approved",
      type: "Type",
      body: "Body",
      color: "Color",
      fuel: "Fuel",
      transmission: "Transmission",
      seats: "Seats",
    },
  },
};

const no: typeof en = {
  appTitle: "Drift",

  home: {
    tagline: "Hold oversikt over kjøretøy og kommende EU-kontroller.",
    goToEuInspections: "EU-kontroller",
    goToVehicles: "Kjøretøy",
  },

  header: {
    heading: "Kommende EU-kontroller",
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
    searchPlaceholder: "Søk registreringsnummer, angi tidsrom...",
    filter: "Filter",
    newVehicle: "Nytt kjøretøy",
  },

  vehicles: {
    heading: "Kjøretøy",
    searchPlaceholder: "Søk etter kjøretøytype...",
  },

  list: {
    euDate: "EU-frist",
    selected: (n: number) => `${n} valgt`,
    clearSelection: "Fjern valg",
    notify: (n: number) => `Varsle ${n} sjåfører`,
    showing: (from: number, to: number, total: number) =>
      `Viser ${from}–${to} av ${total}`,
  },

  modal: {
    cancel: "Avbryt",
  },

  workspace: {
    eyebrow: "Kjøretøy",
    seats: (n: number) => `${n} seter`,
    details: {
      identity: "identifikasjon",
      specs: "spesifikasjoner",
    },
    fields: {
      vin: "VIN",
      registration: "Registrering",
      firstRegistered: "Første registrering",
      euDate: "EU-frist",
      lastEuApproved: "Sist godkjent EU-kontroll",
      type: "Type",
      body: "Karosseri",
      color: "Farge",
      fuel: "Drivstoff",
      transmission: "Girkasse",
      seats: "Seter",
    },
  },
};

export const CORE_UI_LABELS_BY_LANGUAGE = { en, no } satisfies Record<
  Language,
  typeof en
>;

// Reusable ResourceManagementView labels (currently the EU-inspection copy).
export function getListViewLabels(
  language: Language,
): ResourceManagementLabels {
  const l = CORE_UI_LABELS_BY_LANGUAGE[language];

  return {
    searchBar: {
      placeholder: l.toolbar.searchPlaceholder,
      apply: l.toolbar.apply,
      filter: l.toolbar.filter,
    },
    batching: {
      selected: l.list.selected,
      clearSelection: l.list.clearSelection,
    },
    pagination: {
      showing: l.list.showing,
    },
  };
}
