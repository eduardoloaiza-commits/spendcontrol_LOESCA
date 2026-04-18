"use client";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl px-6 py-4 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
    >
      <LogIn size={18} />
      Entrar con Google
    </button>
  );
}
