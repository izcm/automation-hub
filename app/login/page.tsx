import { BackdropLayout } from "@/components/organisms/BackdropLayout";
import { LoginModal } from "@/components/molecules/LoginModal";

export default function Login() {
  return (
    <BackdropLayout>
      <LoginModal containerClassName="max-w-sm landing-surface" />
    </BackdropLayout>
  );
}
