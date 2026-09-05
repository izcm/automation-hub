import { AppModal } from "@/features/ui/AppModal";

type Props = {
  isOpen: boolean;
  alternativeReceiver?: string;
  onSkip: () => void;
  onSendToInbox: () => void;
};

export function DemoEmailModal({
  isOpen,
  alternativeReceiver,
  onSkip,
  onSendToInbox,
}: Props) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onSkip}
      title={alternativeReceiver ? "Receive to your inbox?" : "Just a reminder"}
      actions={
        alternativeReceiver
          ? [
              { label: "No thanks", onClick: onSkip },
              {
                label: "Send to my inbox",
                variant: "primary",
                onClick: onSendToInbox,
              },
            ]
          : [{ label: "Got it", variant: "primary", onClick: onSkip }]
      }
    >
      {alternativeReceiver ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-subtle max-w-sm">
            We&apos;ll send the notification to{" "}
            <span className="font-medium text-fg">{alternativeReceiver}</span>
            .
          </p>
          <p className="text-sm text-subtle max-w-sm">
            If you choose no, we&apos;ll send it to{" "}
            <strong className="font-semibold text-fg">IZBLOCKS</strong> junk
            inbox instead.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-subtle max-w-sm">
            If you log in with Microsoft, we can send notifications straight
            to your own inbox.
          </p>
          <p className="text-sm text-subtle max-w-sm">
            For now, we&apos;ll send them to{" "}
            <strong className="font-semibold text-fg">IZBLOCKS</strong> junk
            inbox instead.
          </p>
        </div>
      )}
    </AppModal>
  );
}
