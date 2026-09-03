"use client";

import { Checkbox } from "@a2zb/react";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import { EU_INSPECTION_FILTER_LABELS_BY_LANGUAGE } from "@/features/eu-inspections/labels/filters";
import type { Language } from "@/features/labels";
import { MultiSelectDropdown } from "@/components/molecules";

const EMPLOYEES = ["empl 1", "empl 2", "empl 3"];

function VerticalDivider() {
  return (
    <div className="py-2">
      <div className="vertical-line" />
    </div>
  );
}

type Props = {
  filters: Record<string, string[]>;
  toggleFilter: (key: string, value: string) => void;
  resetFilters: () => void;
};

export function FilterMenu({ filters, toggleFilter, resetFilters }: Props) {
  const language = useLanguage() as Language;
  const FILTER_UI_LABELS = EU_INSPECTION_FILTER_LABELS_BY_LANGUAGE[language];

  const isChecked = (key: string, value: string) =>
    filters[key]?.includes(value) ?? false;

  const today = new Date().toLocaleDateString("nb-NO"); // "20.08.2026"

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="flex gap-6 flex-1">
        <div className="flex flex-col gap-2 w-1/4 pb-2">
          <span className="text-xs font-semibold text-subtle tracking-lg">
            {FILTER_UI_LABELS.headings.responsible.toUpperCase()}
          </span>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 text-sm text-fg">
                <Checkbox
                  checked={isChecked("responsible", "me")}
                  onChange={() => toggleFilter("responsible", "me")}
                />
                {FILTER_UI_LABELS.responsible.me}
              </label>

              <label className="flex items-center gap-2 text-sm text-fg">
                <Checkbox
                  checked={isChecked("responsible", "all_others")}
                  onChange={() => toggleFilter("responsible", "all_others")}
                />
                {FILTER_UI_LABELS.responsible.others}
              </label>
            </div>

            <MultiSelectDropdown
              options={EMPLOYEES}
              selected={filters["responsible"] ?? []}
              onToggle={(employee) => toggleFilter("responsible", employee)}
              placeholder="Search employees"
            />
          </div>
        </div>

        <VerticalDivider />

        <div className="flex flex-col gap-2 w-1/4 pb-3">
          <span className="text-xs font-semibold text-subtle tracking-lg">
            {FILTER_UI_LABELS.headings.status.toUpperCase()}
          </span>
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm text-fg">
              <Checkbox
                checked={filters["date"]?.includes(`<${today}`) ?? false}
                onChange={() => {
                  toggleFilter("date", `<${today}`);
                }}
              />
              {FILTER_UI_LABELS.status.overdue}
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="horizontal-line" />

        <button
          onClick={resetFilters}
          className="btn self-end text-subtle text-[13px] p-0 px-2"
        >
          Empty filters
        </button>
      </div>
    </div>
  );
}
