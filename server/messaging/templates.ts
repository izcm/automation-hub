export const MESSAGE_USE_CASES = ["eu-control-reminder"] as const;

export type MessageUseCase = (typeof MESSAGE_USE_CASES)[number];

export function euControlReminder(plateNumber: string, euDate: string) {
  return {
    subject: `EU-kontroll – ${plateNumber}`,

    text: `Kjøretøy ${plateNumber} har EU-kontroll ${euDate}.`,

    html: `
      <h2>EU-kontroll nærmer seg</h2>
      <p>
        Kjøretøy <strong>${plateNumber}</strong>
        har EU-kontroll ${euDate}.
      </p>
    `,
  };
}
