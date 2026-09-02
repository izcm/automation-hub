// Icons — the app imports from here, not from lucide (or elsewhere) directly.
// To swap a lucide icon, change only the right-hand side; call sites stay the same.
export {
  LogOut,
  Car,
  Truck,
  Sun as LightTheme,
  Moon as DarkTheme,
  Check as Confirm,
  X as Cancel,
  X as Failure,
  Check as Success,
  Search as Lookup,
  SlidersHorizontal as Filter,
  Send as Notify,
  ArrowLeft as Back,
  ChevronDown,
  ChevronLeft as Prev,
  ChevronRight as Next,
  ChevronRight,
  Plus,
  PanelRightOpen as OpenWorkspaceOverlay,
  ClipboardList as Inspection,
  Fuel,
  Settings as Transmission,
  Armchair as Seat,
  Mail,
  LockKeyhole as Lock,
  Copy,
  Pencil as Edit,
  ExternalLink,
  User,
  Calendar,
  Bell as Notification,
} from "lucide-react";

// custom, non-lucide icons
export function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="21"
      viewBox="0 0 21 21"
      className={className}
    >
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}
