"use client";
import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="bg-ink text-white rounded-chip px-6 py-3 font-medium hover:bg-graphite transition"
    >
      Entrar con Google
    </button>
  );
}
