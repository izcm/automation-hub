import type { ResourceManagementLabels } from "@/components/organisms/ResourceManagementView";

// UI copy — one place for every display string.
// Interpolated strings are functions so they stay easy to adjust.
export const LABELS = {
  appTitle: "Mile",

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
} as const;

// Reusable ResourceManagementView labels (currently the EU-inspection copy).
export const listViewLabels: ResourceManagementLabels = {
  searchBar: {
    placeholder: LABELS.toolbar.searchPlaceholder,
    apply: LABELS.toolbar.apply,
    filter: LABELS.toolbar.filter,
  },
  batching: {
    selected: LABELS.list.selected,
    clearSelection: LABELS.list.clearSelection,
  },
  pagination: {
    showing: LABELS.list.showing,
  },
};
