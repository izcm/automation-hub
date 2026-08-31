import { BackdropLayout } from "@/components/organisms/BackdropLayout";
import { LoginModal } from "@/components/molecules/LoginModal";

export default function Login() {
  return (
    <BackdropLayout>
      <LoginModal
        containerClassName="max-w-sm bg-elevated"
        endpoints={{
          oidcLogin: "/api/auth/login",
          demoLogin: "/api/auth/demo",
        }}
        successRedirectPath="/"
      />
    </BackdropLayout>
  );
}
