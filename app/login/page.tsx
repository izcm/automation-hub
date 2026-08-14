import { LoginModal } from "@/components/molecules/LoginModal";

export default function Login() {
  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      {/* background — image swaps with the active theme */}
      <div className="landing-bg absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat" />

      {/* subtle black wash */}
      <div className="absolute inset-0 -z-10 bg-black/20" />

      <LoginModal />
    </main>
  );
}
