// UI copy — one place for every display string.
// Interpolated strings are functions so they stay easy to adjust.
export const LABELS = {
  appTitle: "Roady",

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
