export const MESSAGE_USE_CASES = ["eu-inspection-reminder"] as const;

export type MessageUseCase = (typeof MESSAGE_USE_CASES)[number];

export function euInspectionReminder(plateNumber: string, euDate: string) {
  return {
    subject: `EU Inspection – ${plateNumber}`,

    text: `Vehicle ${plateNumber} has EU Inspection ${euDate}.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 560px;
        margin: 0 auto;
        padding: 32px;
        color: #18181b;
      ">
        <h1 style="
          font-size: 22px;
          margin: 0 0 24px;
        ">
          EU Inspection approaching
        </h1>

        <p style="
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 24px;
        ">
          The following vehicle has an upcoming EU Inspection:
        </p>

        <div style="
          background: #f4f4f5;
          border-radius: 8px;
          padding: 20px;
        ">
          <div style="
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
          ">
            ${plateNumber}
          </div>

          <div style="
            font-size: 14px;
            color: #52525b;
          ">
            Inspection deadline
          </div>

          <div style="
            font-size: 16px;
            font-weight: 500;
            margin-top: 4px;
          ">
            ${euDate}
          </div>
        </div>

        <p style="
          font-size: 13px;
          color: #71717a;
          margin-top: 32px;
        ">
          This is an automatic reminder.
        </p>
      </div>
    `,
  };
}
